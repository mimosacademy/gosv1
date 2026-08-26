#!/usr/bin/env python3
"""Provision staff from User Profiles Mapping.xlsx.

Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY on a trusted machine only.
Existing users are matched by email. New users receive a random password and
must complete a password reset before normal use.
"""
import os, secrets, sys
import pandas as pd
from supabase import create_client

ROLE_MAP={'super admin':'admin','admin':'admin','manager':'staff','pic':'staff','sales':'staff','finance':'staff','trainer':'staff','masb team':'staff','staff':'staff','viewer':'viewer'}

def role(v): return ROLE_MAP.get(str(v).strip().lower(),'staff')

def main(path):
    url=os.environ['SUPABASE_URL']; key=os.environ['SUPABASE_SERVICE_ROLE_KEY']
    if 'service_role' not in key and 'sb_secret_' not in key: print('Warning: expected server-side Supabase secret key',file=sys.stderr)
    sb=create_client(url,key)
    df=pd.read_excel(path,dtype=str).fillna('')
    cols={c.lower().strip():c for c in df.columns}
    email_col=next((cols[x] for x in ['email','email address','e-mail'] if x in cols),None)
    name_col=next((cols[x] for x in ['full name','name','staff name'] if x in cols),None)
    role_col=next((cols[x] for x in ['role','system role','access role'] if x in cols),None)
    if not email_col or not name_col: raise SystemExit(f'Cannot identify email/name columns. Found: {list(df.columns)}')
    for _,r in df.iterrows():
        email=r[email_col].strip().lower(); name=r[name_col].strip(); rrole=role(r[role_col]) if role_col else 'staff'
        if not email: continue
        try:
            res=sb.auth.admin.list_users()
            users=getattr(res,'users',[]) or []
            existing=next((u for u in users if (u.email or '').lower()==email),None)
            if existing: uid=existing.id; print('EXISTS',email)
            else:
                pwd=secrets.token_urlsafe(24)
                created=sb.auth.admin.create_user({'email':email,'password':pwd,'email_confirm':True,'user_metadata':{'full_name':name}})
                uid=created.user.id; print('CREATED',email,'temporary password generated')
            sb.table('profiles').upsert({'id':uid,'email':email,'full_name':name,'role':rrole,'is_active':True}).execute()
        except Exception as e: print('FAILED',email,e,file=sys.stderr)

if __name__=='__main__':
    if len(sys.argv)!=2: raise SystemExit('Usage: provision_staff.py "readme/User Profiles Mapping.xlsx"')
    main(sys.argv[1])
