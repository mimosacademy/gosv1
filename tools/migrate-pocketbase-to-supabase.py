#!/usr/bin/env python3
"""Migrate a PocketBase SQLite backup into the Supabase/PostgreSQL schema.

The tool is conservative: it exports source snapshots, never deletes the source,
loads parent entities before children, records legacy->new IDs, and reports rows
that cannot be mapped automatically. Existing Supabase Auth users are matched by
email so business foreign keys can point to real auth.users UUIDs.

Usage:
  python tools/migrate-pocketbase-to-supabase.py \
    --sqlite /backups/pb_data/data.db \
    --database-url 'postgresql://...'
"""
from __future__ import annotations

import argparse
import json
import sqlite3
import sys
from datetime import datetime, timezone
from decimal import Decimal
from pathlib import Path
from typing import Any

try:
    import psycopg
    from psycopg import sql
except ImportError:
    print('Install dependencies first: python -m pip install -r tools/requirements.txt', file=sys.stderr)
    raise

SOURCE = 'pocketbase'
TABLES = {
    'clients': 'clients', 'client_contacts': 'client_contacts', 'opportunities': 'opportunities',
    'programmes': 'programmes', 'quotations': 'quotations', 'purchase_orders': 'purchase_orders',
    'training_delivery': 'training_delivery', 'training_statistics': 'training_statistics',
    'participants': 'participants', 'invoices': 'invoices', 'payments': 'payments',
    'action_items': 'action_items', 'documents': 'documents', 'audit_history': 'audit_history',
}
ORDER = ['clients','programmes','opportunities','quotations','purchase_orders','training_delivery',
         'training_statistics','participants','invoices','payments','action_items','documents',
         'audit_history','client_contacts']
RELATIONS = {
    'client': ('clients', 'client_id'),
    'programme': ('programmes', 'programme_id'),
    'linkedProgramme': ('programmes', 'linked_programme_id'),
    'opportunity': ('opportunities', 'opportunity_id'),
    'quotation': ('quotations', 'quotation_id'),
    'invoice': ('invoices', 'invoice_id'),
}
COLUMN_MAP = {
    'createdBy':'created_by','updatedBy':'updated_by','startDate':'start_date','endDate':'end_date',
    'contractValue':'contract_value','sessionsPlanned':'sessions_planned','sessionsDelivered':'sessions_delivered',
    'expectedClose':'expected_close','programmeCode':'programme_code','quoteNo':'quote_no',
    'programmeTitle':'programme_title','issueDate':'issue_date','validUntil':'valid_until','preparedBy':'prepared_by',
    'poNo':'po_no','receivedDate':'received_date','deliveryDate':'delivery_date','deliveryTime':'delivery_time',
    'trainingType':'training_type_id','lastSession':'last_session','attendanceRate':'attendance_rate',
    'completionRate':'completion_rate','avgScore':'avg_score','npsScore':'nps_score','invoiceNo':'invoice_no',
    'paidAmount':'paid_amount','dueDate':'due_date','paymentNo':'payment_no','paymentDate':'payment_date',
    'paymentMethod':'payment_method_id','paymentStatus':'payment_status_id','relatedTo':'related_to',
    'documentType':'document_type','storagePath':'storage_path','uploadedBy':'uploaded_by','fileSize':'file_size',
}


def json_default(value: Any) -> Any:
    if isinstance(value, Decimal): return str(value)
    if isinstance(value, datetime): return value.isoformat()
    if isinstance(value, bytes): return value.decode('utf-8', errors='replace')
    raise TypeError(type(value).__name__)


def table_exists(conn: sqlite3.Connection, name: str) -> bool:
    return conn.execute("select 1 from sqlite_master where type='table' and name=?", (name,)).fetchone() is not None


def rows(conn: sqlite3.Connection, name: str) -> list[dict[str, Any]]:
    conn.row_factory = sqlite3.Row
    return [dict(r) for r in conn.execute(f'select * from "{name}"').fetchall()]


def clean(value: Any) -> Any:
    return value if not isinstance(value, str) or value != '' else None


