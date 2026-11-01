import { supabase } from './src/lib/supabase';

async function test() {
  const { data: devs } = await supabase.from('developers').select('id, name');
  console.log("Developers:", devs);
  
  const { data: projs } = await supabase.from('projects').select('id, name');
  console.log("Projects:", projs);
  
  if (devs?.length && projs?.length) {
    const payload = {
      project_id: projs[0].id,
      developer_id: devs[0].id,
      start_date: '2026-08-01',
      end_date: '2026-08-31',
      allocation_percentage: 100,
      role_in_project: 'Dev'
    };
    console.log("Testing insert:", payload);
    const { error } = await supabase.from('project_assignments').insert([payload]);
    console.log("Error inserting assignment:", error);
  }
}

test();
