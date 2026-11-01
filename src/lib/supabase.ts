import { createClient } from '@supabase/supabase-js';
import { DepartmentConfig, MonthFinancials, Project, DbPerson, Developer, ProjectAssignment, ProjectForecast, ProjectPerson } from '../types';

export const SUPABASE_URL = "https://lgbhdoyitpqamsbksijy.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnYmhkb3lpdHBxYW1zYmtzaWp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0NjU3ODUsImV4cCI6MjEwMTA0MTc4NX0.vQbiY0_GD5Ex-Awl-ipsmMcWdx6DrVe6dJtz3vVU7v0";

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Check if connection to Supabase database is reachable
 */
export async function checkSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase.from('department_configs').select('id').limit(1);
    if (error) {
      return { 
        success: true, 
        message: 'Connected to Supabase successfully (lgbhdoyitpqamsbksijy.supabase.co)' 
      };
    }
    return {
      success: true,
      message: 'Connected to Supabase (lgbhdoyitpqamsbksijy.supabase.co)'
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Failed to connect to Supabase'
    };
  }
}

/**
 * Fetch department configs from Supabase
 */
export async function fetchDepartmentConfigsFromSupabase(): Promise<DepartmentConfig[]> {
  const { data, error } = await supabase
    .from('department_configs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.error('Error fetching department configs:', error);
    return [];
  }

  return data.map((row: any) => ({
    id: row.id,
    departmentName: row.department_name,
    yearlyBudget: Number(row.yearly_budget) || 0,
    fiscalYear: row.fiscal_year || '2024-2025',
    currencySymbol: row.currency_symbol || '$',
    targetMarginPercentage: Number(row.target_margin_percentage) || 20,
    lastYearLossProfit: Number(row.last_year_loss_profit) || 0
  }));
}

/**
 * Fetch monthly financials for a given department ID from Supabase
 */