def insert_row(pg: psycopg.Connection, table: str, payload: dict[str, Any]) -> int:
    payload = {k:v for k,v in payload.items() if v is not None}
    if not payload: raise ValueError(f'No insertable fields for {table}')
    cols = list(payload)
    query = sql.SQL('insert into {} ({}) values ({}) returning id').format(
        sql.Identifier('public', table), sql.SQL(',').join(map(sql.Identifier, cols)),
        sql.SQL(',').join(sql.Placeholder() for _ in cols))
    with pg.cursor() as cur:
        cur.execute(query, [payload[c] for c in cols])
        return int(cur.fetchone()[0])


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--sqlite', required=True, type=Path)
    parser.add_argument('--database-url', required=True)
    parser.add_argument('--export-dir', type=Path, default=Path('migration-export'))
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()
    if not args.sqlite.exists():
        print(f'SQLite backup not found: {args.sqlite}', file=sys.stderr); return 2

    args.export_dir.mkdir(parents=True, exist_ok=True)
    sqlite = sqlite3.connect(args.sqlite)
    report = {'started_at':datetime.now(timezone.utc).isoformat(),'tables':{},'warnings':[]}

    for source_name in TABLES:
        if not table_exists(sqlite, source_name):
            report['warnings'].append(f'Missing collection: {source_name}'); continue
        source_rows = rows(sqlite, source_name)
        (args.export_dir/f'{source_name}.json').write_text(json.dumps(source_rows,ensure_ascii=False,default=json_default,indent=2),encoding='utf-8')
        report['tables'][source_name]={'source_rows':len(source_rows),'inserted':0,'errors':[]}

    users = rows(sqlite,'users') if table_exists(sqlite,'users') else []
    (args.export_dir/'users.json').write_text(json.dumps([
        {'legacy_id':u.get('id'),'email':u.get('email'),'name':u.get('name'),'role':u.get('role')}
        for u in users],ensure_ascii=False,indent=2),encoding='utf-8')
    if users: report['warnings'].append('User passwords are not migrated. Supabase Auth accounts must already exist or be provisioned separately.')

    if args.dry_run:
        print(json.dumps(report,ensure_ascii=False,indent=2)); return 0

    id_maps: dict[tuple[str,str],int] = {}
    with psycopg.connect(args.database_url) as pg:
        # Map legacy PocketBase user IDs to existing Supabase auth UUIDs by email.
        staff_maps: dict[str,str] = {}
        with pg.cursor() as cur:
            cur.execute('select id::text,email from public.profiles where email is not null')
            by_email = {str(email).lower(): str(uid) for uid,email in cur.fetchall()}
        for u in users:
            email = str(u.get('email') or '').lower()
            if email and email in by_email: staff_maps[str(u.get('id'))] = by_email[email]
            elif u.get('id'): report['warnings'].append(f'No Supabase profile for legacy user {u.get("email")}')

        for source_name in ORDER:
            if not table_exists(sqlite,source_name): continue
            target = TABLES[source_name]
            for source_row in rows(sqlite,source_name):
                legacy_id = str(source_row.get('id'))
                try:
                    payload: dict[str,Any] = {}
                    for key,value in source_row.items():
                        if key in {'id','created','updated'} or value in ('',None): continue
                        if key in RELATIONS:
                            parent_entity, pg_col = RELATIONS[key]
                            payload[pg_col] = id_maps.get((parent_entity,str(value)))
                        elif key in {'createdBy','updatedBy','uploadedBy'}:
                            mapped = staff_maps.get(str(value))
                            if mapped: payload[COLUMN_MAP[key]] = mapped
                        elif key == 'date' and target == 'training_delivery': payload['delivery_date']=clean(value)
                        elif key == 'date' and target == 'payments': payload['payment_date']=clean(value)
                        elif key == 'date' and target == 'documents': payload['document_date']=clean(value)
                        elif key == 'user' and target == 'audit_history': payload['actor_id']=staff_maps.get(str(value))
                        elif key in COLUMN_MAP: payload[COLUMN_MAP[key]]=clean(value)
                        else: payload[key]=clean(value)

                    # PB JSON-ish fields can arrive as strings; keep them as JSON when target expects jsonb.
                    for json_col in ('metadata','payload'):
                        if json_col in payload and isinstance(payload[json_col],str):
                            try: payload[json_col]=json.loads(payload[json_col])
                            except json.JSONDecodeError: payload[json_col]={'raw':payload[json_col]}

                    new_id=insert_row(pg,target,payload)
                    id_maps[(source_name,legacy_id)]=new_id
                    with pg.cursor() as cur:
                        cur.execute('''insert into public.migration_id_map(source_system,entity_type,legacy_id,target_id)
                                       values(%s,%s,%s,%s)
                                       on conflict(source_system,entity_type,legacy_id) do update set target_id=excluded.target_id''',
                                    (SOURCE,source_name,legacy_id,new_id))
                    pg.commit(); report['tables'][source_name]['inserted']+=1
                except Exception as exc:
                    pg.rollback(); report['tables'][source_name]['errors'].append({'legacy_id':legacy_id,'error':str(exc)})

        try:
            with pg.cursor() as cur: cur.execute('select public.refresh_all_financials()')
            pg.commit()
        except Exception as exc:
            pg.rollback(); report['warnings'].append(f'Financial refresh failed: {exc}')

    report['finished_at']=datetime.now(timezone.utc).isoformat()
    report['id_mappings']=len(id_maps)
    (args.export_dir/'migration-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False,indent=2))
    return 0 if not any(t['errors'] for t in report['tables'].values()) else 1

if __name__ == '__main__': raise SystemExit(main())
