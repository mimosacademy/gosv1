import supabase from './supabaseClient';

export async function list(table, { select='*', page=1, pageSize=50, orderBy='created_at', ascending=false, filters=[] }={}) {
  let q=supabase.from(table).select(select,{count:'exact'});
  for (const f of filters) q=f.operator==='ilike'?q.ilike(f.column,f.value):q.eq(f.column,f.value);
  if (orderBy) q=q.order(orderBy,{ascending});
  const from=(page-1)*pageSize; const to=from+pageSize-1;
  const {data,error,count}=await q.range(from,to); if(error) throw error; return {data:data??[],count:count??0};
}
export async function getById(table,id,select='*'){const {data,error}=await supabase.from(table).select(select).eq('id',id).single();if(error)throw error;return data;}
export async function insert(table,payload){const {data,error}=await supabase.from(table).insert(payload).select().single();if(error)throw error;return data;}
export async function update(table,id,payload){const {data,error}=await supabase.from(table).update(payload).eq('id',id).select().single();if(error)throw error;return data;}
export async function remove(table,id){const {error}=await supabase.from(table).delete().eq('id',id);if(error)throw error;}
export function subscribe(table,onChange){return supabase.channel(`pms:${table}`).on('postgres_changes',{event:'*',schema:'public',table},payload=>onChange(payload)).subscribe();}
export async function uploadDocument(path,file){const {data,error}=await supabase.storage.from('pms-documents').upload(path,file,{upsert:false,contentType:file.type||undefined});if(error)throw error;return data;}
export async function signedDocumentUrl(path,expiresIn=3600){const {data,error}=await supabase.storage.from('pms-documents').createSignedUrl(path,expiresIn);if(error)throw error;return data.signedUrl;}
export async function removeDocument(path){const {error}=await supabase.storage.from('pms-documents').remove([path]);if(error)throw error;}
export default {list,getById,insert,update,remove,subscribe,uploadDocument,signedDocumentUrl,removeDocument};
