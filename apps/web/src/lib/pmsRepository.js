import supabase from './supabaseClient';

const unwrap = ({ data, error }) => {
  if (error) throw error;
  return data;
};

const TABLES = new Set([
  'account','staff','client','client_contact','programme','quotation','purchase_order',
  'invoice','payment','opportunity','action_item','training_stat','participant',
  'source_file','import_batch','stg_import_row','data_conflict','completeness_score',
  'staff_alias','client_alias','audit_log','projects','documents'
]);

function assertTable(table) {
  if (!TABLES.has(table)) throw new Error(`Unsupported PMS table: ${table}`);
}

export async function list(table, { select='*', page=1, pageSize=50, orderBy='created_at', ascending=false, filters=[] }={}) {
  assertTable(table);
  let q=supabase.from(table).select(select,{count:'exact'});
  for (const f of filters) {
    if (f.operator==='ilike') q=q.ilike(f.column,f.value);
    else if (f.operator==='in') q=q.in(f.column,f.value);
    else if (f.operator==='gte') q=q.gte(f.column,f.value);
    else if (f.operator==='lte') q=q.lte(f.column,f.value);
    else if (f.operator==='neq') q=q.neq(f.column,f.value);
    else q=q.eq(f.column,f.value);
  }
  if (orderBy) q=q.order(orderBy,{ascending});
  const from=Math.max(0,(page-1)*pageSize);
  const to=from+pageSize-1;
  const {data,error,count}=await q.range(from,to);
  if(error) throw error;
  return {data:data??[],count:count??0,page,pageSize};
}

export async function getById(table,id,select='*') { assertTable(table); return unwrap(await supabase.from(table).select(select).eq('id',id).single()); }
export async function insert(table,payload) { assertTable(table); return unwrap(await supabase.from(table).insert(payload).select().single()); }
export async function update(table,id,payload) { assertTable(table); return unwrap(await supabase.from(table).update(payload).eq('id',id).select().single()); }
export async function remove(table,id) { assertTable(table); return unwrap(await supabase.from(table).delete().eq('id',id)); }

export function subscribe(table,onChange,filter) {
  assertTable(table);
  const name=`pms:${table}:${crypto.randomUUID()}`;
  const config={event:'*',schema:'public',table};
  if(filter) config.filter=filter;
  const channel=supabase.channel(name).on('postgres_changes',config,onChange).subscribe();
  return () => supabase.removeChannel(channel);
}

export async function uploadDocument(file,programmeId) {
  if (!file || !programmeId) throw new Error('file and programmeId are required');
  const safe=file.name.replace(/[^a-zA-Z0-9._-]+/g,'_');
  const path=`programmes/${programmeId}/${crypto.randomUUID()}-${safe}`;
  const {data,error}=await supabase.storage.from('pms-documents').upload(path,file,{upsert:false,contentType:file.type||'application/octet-stream'});
  if(error) throw error;
  return data;
}
export async function signedDocumentUrl(path,expiresIn=3600) { return unwrap(await supabase.storage.from('pms-documents').createSignedUrl(path,expiresIn)).signedUrl; }
export async function removeDocument(path) { return unwrap(await supabase.storage.from('pms-documents').remove([path])); }

export const dashboards = {
  financial: () => supabase.from('v_financial_dashboard').select('*').then(unwrap),
  r1: () => supabase.from('v_r1_income_statement').select('*').then(unwrap),
  r2: () => supabase.from('v_r2_training_stats').select('*').then(unwrap),
  r3: () => supabase.from('v_r3_funnel_pipeline').select('*').then(unwrap),
  completeness: () => supabase.from('v_programme_completeness').select('*').then(unwrap),
  actionItems: () => supabase.from('v_action_item_dashboard').select('*').then(unwrap),
  collections: () => supabase.from('v_payment_collection').select('*').then(unwrap),
  staffPerformance: () => supabase.from('v_staff_performance').select('*').then(unwrap),
};

export default { list,getById,insert,update,remove,subscribe,uploadDocument,signedDocumentUrl,removeDocument,dashboards };
