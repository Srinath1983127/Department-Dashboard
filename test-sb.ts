import { fetchForecastsFromSupabase } from './src/lib/supabase.ts';
async function test() {
  const f = await fetchForecastsFromSupabase();
  console.log(f);
}
test();
