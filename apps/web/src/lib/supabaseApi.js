import supabase from './supabaseClient';

export async function listRecords(table, { select = '*', filters = {}, page = 1, pageSize = 50, orderBy = 'created_at', ascending = false } = {}) {
  let query = supabase.from(table).select(select, { count: 'exact' });
  for (const [column, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') query = query.eq(column, value);
  }
  const from = Math.max(page - 1, 0) * pageSize;
  const { data, error, count } = await query.order(orderBy, { ascending }).range(from, from + pageSize - 1);
  if (error) throw error;
  return { data: data ?? [], count: count ?? 0 };
}

export async function getRecord(table, id, select = '*') {
  const { data, error } = await supabase.from(table).select(select).eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function insertRecord(table, values) {
  const { data, error } = await supabase.from(table).insert(values).select().single();
  if (error) throw error;
  return data;
}

export async function updateRecord(table, id, values) {
  const { data, error } = await supabase.from(table).update(values).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteRecord(table, id) {
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw error;
}

export async function uploadProgrammeDocument(file, programmeId) {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `programmes/${programmeId}/${crypto.randomUUID()}-${safeName}`;
  const { error } = await supabase.storage.from('programme-documents').upload(path, file, { upsert: false });
  if (error) throw error;
  const { data, error: insertError } = await supabase.from('documents').insert({
    programme_id: programmeId,
    name: file.name,
    document_type: file.type || 'application/octet-stream',
    storage_path: path,
    file_size: file.size,
    uploaded_by: (await supabase.auth.getUser()).data.user?.id ?? null,
    created_by: (await supabase.auth.getUser()).data.user?.id ?? null,
  }).select().single();
  if (insertError) throw insertError;
  return data;
}
