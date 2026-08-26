#!/usr/bin/env python3
"""Safe, resumable PocketBase -> Supabase migration skeleton.

The script reads a PocketBase SQLite database directly, stages rows into
migration staging tables, and preserves source lineage. It does NOT delete or
modify PocketBase data. Production writes require DATABASE_URL or Supabase
server credentials supplied outside Git.

Usage:
  python tools/migrate_pocketbase_to_supabase.py --sqlite /path/pb_data/data.db --dry-run
  python tools/migrate_pocketbase_to_supabase.py --sqlite /path/pb_data/data.db --apply

For Excel, use the same staging contract: source_file -> import_batch ->
stg_import_row -> validation/conflict -> commit. Do not bypass staging.
"""
from __future__ import annotations

import argparse
import json
import os
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path


def utcnow() -> str:
    return datetime.now(timezone.utc).isoformat()


def discover_collections(conn: sqlite3.Connection):
    rows = conn.execute("""
        select name from sqlite_master
        where type='table' and name not like 'sqlite_%'
        order by name
    """).fetchall()
    return [r[0] for r in rows]


def read_rows(conn: sqlite3.Connection, table: str):
    safe = '"' + table.replace('"', '""') + '"'
    cur = conn.execute(f"select * from {safe}")
    columns = [d[0] for d in cur.description]
    for row in cur.fetchall():
        yield dict(zip(columns, row))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--sqlite", required=True)
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--report", default="migration-report.json")
    args = parser.parse_args()

    db = Path(args.sqlite)
    if not db.exists():
        raise SystemExit(f"SQLite database not found: {db}")
    if args.apply and not os.environ.get("DATABASE_URL") and not os.environ.get("SUPABASE_URL"):
        raise SystemExit("--apply requires DATABASE_URL or SUPABASE_URL supplied via environment")

    conn = sqlite3.connect(db)
    conn.row_factory = sqlite3.Row
    tables = discover_collections(conn)
    batch_id = str(uuid.uuid4())
    report = {
        "migration_batch_id": batch_id,
        "source": str(db),
        "started_at": utcnow(),
        "apply": args.apply,
        "tables": [],
        "warnings": [],
    }

    for table in tables:
        rows = list(read_rows(conn, table))
        report["tables"].append({"source_table": table, "rows": len(rows)})
        # Serialize only metadata to avoid putting production data in logs.
        print(f"{table}: {len(rows)} rows")

    report["finished_at"] = utcnow()
    Path(args.report).write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(f"Report written to {args.report}")
    if not args.apply:
        print("DRY-RUN: no destination writes were performed.")
    else:
        print("APPLY requested. Destination adapter must be configured for the exact authoritative schema before writes.")


if __name__ == "__main__":
    main()
