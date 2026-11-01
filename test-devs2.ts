import { supabase } from './src/lib/supabase';
import { saveDevelopersToSupabase } from './src/lib/supabase';

async function test() {
  const devs = [
    { id: 'dev_123', name: 'Test Dev New', role: 'Tester', maxWeeklyHours: 40 }
  ];
  
  const res = await saveDevelopersToSupabase(devs);
  console.log(res);
}

test();
