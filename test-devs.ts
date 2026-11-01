import { supabase } from './src/lib/supabase';

async function test() {
  const { data: devs } = await supabase.from('developers').select('*');
  console.log("Developers:", devs);
}

test();
