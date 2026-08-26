#!/usr/bin/env python3
"""Provision Supabase Auth users from User Profiles Mapping.xlsx.

Requires server-side credentials in the environment; never commit them.

ENV:
  SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY
  USER_MAPPING_XLSX (default: readme/User Profiles Mapping.xlsx)
  TEMP_PASSWORD (optional; if omitted, users are invited instead)

The script is intentionally idempotent by email. It creates/updates profiles
using the Auth user's UUID and leaves application authorization to RLS.
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

try:
    import pandas as pd
    from supabase import create_client
except ImportError as exc:
    raise SystemExit("Install dependencies first: pip install supabase pandas openpyxl") from exc

URL = os.environ.get("SUPABASE_URL")
SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
XLSX = Path(os.environ.get("USER_MAPPING_XLSX", "readme/User Profiles Mapping.xlsx"))
TEMP_PASSWORD = os.environ.get("TEMP_PASSWORD")

if not URL or not SERVICE_KEY:
    raise SystemExit("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required")
if not XLSX.exists():
    raise SystemExit(f"Mapping workbook not found: {XLSX}")

sb = create_client(URL, SERVICE_KEY)
df = pd.read_excel(XLSX)
# Normalize headers because Excel workbooks often contain whitespace/case variants.
df.columns = [str(c).strip().lower().replace(" ", "_") for c in df.columns]

email_col = next((c for c in ("email", "email_address") if c in df.columns), None)
name_col = next((c for c in ("full_name", "name", "staff_name") if c in df.columns), None)
role_col = next((c for c in ("role", "user_role", "access_role") if c in df.columns), None)
if not email_col:
    raise SystemExit("Workbook must contain an email column")

ROLE_MAP = {
    "admin": "admin",
    "super admin": "admin",
    "superadmin": "admin",
    "staff": "staff",
    "pic": "staff",
    "pic/staff": "staff",
    "viewer": "viewer",
}

# Supabase Python SDK versions differ in response shape; support common forms.
def users_list():
    response = sb.auth.admin.list_users()
    return getattr(response, "users", None) or getattr(response, "data", None) or []

existing = {u.email.lower(): u for u in users_list() if getattr(u, "email", None)}

for _, row in df.iterrows():
    email = str(row[email_col]).strip().lower()
    if not email or email == "nan":
        continue
    name = str(row[name_col]).strip() if name_col and str(row[name_col]).lower() != "nan" else email
    raw_role = str(row[role_col]).strip().lower() if role_col else "staff"
    role = ROLE_MAP.get(raw_role, raw_role if raw_role in {"admin", "staff", "viewer"} else "staff")

    user = existing.get(email)
    if user:
        user_id = str(user.id)
        sb.auth.admin.update_user_by_id(user_id, {"user_metadata": {"full_name": name, "role": role}})
        action = "updated"
    else:
        payload = {
            "email": email,
            "email_confirm": True,
            "user_metadata": {"full_name": name, "role": role},
        }
        if TEMP_PASSWORD:
            payload["password"] = TEMP_PASSWORD
        else:
            # Invite flow is preferred when no temporary password is supplied.
            payload["email_confirm"] = False
        result = sb.auth.admin.create_user(payload)
        user = getattr(result, "user", None) or getattr(result, "data", None)
        if not user:
            raise RuntimeError(f"Unable to create user: {email}")
        user_id = str(user.id)
        action = "created"

    sb.table("profiles").upsert({
        "id": user_id,
        "full_name": name,
        "role": role,
        "is_active": True,
    }, on_conflict="id").execute()
    print(f"{action}: {email} -> {role} ({user_id})")

print("Auth provisioning complete. Verify counts and roles before data migration.")