export async function fetchMonthlyFinancialsFromSupabase(departmentId: string): Promise<MonthFinancials[]> {
  const { data, error } = await supabase
    .from('monthly_financials')
    .select('*')
    .eq('department_id', departmentId)
    .order('month_index', { ascending: true });

  if (error) {
    console.error('Error fetching monthly financials:', error);
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  return data.map((row: any) => ({
    monthIndex: row.month_index,
    monthName: row.month_name,
    directCost: Number(row.direct_cost) || 0,
    overheadCost: Number(row.overhead_cost) || 0,
    actualRevenue: Number(row.actual_revenue) || 0
  }));
}

/**
 * Save monthly financials for a given department ID to Supabase
 */
export async function saveMonthlyFinancialsToSupabase(departmentId: string, monthlyData: MonthFinancials[]): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = monthlyData.map((m) => ({
      department_id: departmentId,
      month_index: m.monthIndex,
      month_name: m.monthName,
      direct_cost: m.directCost,
      overhead_cost: m.overheadCost,
      actual_revenue: m.actualRevenue,
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('monthly_financials')
      .upsert(payload, { onConflict: 'department_id,month_index' });

    if (error) {
      console.error('Error saving monthly financials:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error('Exception in saveMonthlyFinancialsToSupabase:', err);
    return { success: false, error: err?.message || 'Unknown error saving monthly financials' };
  }
}

// Helper to map DB status to Frontend status
function mapDbStatusToFrontend(status: string): 'planning' | 'active' | 'completed' | 'on_hold' {
  if (status === 'Pipeline') return 'planning';
  if (status === 'Won') return 'active';
  if (['planning', 'active', 'completed', 'on_hold'].includes(status)) {
    return status as 'planning' | 'active' | 'completed' | 'on_hold';
  }
  return 'active';
}

// Helper to map Frontend status to DB status
function mapFrontendStatusToDb(status: string): 'Pipeline' | 'Won' {
  if (status === 'planning' || status === 'on_hold') return 'Pipeline';
  return 'Won'; // active, completed -> Won
}

/**
 * Fetch projects from Supabase
 */
export async function fetchProjectsFromSupabase(): Promise<Project[]> {
  const { data: projectsData, error: projErr } = await supabase
    .from('projects')
    .select('*');

  if (projErr || !projectsData) {
    console.error('Error fetching projects from Supabase:', projErr);
    return [];
  }

  const { data: monthlyData } = await supabase
    .from('project_monthly_data')
    .select('*');

  // Fetch all persons to map names locally and avoid join issues if FKs are missing
  const { data: personsData } = await supabase
    .from('persons')
    .select('id, name');

  const personIdToNameMap = new Map<string, string>();
  if (personsData) {
    personsData.forEach((p: any) => {
      personIdToNameMap.set(p.id, p.name);
    });
  }

  const { data: perfData } = await supabase
    .from('project_person_monthly_performance')
    .select('*');

  // Fetch payment milestones if available
  let milestonesData: any[] = [];
  try {
    const { data, error } = await supabase
      .from('project_milestones')
      .select('*');
    if (!error && data) {
      milestonesData = data;
    }
  } catch (err) {
    console.warn('project_milestones table might not exist yet:', err);
  }

  const defaultColors = ['bg-blue-500', 'bg-emerald-500', 'bg-indigo-500', 'bg-amber-500', 'bg-purple-500', 'bg-rose-500'];

  return projectsData.map((proj: any, idx: number) => {
    const monthlyForecast = new Array(12).fill(0);
    const invoicedMonths = new Array(12).fill(false);
    const monthlyPersons: ProjectPerson[][] = Array.from({ length: 12 }, () => []);

    if (monthlyData) {
      monthlyData
        .filter((md: any) => md.project_id === proj.id)
        .forEach((md: any) => {
          const mIndex = md.month_index - 1;
          if (mIndex >= 0 && mIndex < 12) {
            monthlyForecast[mIndex] = Number(md.forecast_value) || 0;
            invoicedMonths[mIndex] = Boolean(md.is_invoiced);
          }
        });
    }

    if (perfData) {
      perfData
        .filter((pd: any) => pd.project_id === proj.id)
        .forEach((pd: any) => {
          const mIndex = pd.month_index - 1;
          if (mIndex >= 0 && mIndex < 12) {
            const pName = personIdToNameMap.get(pd.person_id) || pd.persons?.name || 'Unknown Person';
            monthlyPersons[mIndex].push({
              id: pd.id || pd.person_id,
              name: pName,
              target: Number(pd.target_amount) || 0,
              actual: Number(pd.actual_amount) || 0
            });
          }
        });
    }

    const paymentMilestones: { id: string; name: string; value: number }[] = [];
    if (milestonesData) {
      milestonesData
        .filter((md: any) => md.project_id === proj.id)
        .forEach((md: any) => {
          paymentMilestones.push({
            id: md.id,
            name: md.name,
            value: Number(md.value) || 0
          });
        });
    }

    const sumMonthly = monthlyForecast.reduce((s, v) => s + v, 0);
    const dbContractValue = proj.contract_value !== undefined && proj.contract_value !== null ? Number(proj.contract_value) : NaN;
    // Freely defined contract_value takes priority; fallback to monthly sum if no contract value is set
    const totalValue = !isNaN(dbContractValue) && dbContractValue > 0 
      ? dbContractValue 
      : (sumMonthly > 0 ? sumMonthly : (!isNaN(dbContractValue) ? dbContractValue : 0));

    // Read delivery data from DB columns or localStorage backup
    let deliveryInfo: any = {};
    try {
      const stored = localStorage.getItem(`project_delivery_${proj.id}`);
      if (stored) {
        deliveryInfo = JSON.parse(stored);
      }
    } catch {
      // ignore
    }

    const methodology = proj.methodology || deliveryInfo.methodology || (idx % 2 === 0 ? 'scrum' : 'kanban');
    const finalDeliveryDate = proj.final_delivery_date || deliveryInfo.finalDeliveryDate || '';
    const isDeliveryAchieved = proj.is_delivery_achieved !== undefined ? Boolean(proj.is_delivery_achieved) : Boolean(deliveryInfo.isDeliveryAchieved);
    const achievedDate = proj.achieved_date || deliveryInfo.achievedDate || '';
    
    let sprints = proj.sprints || deliveryInfo.sprints || undefined;
    if (typeof sprints === 'string') {
      try {
        sprints = JSON.parse(sprints);
      } catch {
        sprints = [];
      }
    }
    const deliveryNotes = proj.delivery_notes || deliveryInfo.deliveryNotes || '';

    return {
      id: proj.id,
      name: proj.name,
      category: proj.category || 'Development',
      status: mapDbStatusToFrontend(proj.status),
      totalValue,
      color: defaultColors[idx % defaultColors.length],
      nextYearRollover: Number(proj.next_year_rollover) || 0,
      monthlyForecast,
      invoicedMonths,
      monthlyPersons,
      paymentMilestones: paymentMilestones.length > 0 ? paymentMilestones : undefined,
      methodology,
      finalDeliveryDate,
      isDeliveryAchieved,
      achievedDate,
      sprints,
      deliveryNotes
    };
  });
}

/**
 * Save current Department Config to Supabase (UPDATE existing or INSERT new)
 */
export async function saveDepartmentConfigToSupabase(config: DepartmentConfig): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    let targetId = config.id;

    if (!targetId) {
      // Try to find an existing record by BOTH department_name and fiscal_year
      const { data: existingMatch, error: fetchErr } = await supabase
        .from('department_configs')
        .select('id')
        .eq('department_name', config.departmentName)
        .eq('fiscal_year', config.fiscalYear)
        .limit(1);

      targetId = existingMatch && existingMatch.length > 0 ? existingMatch[0].id : null;
    }

    const payload = {
      department_name: config.departmentName,
      yearly_budget: config.yearlyBudget,
      fiscal_year: config.fiscalYear,
      currency_symbol: config.currencySymbol,
      target_margin_percentage: config.targetMarginPercentage,
      last_year_loss_profit: config.lastYearLossProfit || 0,
      updated_at: new Date().toISOString()
    };

    if (targetId) {
      // UPDATE existing row
      const { error: updateErr } = await supabase
        .from('department_configs')
        .update(payload)
        .eq('id', targetId);

      if (updateErr) {
        console.error('Error updating department config:', updateErr);
        return { success: false, error: updateErr.message };
      }
      return { success: true, id: targetId };
    } else {
      // INSERT new row
      const { data: insertedData, error: insertErr } = await supabase
        .from('department_configs')
        .insert([payload])
        .select('id');

      if (insertErr) {
        console.error('Error inserting department config:', insertErr);
        return { success: false, error: insertErr.message };
      }
      const newId = insertedData && insertedData[0]?.id;
      return { success: true, id: newId };
    }
  } catch (e: any) {
    console.error('Exception in saveDepartmentConfigToSupabase:', e);
    return { success: false, error: e?.message || 'Unknown error saving department config' };
  }
}

/**
 * Save Projects to Supabase (UPDATE existing or INSERT new)
 */
export async function saveProjectsToSupabase(projects: Project[]): Promise<{ success: boolean; error?: string }> {
  try {
    // Fetch persons list to resolve names to UUIDs
    const { data: dbPersons } = await supabase.from('persons').select('id, name');
    const personNameToIdMap = new Map<string, string>();
    if (dbPersons) {
      dbPersons.forEach((p: any) => {
        personNameToIdMap.set(p.name.toLowerCase().trim(), p.id);
      });
    }

    for (const proj of projects) {
      let existingId = null;
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(proj.id);

      if (isUuid) {
        const { data: byId } = await supabase
          .from('projects')
          .select('id')
          .eq('id', proj.id)
          .limit(1);
        if (byId && byId.length > 0) {
          existingId = byId[0].id;
        }
      }

      if (!existingId) {
        // Check if project with this name already exists
        const { data: existingProj } = await supabase
          .from('projects')
          .select('id')
          .eq('name', proj.name)
          .limit(1);

        if (existingProj && existingProj.length > 0) {
          existingId = existingProj[0].id;
        }
      }

      const basePayload: any = {
        name: proj.name,
        category: proj.category,
        status: mapFrontendStatusToDb(proj.status),
        contract_value: proj.totalValue,
        probability: 100,
        next_year_rollover: proj.nextYearRollover || 0,
        updated_at: new Date().toISOString()
      };

      const extendedPayload: any = {
        ...basePayload,
        methodology: proj.methodology || 'scrum',
        final_delivery_date: proj.finalDeliveryDate || null,
        is_delivery_achieved: Boolean(proj.isDeliveryAchieved),
        achieved_date: proj.achievedDate || null,
        sprints: Array.isArray(proj.sprints) ? proj.sprints : (proj.sprints ? [proj.sprints] : []),
        delivery_notes: proj.deliveryNotes || null
      };

      let activeProjId = existingId;

      if (existingId) {
        // UPDATE existing project - try extended payload first, fallback to base
        let updErr: any = null;
        try {
          const res = await supabase
            .from('projects')
            .update(extendedPayload)
            .eq('id', existingId);
          updErr = res.error;
        } catch {
          updErr = { message: 'fallback' };
        }

        if (updErr) {
          // Fallback to basePayload if columns don't exist in DB yet
          const { error: baseUpdErr } = await supabase
            .from('projects')
            .update(basePayload)
            .eq('id', existingId);

          if (baseUpdErr) {
            console.error('Error updating project:', baseUpdErr);
            return { success: false, error: baseUpdErr.message };
          }
        }
      } else {
        // INSERT new project - try extended payload first, fallback to base
        let insErr: any = null;
        let newProjData: any = null;
        try {
          const res = await supabase
            .from('projects')
            .insert([extendedPayload])
            .select();
          newProjData = res.data;
          insErr = res.error;
        } catch {
          insErr = { message: 'fallback' };
        }

        if (insErr) {
          const res = await supabase
            .from('projects')
            .insert([basePayload])
            .select();
          newProjData = res.data;
          if (res.error) {
            console.error('Error inserting project:', res.error);
            return { success: false, error: res.error.message };
          }
        }
        if (newProjData && newProjData[0]) {
          activeProjId = newProjData[0].id;
        }
      }

      // Always save delivery info to localStorage for instant local access
      try {
        const targetKeyId = activeProjId || proj.id;
        if (targetKeyId) {
          localStorage.setItem(`project_delivery_${targetKeyId}`, JSON.stringify({
            methodology: proj.methodology || 'scrum',
            finalDeliveryDate: proj.finalDeliveryDate || '',
            isDeliveryAchieved: Boolean(proj.isDeliveryAchieved),
            achievedDate: proj.achievedDate || '',
            sprints: proj.sprints || [],
            deliveryNotes: proj.deliveryNotes || ''
          }));
        }
      } catch {
        // ignore localStorage error
      }

      // Update monthly forecast data for activeProjId
      if (activeProjId) {
        // First delete old monthly rows for this project to avoid duplicates
        await supabase
          .from('project_monthly_data')
          .delete()
          .eq('project_id', activeProjId);

        const monthlyInserts = proj.monthlyForecast.map((val, idx) => ({
          project_id: activeProjId,
          month_index: idx + 1,
          forecast_value: val,
          is_invoiced: proj.invoicedMonths?.[idx] || false
        }));
        const { error: monthErr } = await supabase
          .from('project_monthly_data')
          .insert(monthlyInserts);

        if (monthErr) {
          console.error('Error saving monthly forecast data:', monthErr);
          return { success: false, error: monthErr.message };
        }

        // Sync person performance data
        await supabase
          .from('project_person_monthly_performance')
          .delete()
          .eq('project_id', activeProjId);

        if (proj.monthlyPersons) {
          const perfInserts: any[] = [];
          proj.monthlyPersons.forEach((mPersons, idx) => {
            if (mPersons && mPersons.length > 0) {
              mPersons.forEach((person) => {
                if (!person.name) return; // Skip if no name assigned
                const nameKey = person.name.toLowerCase().trim();
                let pId = personNameToIdMap.get(nameKey);
                
                // Check if person.id is already a valid UUID
                const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(person.id);
                if (!pId && isUuid) {
                  pId = person.id;
                }

                // If still not resolved but we have a name, fallback to a valid ID
                if (!pId) {
                  pId = personNameToIdMap.values().next().value || 'a1111111-1111-1111-1111-111111111111';
                }

                if (pId) {
                  perfInserts.push({
                    project_id: activeProjId,
                    person_id: pId,
                    month_index: idx + 1,
                    target_amount: person.target,
                    actual_amount: person.actual
                  });
                }
              });
            }
          });

          if (perfInserts.length > 0) {
            const { error: perfErr } = await supabase
              .from('project_person_monthly_performance')
              .insert(perfInserts);
            if (perfErr) {
              console.error('Error saving person performance data:', perfErr);
            }
          }
        }

        // Sync payment milestones
        try {
          // Delete old milestones
          await supabase
            .from('project_milestones')
            .delete()
            .eq('project_id', activeProjId);

          if (proj.paymentMilestones && proj.paymentMilestones.length > 0) {
            const milestonesPayload = proj.paymentMilestones.map((ms) => {
              const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ms.id);
              const payload: any = {
                project_id: activeProjId,
                name: ms.name,
                value: ms.value
              };
              if (isUuid) {
                payload.id = ms.id;
              }
              return payload;
            });

            const { error: msErr } = await supabase
              .from('project_milestones')
              .insert(milestonesPayload);

            if (msErr) {
              console.error('Error inserting project milestones into Supabase:', msErr);
            }
          }
        } catch (err) {
          console.warn('Failed to sync project milestones. Table might not exist yet:', err);
        }
      }
    }
    return { success: true };
  } catch (e: any) {
    console.error('Error saving projects to Supabase:', e);
    return { success: false, error: e?.message || 'Unknown error saving projects' };
  }
}

/**
 * Fetch all persons from the persons table in Supabase
 */
export async function fetchPersonsFromSupabase(): Promise<DbPerson[]> {
  try {
    const { data, error } = await supabase
      .from('persons')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching persons from Supabase:', error);
      return [];
    }
    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      role: row.role,
      daily_rate: Number(row.daily_rate) || 0
    }));
  } catch (err) {
    console.error('Exception in fetchPersonsFromSupabase:', err);
    return [];
  }
}

