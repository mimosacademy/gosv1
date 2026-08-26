#!/usr/bin/env python3
"""Stage the authoritative Excel source files stored under readme/ into Supabase.

This is intentionally a STAGING importer: it never writes directly into
programme/invoice/payment/etc. It records source-file hash, import batch and
raw row lineage in source_file/import_batch/stg_import_row. Promotion into
business tables is a separate, validated step.

Required environment:
  SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY

Optional:
  GITHUB_REF=main
  GITHUB_REPO=mimosacademy/gosv1

Install:
  pip install -r tools/requirements-import.txt
"""
from __future__ import annotations

import hashlib
import io
import os
import re
import uuid
from datetime import datetime, timezone
from urllib.request import Request, urlopen

import pandas as pd
from supabase import create_client

REPO = os.getenv('GITHUB_REPO', 'mimosacademy/gosv1')
REF = os.getenv('GITHUB_REF', 'main')
BASE = f'https://raw.githubusercontent.com/{REPO}/{REF}/readme/'

SOURCES = [
    ('R1 MIMOS_Academy_INCOME_STATEMENT.xlsx', 'R1', 'invoice'),
    ('invoice_2026.xlsx', 'INVOICE_2026', 'invoice'),
    ('cost_of_sales_2026.xlsx', 'COST_OF_SALES_2026', 'invoice_cost'),
    ('R2 Overall Report 2026 (1).xlsx', 'R2', 'training_stat'),
    ('R3 Group 2026 Funnel Tracker.xlsx', 'R3', 'opportunity'),
    ('sales_report_2026-08-19.xlsx', 'SALES_SNAPSHOT', 'opportunity'),
    ('office_funnel_2026-08-19.xlsx', 'OFFICE_FUNNEL', 'action_item'),
    ('00. Quotation Tracker (1).xlsx', 'QUOTATION', 'quotation'),
]


def now():
    return datetime.now(timezone.utc).isoformat()


def fetch(name: str) -> bytes:
    req = Request(BASE + name.replace(' ', '%20'), headers={'User-Agent': 'mimos-pms-migration/1.0'})
    with urlopen(req, timeout=60) as r:
        return r.read()


def normalize(value):
    if pd.isna(value):
        return None
    if isinstance(value, pd.Timestamp):
        return value.isoformat()
    if hasattr(value, 'item'):
        try:
            value = value.item()
        except Exception:
            pass
    return value


def safe_json(row):
    out = {}
    for k, v in row.items():
        key = re.sub(r'\s+', '_', str(k).strip().lower())
        out[key] = normalize(v)
    return out


def main():
    url = os.environ.get('SUPABASE_URL')
    key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
    if not url or not key:
        raise SystemExit('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
    sb = create_client(url, key)

    for filename, import_type, entity_type in SOURCES:
        content = fetch(filename)
        digest = hashlib.sha256(content).hexdigest()
        source = sb.table('source_file').select('id').eq('file_hash', digest).limit(1).execute()
        existing = getattr(source, 'data', None) or []
        if existing:
            print(f'SKIP already staged: {filename}')
            continue

        sf = sb.table('source_file').insert({
            'file_name': filename,
            'file_path': f'readme/{filename}',
            'file_hash': digest,
            'file_size_bytes': len(content),
            'file_type': 'xlsx',
            'upload_date': now(),
            'description': f'Authoritative migration source: {import_type}',
            'is_processed': False,
        }).execute()
        source_id = sf.data[0]['id']
        batch_code = f'README-{import_type}-{uuid.uuid4().hex[:8].upper()}'
        batch = sb.table('import_batch').insert({
            'batch_code': batch_code,
            'source_file_id': source_id,
            'import_type': import_type,
            'table_target': entity_type,
            'status': 'STAGING',
            'start_time': now(),
            'created_at': now(),
            'updated_at': now(),
            'notes': 'Raw Excel staging; no business-table promotion performed.',
        }).execute()
        batch_id = batch.data[0]['id']

        workbook = pd.ExcelFile(io.BytesIO(content), engine='openpyxl')
        total = 0
        for sheet in workbook.sheet_names:
            frame = pd.read_excel(io.BytesIO(content), sheet_name=sheet, engine='openpyxl', dtype=object)
            rows = []
            for offset, (_, row) in enumerate(frame.iterrows(), start=2):
                raw = safe_json(row.to_dict())
                # Business key is deliberately conservative; the promotion step
                # computes entity-specific composite keys from normalized fields.
                rows.append({
                    'import_batch_id': batch_id,
                    'source_file_id': source_id,
                    'source_row_number': offset,
                    'entity_type': entity_type,
                    'raw_data': raw,
                    'normalized_data': raw,
                    'validation_status': 'PENDING',
                    'validation_errors': [],
                })
            for start in range(0, len(rows), 500):
                sb.table('stg_import_row').insert(rows[start:start+500]).execute()
            total += len(rows)

        sb.table('import_batch').update({
            'records_total': total,
            'status': 'STAGED',
            'end_time': now(),
            'updated_at': now(),
        }).eq('id', batch_id).execute()
        print(f'STAGED {filename}: {total} rows, batch={batch_code}')


if __name__ == '__main__':
    main()
