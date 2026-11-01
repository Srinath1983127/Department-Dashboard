import { saveDevelopersToSupabase } from './src/lib/supabase';

async function test() {
  const devs = [
    { id: 'dev_123', name: 'Dev Insert Fail', role: 'Tester', maxWeeklyHours: 40 }
  ];
  
  const res = await saveDevelopersToSupabase(devs);
  console.log("Save Developers result:", res);
}

test();