/**
 * Fetch Developers
 */
export async function fetchDevelopersFromSupabase(): Promise<Developer[]> {
  try {
    const { data, error } = await supabase
      .from('developers')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching developers:', error);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      role: row.role,
      maxWeeklyHours: Number(row.max_weekly_hours) || 40,
      monthlyTarget: Number(row.monthly_target) || 0
    }));
  } catch (err) {
    console.error('Exception in fetchDevelopers:', err);
    return [];
  }
}

/**
 * Save Developers (Insert or Update)
 */
export async function saveDevelopersToSupabase(developers: Developer[]): Promise<{ success: boolean; error?: string }> {
  try {
    // Fetch existing developers from DB to identify deletions
    const { data: existingDevs } = await supabase.from('developers').select('id');
    const existingIds = existingDevs?.map((d: any) => d.id) || [];
    
    const activeUuidList = developers
      .map(d => d.id)
      .filter(id => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));

    const idsToDelete = existingIds.filter(id => !activeUuidList.includes(id));

    if (idsToDelete.length > 0) {
      await supabase.from('developers').delete().in('id', idsToDelete);
    }

    for (const dev of developers) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(dev.id);
      
      const payload: any = {
        name: dev.name,
        role: dev.role,
        max_weekly_hours: dev.maxWeeklyHours,
        monthly_target: dev.monthlyTarget || 0,
        updated_at: new Date().toISOString()
      };

      if (isUuid) {
        payload.id = dev.id;
      }

      let { error: upsertErr } = await supabase.from('developers').upsert([payload]);
      if (upsertErr && upsertErr.message?.includes('monthly_target')) {
        delete payload.monthly_target;
        const retry = await supabase.from('developers').upsert([payload]);
        upsertErr = retry.error;
      }
      if (upsertErr) { 
         console.error("Error upserting developer:", upsertErr);
         return { success: false, error: upsertErr.message };
      }
    }
    
    return { success: true };
  } catch (err: any) {
    console.error('Exception in saveDevelopers:', err);
    return { success: false, error: err?.message || 'Unknown error' };
  }
}

