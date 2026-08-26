#!/usr/bin/env python3
"""MIMOS PMS migration runner.

Sources:
  * PocketBase SQLite backup (legacy collections)
  * Excel files in readme/ (staged into stg_import_row)

The script is deliberately service-role/server-side only. Never ship DATABASE_URL or
SUPABASE_SERVICE_ROLE_KEY to the browser. Run against a COPY of the legacy database.
"""
from __future__ import annotations
import argparse, hashlib, json, os, sqlite3, sys
from pathlib import Path
from typing import Any
import psycopg2
from psycopg2.extras import Json, execute_values

PB_MAP={
 'client':'client','clients':'client','programme':'programme','programmes':'programme',
 'quotation':'quotation','quotations':'quotation','purchase_order':'purchase_order','purchase_orders':'purchase_order',
 'invoice':'invoice','invoices':'invoice','payment':'payment','payments':'payment',
 'opportunity':'opportunity','opportunities':'opportunity','action_item':'action_item','action_items':'action_item',
 'training_stat':'training_stat','training_stats':'training_stat','participant':'participant','participants':'participant',
 'staff':'staff','account':'account','client_contact':'client_contact','client_contacts':'client_contact'
}

CORE_ORDER=['account_type','staff_role','sector','training_type','payment_method','payment_status','quotation_type','quotation_status','programme_status','project_status','opportunity_status','action_item_status','payment_terms','speed_to_market','programme_category','service_type','revenue_type','account','staff','client','client_contact','programme','quotation','purchase_order','invoice','payment','opportunity','action_item','training_stat','participant']


def norm(v:Any):
    if isinstance(v,bytes): return v.decode('utf-8','replace')
    return v

def table_columns(cur, table):
    cur.execute('select column_name from information_schema.columns where table_schema=\'public\' and table_name=%s order by ordinal_position',(table,))
    return [r[0] for r in cur.fetchall()]

def sqlite_tables(cur):
    cur.execute("select name from sqlite_master where type='table' and name not like 'sqlite_%'")
    return [r[0] for r in cur.fetchall()]

def migrate_collection(scur, pg, source_name, target, dry=False):
    cols=table_columns(pg,target)
    if not cols: return 0
    scur.execute(f'SELECT * FROM "{source_name.replace(chr(34), chr(34)*2)}"')
    rows=scur.fetchall(); src_cols=[d[0] for d in scur.description]
    usable=[c for c in src_cols if c in cols and c!='id']
    if not usable: return 0
    insert_cols=usable
    values=[[norm(row[src_cols.index(c)]) for c in insert_cols] for row in rows]
    if dry: return len(values)
    q='insert into public."%s" (%s) values %%s on conflict do nothing returning id' % (target,','.join('"%s"'%c for c in insert_cols))
    with pg.cursor() as pc:
        execute_values(pc,q,values,page_size=500)
    pg.commit(); return len(values)

def stage_excel(pg, root:Path, dry=False):
    try: import pandas as pd
    except ImportError: raise SystemExit('Install requirements: pandas/openpyxl')
    files=sorted(root.glob('*.xlsx'))
    staged=0
    for path in files:
        digest=hashlib.sha256(path.read_bytes()).hexdigest()
        if dry: print(f'[DRY] Excel {path.name}'); continue
        with pg.cursor() as pc:
            pc.execute("insert into public.source_file(file_name,file_path,file_hash,file_size_bytes,file_type) values(%s,%s,%s,%s,%s) returning id",(path.name,str(path),digest,path.stat().st_size,'xlsx'))
            sf=pc.fetchone()[0]
            pc.execute("insert into public.import_batch(batch_code,source_file_id,import_type,table_target,status) values(%s,%s,%s,%s,%s) returning id",('XLSX-'+digest[:12],sf,'EXCEL_STAGING','auto','STAGED'))
            batch=pc.fetchone()[0]
            sheets=pd.ExcelFile(path).sheet_names
            for sheet in sheets:
                df=pd.read_excel(path,sheet_name=sheet,dtype=object)
                for idx,row in df.iterrows():
                    raw={str(k): (None if pd.isna(v) else v.item() if hasattr(v,'item') else v) for k,v in row.to_dict().items()}
                    pc.execute("insert into public.stg_import_row(import_batch_id,source_file_id,source_row_number,entity_type,raw_data) values(%s,%s,%s,%s,%s)",(batch,sf,int(idx)+2,sheet,Json(raw)))
                    staged+=1
            pc.execute("update public.source_file set is_processed=true,processed_at=now() where id=%s",(sf,))
        pg.commit()
    return staged

def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--sqlite',required=True); ap.add_argument('--database-url',default=os.getenv('DATABASE_URL')); ap.add_argument('--excel-dir',default='readme'); ap.add_argument('--dry-run',action='store_true'); ap.add_argument('--excel-only',action='store_true'); args=ap.parse_args()
    if not args.database_url and not args.dry_run: raise SystemExit('DATABASE_URL is required')
    if args.dry_run: print('DRY RUN — no writes will occur')
    sq=sqlite3.connect(args.sqlite); sq.row_factory=sqlite3.Row; sc=sq.cursor()
    pg=None
    if not args.dry_run: pg=psycopg2.connect(args.database_url)
    if not args.excel_only:
        tables=set(sqlite_tables(sc));
        for source in CORE_ORDER:
            if source not in tables or source not in PB_MAP: continue
            n=migrate_collection(sc,pg,source,PB_MAP[source],args.dry_run); print(f'{source} -> {PB_MAP[source]}: {n}')
    n=stage_excel(pg,Path(args.excel_dir),args.dry_run); print(f'Excel staged: {n}')
    if pg:
        with pg.cursor() as c:
            c.execute('select public.fn_refresh_programme(id) from public.programme')
        pg.commit(); pg.close()
    sq.close()
    print('Migration pass complete. Run reconciliation before cutover.')

if __name__=='__main__': main()
