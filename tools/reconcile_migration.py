#!/usr/bin/env python3
"""Post-migration reconciliation report. Server-side only."""
import argparse, sqlite3, psycopg2

TABLES=['account','staff','client','client_contact','programme','quotation','purchase_order','invoice','payment','opportunity','action_item','training_stat','participant']

def main():
 ap=argparse.ArgumentParser(); ap.add_argument('--sqlite',required=True); ap.add_argument('--database-url',required=True); args=ap.parse_args()
 sq=sqlite3.connect(args.sqlite); pg=psycopg2.connect(args.database_url); sc=sq.cursor(); pc=pg.cursor()
 print('ENTITY | LEGACY | TARGET | DELTA')
 for t in TABLES:
  try: sc.execute(f'SELECT count(*) FROM "{t}"'); legacy=sc.fetchone()[0]
  except sqlite3.Error: continue
  pc.execute(f'SELECT count(*) FROM public."{t}"'); target=pc.fetchone()[0]
  print(f'{t:16} | {legacy:7} | {target:6} | {target-legacy:+d}')
 pc.execute("select coalesce(sum(total_incl_tax),0),coalesce(sum(amount_collected),0),coalesce(sum(amount_outstanding),0) from public.invoice where not is_cancelled and not is_placeholder")
 print('SUPABASE INVOICE TOTALS:',pc.fetchone())
 pc.execute("select coalesce(sum(amount),0) from public.payment")
 print('SUPABASE PAYMENT TOTAL:',pc.fetchone()[0])
 pc.execute("select count(*) from public.data_conflict where resolution='PENDING'")
 print('PENDING CONFLICTS:',pc.fetchone()[0])
 pc.execute("select count(*) from public.stg_import_row where validation_status='PENDING'")
 print('UNVALIDATED STAGING ROWS:',pc.fetchone()[0])
 pg.close(); sq.close()
if __name__=='__main__': main()
