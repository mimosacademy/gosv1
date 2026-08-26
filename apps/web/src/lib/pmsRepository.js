import supabase from './supabaseClient';

const unwrap = ({ data, error }) => {
  if (error) throw error;
  return data;
};

export async function list(table, { select='*', page=1, pageSize=50, orderBy='created_at', ascending=false, filters=[] }={}) {
  let q=supabase.from(table).select(select,{count:'exact'});
  for (const f of filters) {
    if (f.operator==='ilike') q=q.ilike(f.column,f.value);
    else if (f.operator==='in') q=q.in(f.column,f.value);
    else q=q.eq(f.column,f.value);
  }
  if (orderBy) q=q.order(orderBy,{ascending});
  const from=(page-1)*pageSize;
  const to=from+pageSize-1;
  const {data,error,count}=await q.range(from,to);
  if(error) throw error;
  return {data:data??[],count:count??0};
}

export async function getById(table,id,select='*') { return unwrap(await supabase.from(table).select(select).eq('id',id).single()); }
export async function insert(table,payload) { return unwrap(await supabase.from(table).insert(payload).select().single()); }
export async function update(table,id,payload) { return unwrap(await supabase.from(table).update(payload).eq('id',id).select().single()); }
export async function remove(table,id) { return unwrap(await supabase.from(table).delete().eq('id',id)); }

export function subscribe(table,onChange,filter) {
  const name=`pms:${table}:${crypto.randomUUID()}`;
  const config={event:'*',schema:'public',table};
  if(filter) config.filter=filter;
  const channel=supabase.channel(name).on('postgres_changes',config,onChange).subscribe();
  return () => supabase.removeChannel(channel);
}

export async function uploadDocument(file,programmeId) {
  const safe=file.name.replace(/[^a-zA-Z0-9._-]+/g,'_');
  const path=`programmes/${programmeId}/${crypto.randomUUID()}-${safe}`;
  return unwrap(await supabase.storage.from('pms-documents').upload(path,file,{upsert:false,contentType:file.type||'application/octet-stream'}));
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