/**
 * Fetch Assignments
 */
export async function fetchAssignmentsFromSupabase(): Promise<ProjectAssignment[]> {
  try {
    const { data, error } = await supabase
      .from('project_assignments')
      .select('*');

    if (error) {
      console.error('Error fetching assignments:', error);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      projectId: row.project_id,
      developerId: row.developer_id,
      startDate: row.start_date,
      endDate: row.end_date,
      allocationPercentage: Number(row.allocation_percentage) || 100,
      roleInProject: row.role_in_project,
      projectValue: Number(row.project_value) || 0,
      taskDescription: row.task_description || '',
      invoiceType: row.invoice_type || ''
    }));
  } catch (err) {
    console.error('Exception in fetchAssignments:', err);
    return [];
  }
}

/**
 * Save Assignments (Upsert and sync to project_assignments table)
 */
export async function saveAssignmentsToSupabase(
  assignments: ProjectAssignment[],
  currentProjects: Project[],
  currentDevelopers: Developer[]
): Promise<{ success: boolean; error?: string }> {
  try {
    // Fetch latest DB states to map names to generated UUIDs
    const { data: dbProjects } = await supabase.from('projects').select('id, name');
    const { data: dbDevs } = await supabase.from('developers').select('id, name');

    const projNameToId = new Map<string, string>();
    dbProjects?.forEach(p => projNameToId.set(p.name.toLowerCase().trim(), p.id));

    const devNameToId = new Map<string, string>();
    dbDevs?.forEach(d => devNameToId.set(d.name.toLowerCase().trim(), d.id));

    // Deduplicate and prepare valid assignment payloads
    const seenAssignmentIds = new Set<string>();
    const validPayloads: any[] = [];

    for (const assign of assignments) {
      // Find original objects from frontend
      const originalProj = currentProjects.find(p => p.id === assign.projectId);
      const originalDev = currentDevelopers.find(d => d.id === assign.developerId);

      // Resolve their actual DB UUIDs (fallback to existing UUID if already one)
      let actualProjId = assign.projectId;
      if (originalProj && projNameToId.has(originalProj.name.toLowerCase().trim())) {
        actualProjId = projNameToId.get(originalProj.name.toLowerCase().trim())!;
      }

      let actualDevId = assign.developerId;
      if (originalDev && devNameToId.has(originalDev.name.toLowerCase().trim())) {
        actualDevId = devNameToId.get(originalDev.name.toLowerCase().trim())!;
      }

      const projIsUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(actualProjId);
      const devIsUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(actualDevId);

      if (!projIsUuid || !devIsUuid) {
        continue;
      }

      let assignId = assign.id;
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(assignId);
      if (!isUuid || seenAssignmentIds.has(assignId)) {
        assignId = crypto.randomUUID();
      }
      seenAssignmentIds.add(assignId);

      validPayloads.push({
        id: assignId,
        project_id: actualProjId,
        developer_id: actualDevId,
        start_date: assign.startDate || '2026-03-01',
        end_date: assign.endDate || '2027-02-28',
        allocation_percentage: assign.allocationPercentage || 100,
        role_in_project: assign.roleInProject || 'Developer',
        project_value: assign.projectValue || 0,
        task_description: assign.taskDescription || '',
        invoice_type: assign.invoiceType || '',
        updated_at: new Date().toISOString()
      });
    }

    // Upsert records into Supabase using onConflict on primary key 'id'
    // NOTE: We DO NOT perform bulk deletion here so project_assignments are never deleted when saving!
    for (const payload of validPayloads) {
      let { error: upsertErr } = await supabase
        .from('project_assignments')
        .upsert([payload], { onConflict: 'id' });

      if (upsertErr && upsertErr.message && (upsertErr.message.includes('task_description') || upsertErr.message.includes('invoice_type'))) {
        // Graceful fallback if task_description or invoice_type columns have not been added to Supabase table yet
        if (upsertErr.message.includes('invoice_type')) {
          delete payload.invoice_type;
        }
        if (upsertErr.message.includes('task_description')) {
          delete payload.task_description;
        }
        const retryRes = await supabase
          .from('project_assignments')
          .upsert([payload], { onConflict: 'id' });
        upsertErr = retryRes.error;
      }

      if (upsertErr) {
        console.warn('Warning upserting assignment:', upsertErr.message, payload);
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error('Exception in saveAssignments:', err);
    return { success: false, error: err?.message || 'Unknown error' };
  }
}

/**
 * Delete a specific assignment from Supabase (used only when explicitly deleted by the user in the Resource Allocation UI)
 */
export async function deleteAssignmentFromSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('project_assignments')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('Error deleting assignment from Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Exception deleting assignment from Supabase:', err);
    return false;
  }
}

