#!/usr/bin/env python3
"""Migrate a PocketBase SQLite backup into the Supabase/PostgreSQL schema.

This tool is intentionally conservative: it never deletes source data, writes an
export JSON snapshot, records legacy->new IDs, loads parent tables before children,
and reports rows that cannot be mapped automatically.

Requirements: Python 3.11+ and psycopg 3.x.

Usage:
  python tools/migrate-pocketbase-to-supabase.py \
    --sqlite /backups/pb_data/data.db \
    --database-url 'postgresql://...'

The DATABASE_URL must be a server-side PostgreSQL connection string. Never use a
Supabase service_role key in browser code.
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

# PocketBase collection -> PostgreSQL table. Only business collections are loaded.
TABLES = {
    'clients': 'clients',
    'client_contacts': 'client_contacts',
    'opportunities': 'opportunities',
    'programmes': 'programmes',
    'quotations': 'quotations',
    'purchase_orders': 'purchase_orders',
    'training_delivery': 'training_delivery',
    'training_statistics': 'training_statistics',
    'participants': 'participants',
    'invoices': 'invoices',
    'payments': 'payments',
    'action_items': 'action_items',
    'documents': 'documents',
    'audit_history': 'audit_history',
}

ORDER = [
    'clients', 'programmes', 'opportunities', 'quotations', 'purchase_orders',
    'training_delivery', 'training_statistics', 'participants', 'invoices',
    'payments', 'action_items', 'documents', 'audit_history', 'client_contacts',
]

RELATIONS = {
    'client': 'client_id',
    'programme': 'programme_id',
    'linkedProgramme': 'linked_programme_id',
    'opportunity': 'opportunity_id',
    'quotation': 'quotation_id',
    'invoice': 'invoice_id',
}

COLUMN_MAP = {
    'client': 'client_id', 'createdBy': 'created_by', 'updatedBy': 'updated_by',
    'startDate': 'start_date', 'endDate': 'end_date', 'contractValue': 'contract_value',
    'sessionsPlanned': 'sessions_planned', 'sessionsDelivered': 'sessions_delivered',
    'expectedClose': 'expected_close', 'programmeCode': 'programme_code',
    'linkedProgramme': 'linked_programme_id', 'quoteNo': 'quote_no',
    'programmeTitle': 'programme_title', 'issueDate': 'issue_date', 'validUntil': 'valid_until',
    'preparedBy': 'prepared_by', 'poNo': 'po_no', 'receivedDate': 'received_date',
    'programme': 'programme_id', 'deliveryDate': 'delivery_date', 'deliveryTime': 'delivery_time',
    'trainingType': 'training_type_id', 'lastSession': 'last_session', 'attendanceRate': 'attendance_rate',
    'completionRate': 'completion_rate', 'avgScore': 'avg_score', 'npsScore': 'nps_score',
    'invoiceNo': 'invoice_no', 'paidAmount': 'paid_amount', 'dueDate': 'due_date',
    'paymentNo': 'payment_no', 'paymentDate': 'payment_date', 'paymentMethod': 'payment_method_id',
    'paymentStatus': 'payment_status_id', 'relatedTo': 'related_to', 'dueDate': 'due_date',
    'documentType': 'document_type', 'storagePath': 'storage_path', 'uploadedBy': 'uploaded_by',
    'fileSize': 'file_size', 'timestamp': 'created_at',
}


def json_default(value: Any) -> Any:
    if isinstance(value, Decimal): return str(value)
    if isinstance(value, (datetime,)):
        return value.isoformat()
    if isinstance(value, bytes): return value.decode('utf-8', errors='replace')
    raise TypeError(type(value).__name__)


def table_exists(conn: sqlite3.Connection, name: str) -> bool:
    return conn.execute("select 1 from sqlite_master where type='table' and name=?", (name,)).fetchone() is not None


def columns(conn: sqlite3.Connection, name: str) -> list[str]:
    return [r[1] for r in conn.execute(f'pragma table_info("{name}")').fetchall()]


def rows(conn: sqlite3.Connection, name: str) -> list[dict[str, Any]]:
    conn.row_factory = sqlite3.Row
    return [dict(r) for r in conn.execute(f'select * from "{name}"').fetchall()]


def clean(value: Any) -> Any:
    if isinstance(value, str):
        return value if value != '' else None
    return value


def transform(row: dict[str, Any], target: str, id_maps: dict[tuple[str, str], int], staff_maps: dict[str, str]) -> dict[str, Any]:
    out: dict[str, Any] = {}
    for key, value in row.items():
        if key in {'id', 'created', 'updated'}:
            continue
        col = COLUMN_MAP.get(key, key)
        if key in RELATIONS:
            col = RELATIONS[key]
            value = id_maps.get((key.lower(), str(value))) if value else None
        if key in {'createdBy', 'updatedBy', 'uploadedBy'}:
            value = staff_maps.get(str(value)) if value else None
        if col.endswith('_id') and key not in RELATIONS and value:
            value = id_maps.get((key.lower(), str(value)), value)
        out[col] = clean(value)

    # PocketBase uses a text field named date in several collections.
    if target == 'training_delivery' and 'date' in row:
        out['delivery_date'] = clean(row['date'])
    if target == 'payments' and 'date' in row:
        out['payment_date'] = clean(row['date'])
    if target == 'documents' and 'date' in row:
        out['document_date'] = clean(row['date'])
    if target == 'audit_history' and 'user' in row:
        out['actor_id'] = staff_maps.get(str(row['user'])) if row['user'] else None
    return out


def insert_row(pg: psycopg.Connection, table: str, payload: dict[str, Any]) -> int:
    payload = {k: v for k, v in payload.items() if k != 'id' and k is not None}
    if not payload:
        raise ValueError(f'No insertable fields for {table}')
    cols = list(payload)
    query = sql.SQL('insert into {} ({}) values ({}) returning id').format(
        sql.Identifier('public', table),
        sql.SQL(',').join(map(sql.Identifier, cols)),
        sql.SQL(',').join(sql.Placeholder() for _ in cols),
    )
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
        print(f'SQLite backup not found: {args.sqlite}', file=sys.stderr)
        return 2

    args.export_dir.mkdir(parents=True, exist_ok=True)
    sqlite = sqlite3.connect(args.sqlite)
    id_maps: dict[tuple[str, str], int] = {}
    staff_maps: dict[str, str] = {}
    report = {'started_at': datetime.now(timezone.utc).isoformat(), 'tables': {}, 'warnings': []}

    # Export source snapshots first. This is the audit-friendly rollback artefact.
    for source_name in TABLES:
        if not table_exists(sqlite, source_name):
            report['warnings'].append(f'Missing PocketBase collection: {source_name}')
            continue
        source_rows = rows(sqlite, source_name)
        (args.export_dir / f'{source_name}.json').write_text(json.dumps(source_rows, ensure_ascii=False, default=json_default, indent=2), encoding='utf-8')
        report['tables'][source_name] = {'source_rows': len(source_rows), 'inserted': 0, 'errors': []}

    # Build staff lookup from the PocketBase users auth collection. Passwords are never copied.
    if table_exists(sqlite, 'users'):
        for user in rows(sqlite, 'users'):
            staff_maps[str(user['id'])] = str(user['id'])  # resolved to auth UUID only when pre-provisioned
        (args.export_dir / 'users.json').write_text(json.dumps([
            {'id': u.get('id'), 'email': u.get('email'), 'name': u.get('name'), 'role': u.get('role')}
            for u in rows(sqlite, 'users')
        ], ensure_ascii=False, indent=2), encoding='utf-8')
        report['warnings'].append('Users exported without passwords. Provision Supabase Auth users and map their UUIDs before loading created_by fields.')

    if args.dry_run:
        print(json.dumps(report, indent=2))
        return 0

    with psycopg.connect(args.database_url) as pg:
        # Each entity gets a transaction so a bad row does not leave a half-written row.
        for source_name in ORDER:
            if not table_exists(sqlite, source_name):
                continue
            target = TABLES[source_name]
            for source_row in rows(sqlite, source_name):
                legacy_id = str(source_row.get('id'))
                try:
                    payload = transform(source_row, target, id_maps, staff_maps)
                    # Resolve parent references using the source relation value directly.
                    for pb_key, pg_key in RELATIONS.items():
                        if pb_key in source_row and source_row[pb_key]:
                            mapped = id_maps.get((pb_key.lower(), str(source_row[pb_key])))
                            payload[pg_key] = mapped
                    new_id = insert_row(pg, target, payload)
                    id_maps[(source_name, legacy_id)] = new_id
                    # Also index relation lookups by their common PocketBase field names.
                    id_maps[(source_name.rstrip('s'), legacy_id)] = new_id
                    with pg.cursor() as cur:
                        cur.execute(
                            'insert into public.migration_id_map(source_system,entity_type,legacy_id,target_id) values(%s,%s,%s,%s) on conflict(source_system,entity_type,legacy_id) do update set target_id=excluded.target_id',
                            (SOURCE, source_name, legacy_id, new_id),
                        )
                    report['tables'][source_name]['inserted'] += 1
                    pg.commit()
                except Exception as exc:
                    pg.rollback()
                    report['tables'][source_name]['errors'].append({'legacy_id': legacy_id, 'error': str(exc)})

        # Recalculate invoice states after payment rows exist.
        try:
            with pg.cursor() as cur:
                cur.execute('select public.refresh_all_financials()')
            pg.commit()
        except Exception as exc:
            pg.rollback()
            report['warnings'].append(f'Financial refresh failed: {exc}')

    report['finished_at'] = datetime.now(timezone.utc).isoformat()
    report['id_mappings'] = len(id_maps)
    (args.export_dir / 'migration-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2, default=json_default), encoding='utf-8')
    print(json.dumps(report, ensure_ascii=False, indent=2, default=json_default))
    return 0 if not any(t['errors'] for t in report['tables'].values()) else 1


if __name__ == '__main__':
    raise SystemExit(main())
