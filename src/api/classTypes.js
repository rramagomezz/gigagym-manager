import { supabase } from '../lib/supabase'

export async function getClassTypes() {
  const { data, error } = await supabase
    .from('class_types')
    .select('*')
    .order('name')
  if (error) throw error
  return data
}
