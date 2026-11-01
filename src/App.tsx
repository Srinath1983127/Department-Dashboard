import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Routes, Route, useLocation, Link } from 'react-router-dom';
import { DepartmentConfig, MonthFinancials, Project, DepartmentPreset, DbPerson, ProjectForecast } from './types';
import { DEFAULT_PRESETS, MONTH_NAMES, SHORT_MONTH_NAMES } from './data/initialData';
import { 
  fetchDepartmentConfigsFromSupabase, 
  fetchMonthlyFinancialsFromSupabase, 
  fetchProjectsFromSupabase,
  fetchPersonsFromSupabase,
  saveDepartmentConfigToSupabase,
  saveMonthlyFinancialsToSupabase,
  saveProjectsToSupabase,
  fetchDevelopersFromSupabase,
  fetchAssignmentsFromSupabase,
  saveDevelopersToSupabase,
  saveAssignmentsToSupabase,
  deleteAssignmentFromSupabase,
  fetchForecastsFromSupabase,
  saveForecastsToSupabase,
  fetchPlanningDataFromSupabase,
  savePlanningDataToSupabase,
  DbPlanningRow
} from './lib/supabase';
import { calculateFinancialTotals, calculateMonthlySummaries, formatCurrency } from './utils/calculations';

import { Header } from './components/Header';
import { ConfigSection } from './components/ConfigSection';
import { PnLSummary } from './components/PnLSummary';
import { FinancialCharts } from './components/FinancialCharts';
import { FinancialMatrixGrid } from './components/FinancialMatrixGrid';
import { ProjectPlannerGrid } from './components/ProjectPlannerGrid';
import DeveloperAssignmentGrid from './components/DeveloperAssignmentGrid';
import { PersonPerformanceGrid } from './components/PersonPerformanceGrid';
import { NextMonthInvoicePlan } from './components/NextMonthInvoicePlan';
import { SupabaseSyncBar } from './components/SupabaseSyncBar';
import { DeveloperDashboard } from './components/DeveloperDashboard';
import { ProjectCosting } from './components/ProjectCosting';
import { ProjectForecastTab } from './components/ProjectForecastTab';
import { ProjectDeliveryTracker } from './components/ProjectDeliveryTracker';
import { ProjectPlanningSection } from './components/ProjectPlanningSection';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { CheckCircle2, AlertCircle, PieChart, Users, LayoutDashboard, Calculator, Target, Rocket, ArrowRight, Smartphone, TableProperties } from 'lucide-react';
import { Developer, ProjectAssignment } from './types';