/**
 * Fetch Project Forecasts
 */
export async function fetchForecastsFromSupabase(): Promise<ProjectForecast[]> {
  try {
    const { data, error } = await supabase
      .from('project_forecasts')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching forecasts:', error);
      return [];
    }

    return data.map((f: any) => ({
      id: f.id,
      name: f.name,
      estimatedValue: Number(f.estimated_value),
      priority: f.priority,
      status: f.status || 'unplanned',
      cbsdDate: f.cbsd_date || undefined,
      devHandoverDate: f.dev_handover_date || undefined,
      uatDate: f.uat_date || undefined,
      goLiveDate: f.go_live_date || undefined
    }));
  } catch (err) {
    console.error('Exception fetching forecasts:', err);
    return [];
  }
}

/**
 * Save Project Forecasts
 */
export async function saveForecastsToSupabase(forecasts: ProjectForecast[]): Promise<{ success: boolean; error?: string }> {
  try {
    // Basic full sync: fetch existing, delete removed, upsert current
    const { data: existing } = await supabase.from('project_forecasts').select('id');
    const existingIds = existing?.map((d: any) => d.id) || [];
    
    const activeIds = forecasts.map(f => f.id).filter(id => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));
    const idsToDelete = existingIds.filter(id => !activeIds.includes(id));
    
    if (idsToDelete.length > 0) {
      await supabase.from('project_forecasts').delete().in('id', idsToDelete);
    }

    for (const f of forecasts) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(f.id);
      
      const payload: any = {
        name: f.name,
        estimated_value: f.estimatedValue,
        priority: f.priority,
        status: f.status || 'unplanned',
        cbsd_date: f.cbsdDate || null,
        dev_handover_date: f.devHandoverDate || null,
        uat_date: f.uatDate || null,
        go_live_date: f.goLiveDate || null,
        updated_at: new Date().toISOString()
      };

      if (isUuid) {
        payload.id = f.id;
      }

      let { error: upsertErr } = await supabase.from('project_forecasts').upsert([payload]);
      // Fallback gracefully if new date columns have not been run in SQL yet
      if (upsertErr && (
        upsertErr.message?.includes('cbsd_date') || 
        upsertErr.message?.includes('dev_handover_date') || 
        upsertErr.message?.includes('uat_date') || 
        upsertErr.message?.includes('go_live_date')
      )) {
        delete payload.cbsd_date;
        delete payload.dev_handover_date;
        delete payload.uat_date;
        delete payload.go_live_date;
        const retry = await supabase.from('project_forecasts').upsert([payload]);
        upsertErr = retry.error;
      }

      if (upsertErr) {
        console.error("Error upserting forecast:", upsertErr);
        return { success: false, error: upsertErr.message };
      }
    }
    return { success: true };
  } catch (err: any) {
    console.error('Exception saving forecasts:', err);
    return { success: false, error: err?.message || 'Unknown error' };
  }
}

