import { supabase } from './src/lib/supabase';

async function test() {
  const { data, error } = await supabase.from('project_assignments').select('*').limit(1);
  console.log("Assignments table:", error ? error.message : "Exists!");
  const { data: devs, error: dErr } = await supabase.from('developers').select('*').limit(1);
  console.log("Developers table:", dErr ? dErr.message : "Exists!");
}

test();
