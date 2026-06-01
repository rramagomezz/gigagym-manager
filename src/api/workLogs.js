import { supabase } from '../lib/supabase'

export async function getWorkLogs(employeeId, month, year) {
  let query = supabase
    .from('work_logs')
    .select('*')
    .eq('is_active', false)
    .order('started_at', { ascending: false })

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

export async function startWorkSession(employeeId) {
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('work_logs')
    .insert({
      employee_id: employeeId,
      started_at: now,
      date: now.split('T')[0],
      is_active: true,
      hours: null
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function endWorkSession(id, observations) {
  const now = new Date()
  const { data: session, error: fetchError } = await supabase
    .from('work_logs')
    .select('started_at')
    .eq('id', id)
    .single()
  if (fetchError) throw fetchError

  const durationMinutes = Math.round((now - new Date(session.started_at)) / 60000)

  const { data, error } = await supabase
    .from('work_logs')
    .update({
      ended_at: now.toISOString(),
      is_active: false,
      duration_minutes: durationMinutes,
      notes: observations || null
    })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getActiveSession(employeeId) {
  const { data, error } = await supabase
    .from('work_logs')
    .select('*')
    .eq('employee_id', employeeId)
    .eq('is_active', true)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function getActiveSessions() {
  const { data, error } = await supabase
    .from('work_logs')
    .select('*, employees(first_name, last_name)')
    .eq('is_active', true)
  if (error) throw error
  return data
}

export async function adminEditSession(id, updates) {
  const { data, error } = await supabase
    .from('work_logs')
    .update({ ...updates, edited_by_admin: true })
    .eq('id', id)
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
