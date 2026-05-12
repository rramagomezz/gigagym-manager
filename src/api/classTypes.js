import { supabase } from '../lib/supabase'

export async function getClassTypes() {
  const { data, error } = await supabase
    .from('class_types')
    .select('*')
    .order('name')
  if (error) throw error
  return data
}

export async function createClassType(classType) {
  const { data, error } = await supabase
    .from('class_types')
    .insert(classType)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateClassType(id, updates) {
  const { data, error } = await supabase
    .from('class_types')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteClassType(id) {
  const { error } = await supabase
    .from('class_types')
    .delete()
    .eq('id', id)
  if (error) throw error
}
