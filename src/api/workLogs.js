import { supabase } from '../lib/supabase'

export async function getWorkLogs(employeeId, month, year) {
  let query = supabase
    .from('work_logs')
    .select('*')
    .order('date', { ascending: false })

  if (employeeId) query = query.eq('employee_id', employeeId)
  if (month && year) {
    const from = `${year}-${String(month).padStart(2, '0')}-01`
    const to = `${year}-${String(month).padStart(2, '0')}-31`
    query = query.gte('date', from).lte('date', to)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function createWorkLog(log) {
  const { data, error } = await supabase
    .from('work_logs')
    .insert(log)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteWorkLog(id) {
  const { error } = await supabase
    .from('work_logs')
    .delete()
    .eq('id', id)
  if (error) throw error
}