import supabase from './supabaseClient';

export function subscribeToTable(table, callback, filter) {
  let channel = supabase.channel(`realtime:${table}:${crypto.randomUUID()}`)
    .on('postgres_changes', { event: '*', schema: 'public', table, ...(filter ? { filter } : {}) }, callback)
    .subscribe();

  return () => {
    if (channel) supabase.removeChannel(channel);
    channel = null;
  };
}
