import { supabase } from '../lib/supabase'

export async function getClassLogs(employeeId, month, year) {
  let query = supabase
    .from('class_logs')
    .select('*, class_types(*)')
    .order('date', { ascending: false })

  if (employeeId) query = query.eq('employee_id', employeeId)
  if (month && year) {
    const from = `${year}-${String(month).padStart(2, '0')}-01`
    const lastDay = new Date(year, month, 0).getDate()
    const to = `${year}-${String(month).padStart(2, '0')}-${lastDay}`
    query = query.gte('date', from).lte('date', to)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function createClassLog(log) {
  const { data, error } = await supabase
    .from('class_logs')
    .insert(log)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteClassLog(id) {
  const { error } = await supabase
    .from('class_logs')
    .delete()
    .eq('id', id)
  if (error) throw error
}