export default function App() {
  const location = useLocation();
  const isDeveloperRoute = location.pathname === '/developer';

  // Preset Selection State
  const [presets, setPresets] = useState<DepartmentPreset[]>(DEFAULT_PRESETS);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(DEFAULT_PRESETS[0].id);

  // Core State
  const [config, setConfig] = useState<DepartmentConfig>(DEFAULT_PRESETS[0].config);
  const [monthlyData, setMonthlyData] = useState<MonthFinancials[]>(DEFAULT_PRESETS[0].monthlyData);
  const [projects, setProjects] = useState<Project[]>(DEFAULT_PRESETS[0].projects);
  const [personsPool, setPersonsPool] = useState<DbPerson[]>([]);
  
  // Developer Assignments State (kept completely independent from Project Planning!)
  const [developers, setDevelopers] = useState<Developer[]>([
    { id: 'dev_1', name: 'Kasun Perera', role: 'Fullstack Developer', maxWeeklyHours: 40 },
    { id: 'dev_2', name: 'Nimali Fernando', role: 'Frontend Engineer', maxWeeklyHours: 40 },
    { id: 'dev_3', name: 'Ruwan Silva', role: 'Backend Lead', maxWeeklyHours: 30 }
  ]);
  const [assignments, setAssignments] = useState<ProjectAssignment[]>([]);
  
  // Decoupled selection state
  const [selectedDepartmentName, setSelectedDepartmentName] = useState<string>(DEFAULT_PRESETS[0].config.departmentName);
  const [selectedFY, setSelectedFY] = useState<string>(DEFAULT_PRESETS[0].config.fiscalYear);
  const [activeTab, setActiveTab] = useState<'financials' | 'resources' | 'developer_dashboard' | 'project_costing' | 'project_forecast' | 'project_deliveries' | 'project_planning'>('financials');

  const [projectForecasts, setProjectForecasts] = useState<ProjectForecast[]>([]);
  const [dbPlanningRows, setDbPlanningRows] = useState<DbPlanningRow[]>([]);

  // Synchronize Project Planning changes across related tables (project_planning_data, projects, developers)
  // CRITICAL: Both project_planning_data and project_assignments are saved as SEPARATE entities.
  // Existing project_assignments are NEVER modified or deleted when saving project planning!
  const handlePlanningDataChange = (data: {
    planningRows: DbPlanningRow[];
    updatedProjects: { name: string; totalValue: number; monthlyForecast: number[] }[];
    updatedAssignments?: { developerId: string; projectName: string; projectValue: number }[];
    updatedDevelopers?: Developer[];
  }) => {
    // 1. Update project planning data rows (saves to project_planning_data table)
    setDbPlanningRows(data.planningRows);

    // 2. Sync any newly introduced projects to master projects pool (saves to projects & project_monthly_data)
    setProjects((prev) => {
      const next = [...prev];
      data.updatedProjects.forEach((sp) => {
        if (!sp.name.trim() || sp.name === 'New Project' || sp.name === 'Enter Project Name...') return;
        const idx = next.findIndex((p) => p.name.trim().toLowerCase() === sp.name.trim().toLowerCase());
        if (idx >= 0) {
          next[idx] = {
            ...next[idx],
            totalValue: sp.totalValue || next[idx].totalValue,
            monthlyForecast: sp.monthlyForecast
          };
        } else {
          next.push({
            id: crypto.randomUUID(),
            name: sp.name,
            category: 'Client Work',
            totalValue: sp.totalValue,
            status: 'planning',
            color: '#8b5cf6',
            monthlyForecast: sp.monthlyForecast,
            isExpanded: true
          });
        }
      });
      return next;
    });

    // 3. Update developers if passed
    if (data.updatedDevelopers && data.updatedDevelopers.length > 0) {
      setDevelopers(data.updatedDevelopers);
    }
  };

  // Direct Save to Supabase for Project Planning:
  // Saves to project_planning_data, projects, and developers.
  // CRITICAL: DOES NOT touch or delete project_assignments! Both are saved as separate.
  const handleDirectSaveAllPlanning = async (rows: DbPlanningRow[]) => {
    setAutoSaveStatus('saving');
    try {
      const [pRes, dRes, planRes] = await Promise.all([
        saveProjectsToSupabase(projects),
        saveDevelopersToSupabase(developers),
        savePlanningDataToSupabase(rows)
      ]);
      if (pRes.success && dRes.success && planRes.success) {
        setAutoSaveStatus('synced');
        showToast('Planning data saved to project_planning_data, projects & developers tables. Assignments preserved!');
      } else {
        setAutoSaveStatus('idle');
        showToast('Saved locally and synced available database tables.');
      }
    } catch (e) {
      setAutoSaveStatus('idle');
      showToast('Saved locally.');
    }
  };

  // Sync projects from Project Planning matrix to main project pool
  const handleSyncPlanningProjects = (syncedProjects: { name: string; totalValue: number; monthlyForecast: number[] }[]) => {
    setProjects(prev => {
      const updated = [...prev];
      syncedProjects.forEach(sp => {
        const existingIdx = updated.findIndex(p => p.name.trim().toLowerCase() === sp.name.trim().toLowerCase());
        if (existingIdx >= 0) {
          updated[existingIdx] = {
            ...updated[existingIdx],
            totalValue: sp.totalValue || updated[existingIdx].totalValue,
            monthlyForecast: sp.monthlyForecast
          };
        } else {
          updated.push({
            id: crypto.randomUUID(),
            name: sp.name,
            category: 'Client Work',
            totalValue: sp.totalValue,
            status: 'planning',
            color: '#8b5cf6',
            monthlyForecast: sp.monthlyForecast,
            isExpanded: true
          });
        }
      });
      return updated;
    });
    showToast(`Synced ${syncedProjects.length} projects with main budget financial matrix.`);
  };

  

  const handleAddForecast = (forecast: Omit<ProjectForecast, 'id'>) => {
    setProjectForecasts(prev => [...prev, { ...forecast, id: crypto.randomUUID() }]);
    showToast('Project forecast added successfully.');
  };

  const handleDeleteForecast = (id: string) => {
    setProjectForecasts(prev => prev.filter(f => f.id !== id));
    showToast('Project forecast removed.');
  };

  const handleEditForecast = (updated: ProjectForecast) => {
    setProjectForecasts(prev => prev.map(f => f.id === updated.id ? updated : f));
    showToast('Project forecast updated.');
  };

  // Auto-save Status State
  const [autoSaveStatus, setAutoSaveStatus] = useState<'synced' | 'saving' | 'dirty' | 'idle'>('synced');
  const isInitialLoadComplete = useRef(false);

  // Load and bind all departments from the database
  const loadAllDbDepartments = async () => {
    try {
      const dbPersons = await fetchPersonsFromSupabase();
      if (dbPersons && dbPersons.length > 0) {
        setPersonsPool(dbPersons);
      }
      const dbConfigs = await fetchDepartmentConfigsFromSupabase();
      if (dbConfigs && dbConfigs.length > 0) {
        const dbPresets = await Promise.all(dbConfigs.map(async (cfg) => {
          const dbMonthly = await fetchMonthlyFinancialsFromSupabase(cfg.id!);
          const finalMonthly = dbMonthly.length > 0 ? dbMonthly : Array.from({ length: 12 }, (_, i) => ({
            monthIndex: i + 1,
            monthName: MONTH_NAMES[i],
            directCost: 0,
            overheadCost: 0,
            actualRevenue: 0
          }));

          return {
            id: cfg.id!,
            label: cfg.departmentName,
            description: `Database synchronized department configuration for ${cfg.departmentName}.`,
            config: cfg,
            monthlyData: finalMonthly,
            projects: []
          };
        }));

        const dbProjects = await fetchProjectsFromSupabase();
        
        // Enrich projects with payment milestones and delivery dates from DB, localStorage or auto-generate
        const enrichedProjects = dbProjects.map((proj, idx) => {
          let paymentMilestones = proj.paymentMilestones;
          
          if (!paymentMilestones || paymentMilestones.length === 0) {
            const stored = localStorage.getItem(`payment_milestones_${proj.id}`);
            paymentMilestones = stored ? JSON.parse(stored) : undefined;
          }
          
          if (!paymentMilestones || paymentMilestones.length === 0) {
            const tempMilestones: { id: string; name: string; value: number }[] = [];
            proj.monthlyForecast.forEach((val, fIdx) => {
              if (val > 0) {
                tempMilestones.push({
                  id: `ms_${proj.id}_${fIdx}`,
                  name: `${SHORT_MONTH_NAMES[fIdx] || `Month ${fIdx + 1}`} Milestone`,
                  value: val
                });
              }
            });
            if (tempMilestones.length > 0) {
              paymentMilestones = tempMilestones;
            }
          }

          // Hydrate delivery info from DB or localStorage backup
          let methodology = proj.methodology;
          let finalDeliveryDate = proj.finalDeliveryDate;
          let isDeliveryAchieved = proj.isDeliveryAchieved;
          let achievedDate = proj.achievedDate;
          let sprints = proj.sprints;
          let deliveryNotes = proj.deliveryNotes;

          const storedDelivery = localStorage.getItem(`project_delivery_${proj.id}`);
          if (storedDelivery) {
            try {
              const parsed = JSON.parse(storedDelivery);
              if (!methodology && parsed.methodology) methodology = parsed.methodology;
              if (!finalDeliveryDate && parsed.finalDeliveryDate) finalDeliveryDate = parsed.finalDeliveryDate;
              if (isDeliveryAchieved === undefined && parsed.isDeliveryAchieved !== undefined) isDeliveryAchieved = parsed.isDeliveryAchieved;
              if (!achievedDate && parsed.achievedDate) achievedDate = parsed.achievedDate;
              if (!sprints && parsed.sprints) sprints = parsed.sprints;
              if (!deliveryNotes && parsed.deliveryNotes) deliveryNotes = parsed.deliveryNotes;
            } catch {
              // ignore
            }
          }

          // Smart fallback for methodology: alternate between scrum and kanban if not defined
          if (!methodology) {
            methodology = idx % 2 === 0 ? 'scrum' : 'kanban';
          }

          // Smart fallback for final delivery date: end of active forecast or fiscal year date
          if (!finalDeliveryDate) {
            let lastActiveMonth = 0;
            proj.monthlyForecast.forEach((v, i) => {
              if (v > 0) lastActiveMonth = i + 1;
            });
            const targetM = lastActiveMonth > 0 ? lastActiveMonth : 10;
            const mStr = targetM < 10 ? `0${targetM}` : `${targetM}`;
            finalDeliveryDate = `2026-${mStr}-25`;
          }

          // Smart fallback for Scrum sprints if none exist
          if (methodology === 'scrum' && (!sprints || sprints.length === 0)) {
            sprints = [
              {
                id: `sp_${proj.id}_1`,
                sprintNumber: 1,
                name: 'Sprint 1: Architecture & Setup',
                startDate: '2026-09-01',
                endDate: '2026-09-15',
                isAchieved: true,
                achievedDate: '2026-09-14',
                goal: 'Core architecture and environment provisioning'
              },
              {
                id: `sp_${proj.id}_2`,
                sprintNumber: 2,
                name: 'Sprint 2: Core Feature Implementation',
                startDate: '2026-09-16',
                endDate: '2026-09-30',
                isAchieved: false,
                goal: 'Implementation of primary user flows and backend services'
              }
            ];
          }

          return {
            ...proj,
            paymentMilestones,
            methodology,
            finalDeliveryDate,
            isDeliveryAchieved: Boolean(isDeliveryAchieved),
            achievedDate,
            sprints,
            deliveryNotes
          };
        });

        const presetsWithProjects = dbPresets.map(preset => ({
          ...preset,
          projects: enrichedProjects
        })).sort((a, b) => {
          const aIsAlpha = a.config.departmentName.trim().toLowerCase() === 'software development-alpha team';
          const bIsAlpha = b.config.departmentName.trim().toLowerCase() === 'software development-alpha team';
          if (aIsAlpha && !bIsAlpha) return -1;
          if (!aIsAlpha && bIsAlpha) return 1;
          return a.config.departmentName.localeCompare(b.config.departmentName);
        });

        setPresets(presetsWithProjects);
        return presetsWithProjects;
      }
    } catch (err) {
      console.error("Error loading database departments:", err);
    }
    return null;
  };

  // Run on mount to bind to database departments
  useEffect(() => {
    const initLoad = async () => {
      const dbPersons = await fetchPersonsFromSupabase();
      if (dbPersons && dbPersons.length > 0) {
        setPersonsPool(dbPersons);
      }
      
      const dbDevs = await fetchDevelopersFromSupabase();
      if (dbDevs && dbDevs.length > 0) {
        setDevelopers(dbDevs);
      }
      
      const dbAssigns = await fetchAssignmentsFromSupabase();
      if (dbAssigns && dbAssigns.length > 0) {
        setAssignments(dbAssigns);
      }
      
      const dbForecasts = await fetchForecastsFromSupabase();
      if (dbForecasts && dbForecasts.length > 0) {
        setProjectForecasts(dbForecasts);
      }

      const dbPlanning = await fetchPlanningDataFromSupabase();
      if (dbPlanning && dbPlanning.length > 0) {
        setDbPlanningRows(dbPlanning);
      }

      const dbPresets = await loadAllDbDepartments();
      if (dbPresets && dbPresets.length > 0) {
        // Priority: Default to Software Development-Alpha Team (prioritizing 2025-2026 / latest active)
        const defaultPreset = dbPresets.find(p => 
          p.config.departmentName.trim().toLowerCase() === 'software development-alpha team' &&
          (p.config.fiscalYear === '2025-2026' || p.config.fiscalYear === '2026')
        ) || dbPresets.find(p => 
          p.config.departmentName.trim().toLowerCase() === 'software development-alpha team'
        ) || dbPresets[0];

        setSelectedDepartmentName(defaultPreset.config.departmentName);
        setSelectedFY(defaultPreset.config.fiscalYear);
        setSelectedPresetId(defaultPreset.id);
        setConfig(defaultPreset.config);
        setMonthlyData(defaultPreset.monthlyData);
        setProjects(defaultPreset.projects);
        showToast(`Loaded ${dbPresets.length} departments. Default: "${defaultPreset.config.departmentName}" (${defaultPreset.config.fiscalYear})`);
      } else {
        setSelectedDepartmentName(DEFAULT_PRESETS[0].config.departmentName);
        setSelectedFY(DEFAULT_PRESETS[0].config.fiscalYear);
      }
      setTimeout(() => {
        isInitialLoadComplete.current = true;
      }, 1500);
    };
    initLoad();
  }, []);

  // Notification Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Switch Department Preset Template
  const handleSelectPreset = (preset: DepartmentPreset) => {
    setSelectedPresetId(preset.id);
    setSelectedDepartmentName(preset.config.departmentName);
    setSelectedFY(preset.config.fiscalYear);
    setConfig(preset.config);
    setMonthlyData(preset.monthlyData);
    setProjects(preset.projects);
    showToast(`Loaded preset template: "${preset.label}"`);
  };

  // Unified Selector & Filter for BOTH Department Name and Year
  const handleSelectDepartmentAndYear = (deptName: string, fy: string, updatedPresetsList?: DepartmentPreset[]) => {
    setSelectedDepartmentName(deptName);
    setSelectedFY(fy);

    const listToSearch = updatedPresetsList || presets;

    // Look for an existing preset matching BOTH departmentName and fiscalYear
    const found = listToSearch.find(
      (p) => p.config.departmentName.toLowerCase().trim() === deptName.toLowerCase().trim() &&
             p.config.fiscalYear.toLowerCase().trim() === fy.toLowerCase().trim()
    );

    if (found) {
      setSelectedPresetId(found.id);
      setConfig(found.config);
      setMonthlyData(found.monthlyData);
      setProjects(found.projects);
      showToast(`Loaded "${deptName}" for FY ${fy}`);
    } else {
      // Sibling cloning: Find another year of this department to clone projects and parameters
      const sibling = listToSearch.find(
        (p) => p.config.departmentName.toLowerCase().trim() === deptName.toLowerCase().trim()
      );

      const newId = `dept-${Date.now()}`;
      const newPreset: DepartmentPreset = {
        id: newId,
        label: `${deptName} (${fy})`,
        description: `Custom configuration for ${deptName} for FY ${fy}.`,
        config: {
          id: undefined, // Will be generated by Supabase on insert
          departmentName: deptName,
          yearlyBudget: sibling ? sibling.config.yearlyBudget : 500000,
          fiscalYear: fy,
          currencySymbol: sibling ? sibling.config.currencySymbol : 'LKR',
          targetMarginPercentage: sibling ? sibling.config.targetMarginPercentage : 20
        },
        monthlyData: sibling ? JSON.parse(JSON.stringify(sibling.monthlyData)) : Array.from({ length: 12 }, (_, i) => ({
          monthIndex: i + 1,
          monthName: MONTH_NAMES[i],
          directCost: 0,
          overheadCost: 0,
          actualRevenue: 0
        })),
        projects: sibling ? JSON.parse(JSON.stringify(sibling.projects)) : []
      };

      // Add to presets
      setPresets((prev) => [...prev, newPreset]);
      setSelectedPresetId(newId);
      setConfig(newPreset.config);
      setMonthlyData(newPreset.monthlyData);
      setProjects(newPreset.projects);
      showToast(`Initialized new budget for "${deptName}" in FY ${fy}`);
    }
  };

  const handleSelectDepartmentName = (deptName: string) => {
    handleSelectDepartmentAndYear(deptName, selectedFY);
  };

  const handleSelectFY = (fy: string) => {
    handleSelectDepartmentAndYear(selectedDepartmentName, fy);
  };

  const handleAddDepartmentName = (deptName: string) => {
    handleSelectDepartmentAndYear(deptName, selectedFY);
  };

  const handleAddFiscalYear = (fy: string) => {
    handleSelectDepartmentAndYear(selectedDepartmentName, fy);
  };

  // Sync state changes to current preset list
  useEffect(() => {
    if (selectedPresetId === 'custom' || !isInitialLoadComplete.current) return;
    setPresets(prev => prev.map(p => 
      p.id === selectedPresetId 
        ? { 
            ...p, 
            config, 
            monthlyData, 
            projects, 
            label: config.departmentName || 'Untitled Dept' 
          }
        : p
    ));
  }, [config, monthlyData, projects, selectedPresetId]);

  // Debounced Auto-save to Supabase Database on change
  useEffect(() => {
    if (!isInitialLoadComplete.current) return;

    setAutoSaveStatus('dirty');

    const saveTimeout = setTimeout(async () => {
      setAutoSaveStatus('saving');
      try {
        const configRes = await saveDepartmentConfigToSupabase(config);
        
        let monthlyRes = { success: true };
        if (configRes.success && configRes.id) {
          // Update active config ID locally if not set
          if (!config.id) {
            setConfig(prev => ({ ...prev, id: configRes.id }));
          }
          monthlyRes = await saveMonthlyFinancialsToSupabase(configRes.id, monthlyData);
        }
        
        const projectsRes = await saveProjectsToSupabase(projects);
        
        // Save developers and assignments
        const devsRes = await saveDevelopersToSupabase(developers);
        const assignsRes = await saveAssignmentsToSupabase(assignments, projects, developers);
        const forecastsRes = await saveForecastsToSupabase(projectForecasts);
        let planningRes = { success: true };
        if (dbPlanningRows && dbPlanningRows.length > 0) {
          planningRes = await savePlanningDataToSupabase(dbPlanningRows);
        }

        if (configRes.success && monthlyRes.success && projectsRes.success && devsRes.success && assignsRes.success && forecastsRes.success && planningRes.success) {
          setAutoSaveStatus('synced');
          // Re-load configs in the background to ensure consistency
          await loadAllDbDepartments();
        } else {
          setAutoSaveStatus('idle');
        }
      } catch (err) {
        console.error("Auto-save error:", err);
        setAutoSaveStatus('idle');
      }
    }, 1500); // 1.5s debounce delay

    return () => clearTimeout(saveTimeout);
  }, [config, monthlyData, projects, developers, assignments, projectForecasts, dbPlanningRows]);

  // Reset Data to Default Initial Preset
  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset all department data to initial preset defaults?')) {
      const defaultPreset = DEFAULT_PRESETS[0];
      setSelectedPresetId(defaultPreset.id);
      setSelectedDepartmentName(defaultPreset.config.departmentName);
      setSelectedFY(defaultPreset.config.fiscalYear);
      setConfig(defaultPreset.config);
      setMonthlyData(defaultPreset.monthlyData);
      setProjects(defaultPreset.projects);
      showToast('Department budget reset to initial template (Software Development-Alpha Team).');
    }
  };

  // Update Config
  const handleUpdateConfig = (newConfig: Partial<DepartmentConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  };

  // Spread budget evenly across 12 months as target overhead allowance
  const handleApplyBudgetSpread = (monthlyAllowance: number) => {
    setMonthlyData((prev) =>
      prev.map((m) => ({
        ...m,
        overheadCost: monthlyAllowance
      }))
    );
    showToast(`Spread ${config.currencySymbol}${monthlyAllowance.toLocaleString()}/mo overhead cost allowance across 12 months.`);
  };

  // Update Single Month Field in Financial Matrix
  const handleUpdateMonth = (monthIndex: number, field: keyof MonthFinancials, value: any) => {
    setMonthlyData((prev) =>
      prev.map((m) => (m.monthIndex === monthIndex ? { ...m, [field]: value } : m))
    );
  };

  // Bulk Update Months in Financial Matrix
  const handleBulkUpdateMonths = (updater: (m: MonthFinancials, idx: number) => MonthFinancials) => {
    setMonthlyData((prev) => prev.map((m, idx) => updater(m, idx)));
    showToast('Applied batch updates to financial matrix.');
  };

  // Project Planner Handlers
  const handleAddProject = (newProj: Omit<Project, 'id'>) => {
    const project: Project = {
      ...newProj,
      id: `proj_${Date.now()}`
    };
    if (project.paymentMilestones) {
      localStorage.setItem(`payment_milestones_${project.id}`, JSON.stringify(project.paymentMilestones));
    }
    if (project.methodology || project.finalDeliveryDate || project.sprints) {
      localStorage.setItem(`project_delivery_${project.id}`, JSON.stringify({
        methodology: project.methodology || 'scrum',
        finalDeliveryDate: project.finalDeliveryDate || '',
        isDeliveryAchieved: Boolean(project.isDeliveryAchieved),
        achievedDate: project.achievedDate || '',
        sprints: project.sprints || [],
        deliveryNotes: project.deliveryNotes || ''
      }));
    }
    setProjects((prev) => [...prev, project]);
    showToast(`Added project "${project.name}"`);
  };

  const handleUpdateProject = (id: string, updated: Partial<Project>) => {
    if (updated.paymentMilestones) {
      localStorage.setItem(`payment_milestones_${id}`, JSON.stringify(updated.paymentMilestones));
    }
    if (
      updated.methodology !== undefined ||
      updated.finalDeliveryDate !== undefined ||
      updated.isDeliveryAchieved !== undefined ||
      updated.achievedDate !== undefined ||
      updated.sprints !== undefined ||
      updated.deliveryNotes !== undefined
    ) {
      const existing = projects.find((p) => p.id === id);
      localStorage.setItem(
        `project_delivery_${id}`,
        JSON.stringify({
          methodology: updated.methodology ?? existing?.methodology ?? 'scrum',
          finalDeliveryDate: updated.finalDeliveryDate ?? existing?.finalDeliveryDate ?? '',
          isDeliveryAchieved: updated.isDeliveryAchieved !== undefined ? Boolean(updated.isDeliveryAchieved) : Boolean(existing?.isDeliveryAchieved),
          achievedDate: updated.achievedDate ?? existing?.achievedDate ?? '',
          sprints: updated.sprints ?? existing?.sprints ?? [],
          deliveryNotes: updated.deliveryNotes ?? existing?.deliveryNotes ?? ''
        })
      );
    }
    setProjects((prev) => {
      const exists = prev.some((p) => p.id === id);
      if (exists) {
        return prev.map((p) => (p.id === id ? { ...p, ...updated } : p));
      }
      const matchedForecast = projectForecasts.find(
        (f) => f.id === id || f.name.trim().toLowerCase() === (updated.name || '').trim().toLowerCase()
      );
      if (matchedForecast) {
        const newProj: Project = {
          id,
          name: matchedForecast.name,
          category: 'Client Work',
          totalValue: matchedForecast.estimatedValue || 0,
          status: 'planning',
          color: '#3b82f6',
          isExpanded: true,
          monthlyForecast: new Array(12).fill(0),
          isPlannedFromForecast: true,
          forecastId: matchedForecast.id,
          methodology: updated.methodology || 'scrum',
          finalDeliveryDate: updated.finalDeliveryDate || '2026-10-25',
          isDeliveryAchieved: Boolean(updated.isDeliveryAchieved),
          achievedDate: updated.achievedDate || '',
          sprints: updated.sprints || [],
          deliveryNotes: updated.deliveryNotes || '',
          ...updated
        };
        return [...prev, newProj];
      }
      return prev;
    });
  };

  const handleUpdateProjectMonthValue = (projectId: string, monthIdx: number, value: number) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const newForecast = [...p.monthlyForecast];
        newForecast[monthIdx - 1] = Math.max(0, value);

        return { 
          ...p, 
          monthlyForecast: newForecast
        };
      })
    );
  };

  const handleDeleteProject = (id: string) => {
    const proj = projects.find((p) => p.id === id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    showToast(`Deleted project "${proj?.name || id}"`);
  };

  // Copy Total Project Forecasted Revenues directly into Actual Monthly Revenues
  const handleSyncForecastToActuals = () => {
    const forecastedPerMonth = new Array(12).fill(0);
    projects.forEach((p) => {
      p.monthlyForecast.forEach((v, idx) => {
        if (idx < 12) forecastedPerMonth[idx] += v || 0;
      });
    });

    setMonthlyData((prev) =>
      prev.map((m, idx) => ({
        ...m,
        actualRevenue: forecastedPerMonth[idx] || 0
      }))
    );
    showToast('Copied forecasted project revenues directly into Actual Revenue matrix.');
  };

  // Developer & Assignment Handlers
  const handleAddDeveloper = (dev: Omit<Developer, 'id'>) => {
    setDevelopers((prev) => [...prev, { ...dev, id: crypto.randomUUID() }]);
    showToast(`Added developer "${dev.name}"`);
  };

  const handleDeleteDeveloper = (id: string) => {
    setDevelopers((prev) => prev.filter((d) => d.id !== id));
    setAssignments((prev) => prev.filter((a) => a.developerId !== id)); // Cascade delete assignments
    showToast('Removed developer and associated assignments.');
  };

  const handleUpdateDeveloper = (updatedDev: Developer) => {
    setDevelopers((prev) => prev.map((d) => (d.id === updatedDev.id ? updatedDev : d)));
  };

  const handleAddAssignment = (assign: Omit<ProjectAssignment, 'id'>) => {
    setAssignments((prev) => [...prev, { ...assign, id: crypto.randomUUID() }]);
    showToast('Developer assigned to project successfully.');
  };

  const handleDeleteAssignment = async (id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (isUuid) {
      await deleteAssignmentFromSupabase(id);
    }
    showToast('Removed developer assignment.');
  };

  const handleUpdateAssignment = (updatedAssign: ProjectAssignment) => {
    setAssignments((prev) => prev.map((a) => (a.id === updatedAssign.id ? updatedAssign : a)));
    showToast('Updated developer assignment.');
  };

  // Export Data to JSON File
  const handleExportJSON = () => {
    const dataToExport = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      config,
      monthlyData,
      projects
    };

    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.departmentName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_budget_2026.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported department budget JSON file.');
  };

  // Import Data from JSON File
  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (parsed.config && parsed.monthlyData && parsed.projects) {
          setConfig(parsed.config);
          setMonthlyData(parsed.monthlyData);
          setProjects(parsed.projects);
          setSelectedPresetId('custom');
          showToast('Successfully imported department budget configuration!');
        } else {
          alert('Invalid budget file format.');
        }
      } catch (err) {
        alert('Error parsing JSON file.');
      }
    };
    reader.readAsText(file);
    // Reset file input
    event.target.value = '';
  };

  // Derived Calculations
  const monthlySummaries = useMemo(() => {
    return calculateMonthlySummaries(monthlyData, projects);
  }, [monthlyData, projects]);

  const financialTotals = useMemo(() => {
    return calculateFinancialTotals(monthlyData, projects, config.yearlyBudget, config.lastYearLossProfit || 0);
  }, [monthlyData, projects, config.yearlyBudget, config.lastYearLossProfit]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans antialiased pb-16">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-medium flex items-center space-x-2 border border-slate-700 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header Bar */}
      {!isDeveloperRoute && (
        <>
          <Header
            config={config}
            presets={presets}
            selectedDepartmentName={selectedDepartmentName}
            selectedFY={selectedFY}
            onSelectDepartmentName={handleSelectDepartmentName}
            onSelectFY={handleSelectFY}
            onAddDepartmentName={handleAddDepartmentName}
            onAddFiscalYear={handleAddFiscalYear}
            onResetData={handleResetData}
            onExportJSON={handleExportJSON}
            onImportJSON={handleImportJSON}
            netProfitLoss={financialTotals.netProfitLoss}
            totalRevenue={financialTotals.totalActualRevenue}
            autoSaveStatus={autoSaveStatus}
          />
          
          <SupabaseSyncBar
            currentConfig={config}
            currentProjects={projects}
            currentMonthlyData={monthlyData}
            currentDevelopers={developers}
            currentAssignments={assignments}
            onRefreshPresets={loadAllDbDepartments}
            onLoadConfig={(loadedConfig) => setConfig(loadedConfig)}
            onLoadProjects={(loadedProjects) => setProjects(loadedProjects)}
            onLoadMonthlyData={(loadedMonthlyData) => setMonthlyData(loadedMonthlyData)}
            onLoadDevelopers={(loadedDevs) => setDevelopers(loadedDevs)}
            onLoadAssignments={(loadedAssigns) => setAssignments(loadedAssigns)}
            showToast={showToast}
          />
        </>
      )}

      {/* Main Content Dashboard Container */}
      <Routes>
        <Route path="/developer" element={
          <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 shadow-xs sticky top-0 z-30 backdrop-blur-md bg-white/95 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md font-mono font-bold text-sm">
                  &lt;/&gt;
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">Developer Portal</h1>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full border border-blue-200">Mobile PWA</span>
                  </div>
                  <p className="text-[11px] text-slate-500 hidden sm:block">Team Workspace, Sprint Boards & Timesheets</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <PWAInstallButton variant="header" />
              </div>
            </header>
            <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
              <DeveloperDashboard
                developers={developers}
                assignments={assignments}
                projects={projects}
                currencySymbol={config.currencySymbol}
              />
            </main>
          </div>
        } />
        <Route path="*" element={
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            
            {/* Navigation Tabs */}
            <div className="flex overflow-x-auto scrollbar-none md:overflow-visible space-x-1 bg-white p-1 rounded-xl shadow-sm border border-slate-200 mb-6 max-w-5xl mx-auto snap-x">
          <button
            onClick={() => setActiveTab('financials')}
            className={`flex-1 shrink-0 snap-start flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'financials'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span>Financials & Planning</span>
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`flex-1 shrink-0 snap-start flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'resources'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Resource Allocation</span>
          </button>
          <button
            onClick={() => setActiveTab('developer_dashboard')}
            className={`flex-1 shrink-0 snap-start flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'developer_dashboard'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Developer Portal</span>
          </button>
          <button
            onClick={() => setActiveTab('project_costing')}
            className={`flex-1 shrink-0 snap-start flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'project_costing'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Project Costing</span>
          </button>
          <button
            onClick={() => setActiveTab('project_forecast')}
            className={`flex-1 shrink-0 snap-start flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'project_forecast'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Forecast Pipeline</span>
          </button>
          <button
            onClick={() => setActiveTab('project_deliveries')}
            className={`flex-1 shrink-0 snap-start flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'project_deliveries'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <Rocket className="w-4 h-4" />
            <span>Delivery Schedule</span>
          </button>
          <button
            onClick={() => setActiveTab('project_planning')}
            className={`flex-1 shrink-0 snap-start flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'project_planning'
                ? 'bg-purple-700 text-white shadow-md'
                : 'text-slate-500 hover:bg-purple-50 hover:text-purple-700'
            }`}
          >
            <TableProperties className="w-4 h-4" />
            <span>Project Planning</span>
          </button>
        </div>

        {activeTab === 'financials' ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Section 1: Department Configuration */}
            <ConfigSection
              config={config}
              onUpdateConfig={handleUpdateConfig}
              onApplyBudgetSpread={handleApplyBudgetSpread}
            />

            {/* Section 4: Profit & Loss KPI Summary Cards */}
            <PnLSummary
              totals={financialTotals}
              currencySymbol={config.currencySymbol}
            />

            {/* Interactive Financial Visualizations & Charts */}
            <FinancialCharts
              monthlySummaries={monthlySummaries}
              currencySymbol={config.currencySymbol}
              totalDirectCost={financialTotals.totalDirectCost}
              totalOverheadCost={financialTotals.totalOverheadCost}
            />

            {/* Section 2: 12-Month Financial Matrix Grid */}
            <FinancialMatrixGrid
              monthlySummaries={monthlySummaries}
              currencySymbol={config.currencySymbol}
              onUpdateMonth={handleUpdateMonth}
              onBulkUpdateMonths={handleBulkUpdateMonths}
            />

            {/* Section 3: 12-Month Project Planner Grid */}
            <ProjectPlannerGrid
              projects={projects}
              currencySymbol={config.currencySymbol}
              onAddProject={handleAddProject}
              onUpdateProject={handleUpdateProject}
              onUpdateProjectMonthValue={handleUpdateProjectMonthValue}
              onDeleteProject={handleDeleteProject}
              onSyncForecastToActuals={handleSyncForecastToActuals}
              onViewDeliveries={() => setActiveTab('project_deliveries')}
              personsPool={developers}
            />

            {/* Section 4: Next Month Invoice Plan */}
            <NextMonthInvoicePlan
              projects={projects}
              currencySymbol={config.currencySymbol}
            />
          </div>
        ) : activeTab === 'resources' ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Section: Developer Assignments Matrix */}
            <DeveloperAssignmentGrid
              projects={projects}
              developers={developers}
              assignments={assignments}
              currencySymbol={config.currencySymbol}
              onAddDeveloper={handleAddDeveloper}
              onAddAssignment={handleAddAssignment}
              onUpdateAssignment={handleUpdateAssignment}
              onDeleteAssignment={handleDeleteAssignment}
              onUpdateDeveloper={handleUpdateDeveloper}
              onDeleteDeveloper={handleDeleteDeveloper}
            />

            {/* Section 4: Person Performance Grid */}
            <PersonPerformanceGrid
              projects={projects}
              developers={developers}
              assignments={assignments}
              currencySymbol={config.currencySymbol}
            />
          </div>
        ) : activeTab === 'developer_dashboard' ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-2 p-3.5 bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-slate-50 border border-blue-100/90 rounded-2xl shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-mono font-bold text-xs shadow-xs">
                  &lt;/&gt;
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-900">Developer Portal Mobile App (PWA)</h3>
                    <span className="px-2 py-0.2 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full">Installable</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Run as a standalone mobile app on iOS & Android or desktop</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <PWAInstallButton variant="header" />
                <Link
                  to="/developer"
                  className="flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 bg-white hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors shadow-2xs cursor-pointer"
                  title="Open Dedicated Fullscreen Portal"
                >
                  <span>Standalone Portal View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
            <DeveloperDashboard
              developers={developers}
              assignments={assignments}
              projects={projects}
              currencySymbol={config.currencySymbol}
            />
          </div>
         ) : activeTab === 'project_costing' ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <ProjectCosting
              projects={projects}
              developers={developers}
              assignments={assignments}
              currencySymbol={config.currencySymbol}
            />
          </div>
        ) : activeTab === 'project_forecast' ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <ProjectForecastTab
              forecasts={projectForecasts}
              projects={projects}
              onAddForecast={handleAddForecast}
              onEditForecast={handleEditForecast}
              onDeleteForecast={handleDeleteForecast}
              onAddProject={handleAddProject}
              onDeleteProject={handleDeleteProject}
              onNavigateToPlanning={() => setActiveTab('financials')}
              currencySymbol={config.currencySymbol}
            />
          </div>
        ) : activeTab === 'project_deliveries' ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <ProjectDeliveryTracker
              projects={projects}
              currencySymbol={config.currencySymbol}
              onUpdateProject={handleUpdateProject}
              projectForecasts={projectForecasts}
              assignments={assignments}
              developers={developers}
              onNavigateToTab={(tab) => setActiveTab(tab)}
            />
          </div>
        ) : activeTab === 'project_planning' ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <ProjectPlanningSection
              currencySymbol={config.currencySymbol}
              developers={developers}
              onAddDeveloper={handleAddDeveloper}
              onUpdateDeveloper={handleUpdateDeveloper}
              onDeleteDeveloper={handleDeleteDeveloper}
              onLoadDevelopers={(loadedDevs) => setDevelopers(loadedDevs)}
              existingProjects={projects}
              onAddProjectToMaster={handleAddProject}
              assignments={assignments}
              onSyncWithMainProjects={handleSyncPlanningProjects}
              initialPlanningRows={dbPlanningRows}
              onPlanningDataChange={handlePlanningDataChange}
              onDirectSaveToDatabase={handleDirectSaveAllPlanning}
              dbSaveStatus={autoSaveStatus}
            />
          </div>
        ) : null}
          </main>
        } />
      </Routes>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 text-center text-xs text-slate-500 border-t border-slate-200/80 pt-4">
        <p>Department Budgeting & Financial Matrix Dashboard • Built with React & Tailwind CSS</p>
      </footer>

      {/* PWA Offline Connectivity Indicator */}
      <OfflineIndicator />

    </div>
  );
}
