import { supabase } from './src/lib/supabase.ts';
async function test() {
  const { data, error } = await supabase.from('project_forecasts').select('*').limit(1);
  console.log(data);
}
test();
