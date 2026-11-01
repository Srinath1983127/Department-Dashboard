import { saveAssignmentsToSupabase, saveDevelopersToSupabase } from './src/lib/supabase';

async function test() {
  const devs = [
    { id: '2206bd37-58bb-4f64-ae51-bd5933725adc', name: 'Dev Insert Fail', role: 'Tester', maxWeeklyHours: 40 },
    { id: 'dev_new', name: 'New Dev', role: 'Tester', maxWeeklyHours: 40 }
  ];
  
  const currentProjects = [
    { id: '11111111-1111-1111-1111-111111111111', name: "St. Anthony's Hardware (Pvt) Ltd-Change Requests - SAP B1", category: 'IT', status: 'Active', totalValue: 0, nextYearRollover: 0, monthlyForecast: [] }
  ];
  
  const assignments = [
    { id: 'assign_1', projectId: '11111111-1111-1111-1111-111111111111', developerId: 'dev_new', startDate: '2026-08-01', endDate: '2026-08-31', allocationPercentage: 100, roleInProject: 'Dev' }
  ];
  
  const devsRes = await saveDevelopersToSupabase(devs);
  console.log("Devs res:", devsRes);
  const assignsRes = await saveAssignmentsToSupabase(assignments, currentProjects as any, devs);
  console.log("Assigns res:", assignsRes);
}

test();
