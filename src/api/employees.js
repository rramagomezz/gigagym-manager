import { supabase } from '../lib/supabase'

export async function getEmployees() {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('last_name')
  if (error) throw error
  return data
}

export async function createEmployee(employee) {
  const { data, error } = await supabase
    .from('employees')
    .insert(employee)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateEmployee(id, updates) {
  const { data, error } = await supabase
    .from('employees')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteEmployee(id) {
  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', id)
  if (error) throw error
}