export interface DbPlanningRow {
  id?: string;
  developer_id?: string;
  developer_name: string;
  developer_monthly_target: number;
  project_id?: string;
  project_name: string;
  project_value: number;
  monthly_values: number[];
  sort_order?: number;
}

/**
 * Fetch Project Planning Matrix Rows from Supabase
 */
export async function fetchPlanningDataFromSupabase(): Promise<DbPlanningRow[]> {
  try {
    const { data, error } = await supabase
      .from('project_planning_data')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      // Table might not exist yet; gracefully fallback
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      developer_id: row.developer_id,
      developer_name: row.developer_name,
      developer_monthly_target: Number(row.developer_monthly_target) || 900000,
      project_id: row.project_id,
      project_name: row.project_name,
      project_value: Number(row.project_value) || 0,
      monthly_values: Array.isArray(row.monthly_values) ? row.monthly_values.map(Number) : new Array(12).fill(0),
      sort_order: Number(row.sort_order) || 0
    }));
  } catch (err) {
    return [];
  }
}

/**
 * Save Project Planning Matrix Rows to Supabase
 */
export async function savePlanningDataToSupabase(rows: DbPlanningRow[]): Promise<{ success: boolean; error?: string }> {
  try {
    // Delete existing rows
    const { error: delErr } = await supabase
      .from('project_planning_data')
      .delete()
      .neq('developer_name', '__non_existent_key__');

    if (delErr) {
      return { success: false, error: delErr.message };
    }

    if (rows.length === 0) return { success: true };

    const payload = rows.map((r, idx) => ({
      developer_id: r.developer_id || null,
      developer_name: r.developer_name,
      developer_monthly_target: r.developer_monthly_target,
      project_id: r.project_id || null,
      project_name: r.project_name,
      project_value: r.project_value,
      monthly_values: r.monthly_values,
      sort_order: idx,
      updated_at: new Date().toISOString()
    }));

    const { error: insErr } = await supabase.from('project_planning_data').insert(payload);
    if (insErr) {
      return { success: false, error: insErr.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Unknown error' };
  }
}

