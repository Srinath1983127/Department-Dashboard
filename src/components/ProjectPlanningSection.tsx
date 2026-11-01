import React, { useState, useEffect } from 'react';
import { 
  GripVertical, 
  Plus, 
  Trash2, 
  Download, 
  RotateCcw, 
  Search, 
  Users, 
  Target, 
  CheckCircle2, 
  AlertTriangle, 
  FileSpreadsheet, 
  Move, 
  DollarSign, 
  Calendar,
  Sparkles,
  Edit2,
  Check,
  X,
  Tag,
  Database,
  Briefcase,
  FolderKanban,
  Layers,
  ChevronLeft,
  ChevronRight,
  CalendarRange,
  ExternalLink,
  Loader2,
  CloudUpload,
  Save,
  RefreshCw,
  Undo2,
  CheckCheck
} from 'lucide-react';
import { Project, Developer, ProjectAssignment } from '../types';
import { formatCurrency } from '../utils/calculations';
import { DbPlanningRow } from '../lib/supabase';

// 12 Months matching Sri Lankan / UK corporate accounting & the user screenshot
export const PLANNING_MONTHS = [
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
  'January',
  'February'
];

export interface PlanningProjectRow {
  id: string;
  name: string;
  value: number;
  monthlyValues: number[]; // 12 elements
}

export interface PlanningMember {
  id: string;
  name: string;
  monthlyTarget: number;
  role?: string;
  projects: PlanningProjectRow[];
}

// Preset matching the exact uploaded image
export const SCREENSHOT_INITIAL_MEMBERS = [
  {
    name: 'Kawshali',
    role: 'Lead Developer',
    monthlyTarget: 900000,
    projects: [
      { id: 'p-tea-mod', name: 'Tea Module', value: 900000, monthlyValues: [900000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
      { id: 'p-sen-cost', name: 'Senarath Job Costing', value: 450000, monthlyValues: [0, 450000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
      { id: 'p-rich-cost', name: 'Richardson-Job Costing', value: 450000, monthlyValues: [0, 450000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }
    ]
  },
  {
    name: 'Yomal',
    role: 'Senior Software Engineer',
    monthlyTarget: 900000,
    projects: [
      { id: 'p-pan-asia', name: 'Pan Asia Intercompany', value: 300000, monthlyValues: [300000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
      { id: 'p-sen-inter', name: 'Senarath Intercompany', value: 300000, monthlyValues: [300000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
      { id: 'p-tab-inter', name: 'Tabrain Intercompany', value: 300000, monthlyValues: [300000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
      { id: 'p-rain-inter', name: 'Rainco Intercompany', value: 450000, monthlyValues: [0, 450000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
      { id: 'p-tnp-sap', name: 'TNP-SAP Transfer', value: 450000, monthlyValues: [0, 450000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
      { id: 'p-jlm-bom', name: 'JLM BOM Addon', value: 300000, monthlyValues: [0, 0, 300000, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
      { id: 'p-monach-prod', name: 'Monach Production Addon', value: 300000, monthlyValues: [0, 0, 300000, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
      { id: 'p-naturub-smp', name: 'Naturub-Sample Module', value: 300000, monthlyValues: [0, 0, 300000, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
      { id: 'p-naturub-cust', name: 'Naturub-Custization', value: 450000, monthlyValues: [0, 0, 0, 450000, 0, 0, 0, 0, 0, 0, 0, 0] },
      { id: 'p-ranpa-sap', name: 'Ranpa-SAP Transfer', value: 450000, monthlyValues: [0, 0, 0, 450000, 0, 0, 0, 0, 0, 0, 0, 0] }
    ]
  },
  {
    name: 'Chathurika',
    role: 'Fullstack Engineer',
    monthlyTarget: 900000,
    projects: [
      { id: 'p-kgn-app', name: 'KGN Apparels', value: 500000, monthlyValues: [500000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
      { id: 'p-ebony', name: 'Ebony', value: 400000, monthlyValues: [400000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
      { id: 'p-rain-plan', name: 'Rainco-Planing Module', value: 450000, monthlyValues: [0, 450000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
      { id: 'p-cosmo-per', name: 'Cosmo Pertly Module', value: 450000, monthlyValues: [0, 450000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }
    ]
  },
  {
    name: 'Buddhika',
    role: 'Backend & Integration Specialist',
    monthlyTarget: 900000,
    projects: [
      { id: 'p-palwatta', name: 'Palwatta SFA Integration', value: 450000, monthlyValues: [450000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
      { id: 'p-sen-sms', name: 'Senarath SMS Integration', value: 450000, monthlyValues: [450000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
      { id: 'p-sen-micro', name: 'Senarath Micro Fianace Module', value: 300000, monthlyValues: [0, 300000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
      { id: 'p-rain-lease', name: 'Rainco-Loan, Lease and Fixed Deposit Schedule', value: 300000, monthlyValues: [0, 300000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
      { id: 'p-rain-free', name: 'Rainco-Perfect Free Issue Module', value: 300000, monthlyValues: [0, 300000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
      { id: 'p-rain-bar', name: 'Rainco-Perfect Barcode Module', value: 450000, monthlyValues: [0, 0, 450000, 0, 0, 0, 0, 0, 0, 0, 0, 0] }
    ]
  }
];

const LOCAL_STORAGE_PROJECTS_KEY = 'project_planning_dev_projects_v4';

interface ProjectPlanningSectionProps {
  currencySymbol: string;
  developers: Developer[]; // LOAD DIRECTLY FROM DEVELOPERS TABLE!
  onAddDeveloper?: (dev: Omit<Developer, 'id'>) => void;
  onUpdateDeveloper?: (dev: Developer) => void;
  onDeleteDeveloper?: (id: string) => void;
  onLoadDevelopers?: (devs: Developer[]) => void;
  existingProjects?: Project[]; // PROJECT MASTER DATA!
  onAddProjectToMaster?: (project: Omit<Project, 'id'>) => void;
  assignments?: ProjectAssignment[];
  onSyncWithMainProjects?: (projects: { name: string; totalValue: number; monthlyForecast: number[] }[]) => void;
  initialPlanningRows?: DbPlanningRow[];
  onPlanningDataChange?: (data: {
    planningRows: DbPlanningRow[];
    updatedProjects: { name: string; totalValue: number; monthlyForecast: number[] }[];
    updatedAssignments?: { developerId: string; projectName: string; projectValue: number }[];
    updatedDevelopers?: Developer[];
  }) => void;
  onDirectSaveToDatabase?: (rows: DbPlanningRow[]) => Promise<void>;
  dbSaveStatus?: 'synced' | 'saving' | 'dirty' | 'idle';
}

export const ProjectPlanningSection: React.FC<ProjectPlanningSectionProps> = ({
  currencySymbol,
  developers,
  onAddDeveloper,
  onUpdateDeveloper,
  onDeleteDeveloper,
  onLoadDevelopers,
  existingProjects = [],
  onAddProjectToMaster,
  assignments = [],
  onSyncWithMainProjects,
  initialPlanningRows,
  onPlanningDataChange,
  onDirectSaveToDatabase,
  dbSaveStatus = 'synced'
}) => {
  // Store projects per developer ID (or developer name)
  const [projectsByDev, setProjectsByDev] = useState<Record<string, PlanningProjectRow[]>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PROJECTS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse planning projects cache:', e);
    }

    // Default template projects by name
    const initialMap: Record<string, PlanningProjectRow[]> = {};
    SCREENSHOT_INITIAL_MEMBERS.forEach((m) => {
      initialMap[m.name.toLowerCase().trim()] = m.projects;
    });
    return initialMap;
  });

  // UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [showQuickValuePalette, setShowQuickValuePalette] = useState(true);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberTarget, setNewMemberTarget] = useState<number>(900000);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isManualSaving, setIsManualSaving] = useState(false);

  // Per-developer dirty and saving tracking (Auto-save disabled, explicit save/update per developer)
  const [dirtyDevIds, setDirtyDevIds] = useState<Record<string, boolean>>({});
  const [savingDevIds, setSavingDevIds] = useState<Record<string, boolean>>({});
  const [savedDevSuccess, setSavedDevSuccess] = useState<Record<string, boolean>>({});
  const devSnapshotsRef = React.useRef<Record<string, PlanningProjectRow[]>>({});

  const markDevDirty = (memberId: string) => {
    setDirtyDevIds((prev) => ({ ...prev, [memberId]: true }));
  };

  // Project Master Selection Modal States
  const [addingProjectForMemberId, setAddingProjectForMemberId] = useState<string | null>(null);
  const [replacingProjectRow, setReplacingProjectRow] = useState<{ memberId: string; projectId: string } | null>(null);
  const [projectMasterSearch, setProjectMasterSearch] = useState('');
  const [customProjectName, setCustomProjectName] = useState('');
  const [customProjectValue, setCustomProjectValue] = useState<number | ''>('');
  const [saveToMasterChecked, setSaveToMasterChecked] = useState(true);

  // Drag & Drop tracking states
  const [draggedProject, setDraggedProject] = useState<{ memberId: string; projectId: string; projectName: string } | null>(null);
  const [draggedMemberId, setDraggedMemberId] = useState<string | null>(null);
  const [draggedValue, setDraggedValue] = useState<{ fromMemberId: string; fromProjectId: string; fromMonthIdx: number; value: number } | null>(null);
  const [dragOverMemberId, setDragOverMemberId] = useState<string | null>(null);
  const [dragOverCell, setDragOverCell] = useState<{ memberId: string; projectId: string; monthIdx: number } | null>(null);

  // Dedicated Member-Wise Horizontal Month Scroller state & refs
  const memberScrollRefs = React.useRef<Record<string, HTMLDivElement | null>>({});
  const grandTotalScrollRef = React.useRef<HTMLDivElement>(null);
  const [memberScrollStates, setMemberScrollStates] = useState<Record<string, {
    scrollLeft: number;
    maxScrollLeft: number;
    canScrollLeft: boolean;
    canScrollRight: boolean;
    activeMonthIdx: number;
  }>>({});

  // Global top scroller active month (for syncing or jumping all members)
  const [globalScrollLeft, setGlobalScrollLeft] = useState(0);
  const [globalMaxScrollLeft, setGlobalMaxScrollLeft] = useState(1100);
  const [globalCanScrollLeft, setGlobalCanScrollLeft] = useState(false);
  const [globalCanScrollRight, setGlobalCanScrollRight] = useState(true);

  const getMemberScrollState = (memberId: string) => {
    return memberScrollStates[memberId] || {
      scrollLeft: 0,
      maxScrollLeft: 1100,
      canScrollLeft: false,
      canScrollRight: true,
      activeMonthIdx: 0
    };
  };

  const updateMemberScrollState = (memberId: string) => {
    const el = memberScrollRefs.current[memberId];
    if (!el) return;
    const { scrollLeft: sLeft, scrollWidth, clientWidth } = el;
    const max = Math.max(0, scrollWidth - clientWidth);
    const activeIdx = Math.min(11, Math.max(0, Math.floor(sLeft / 92)));
    setMemberScrollStates((prev) => ({
      ...prev,
      [memberId]: {
        scrollLeft: sLeft,
        maxScrollLeft: max || 1,
        canScrollLeft: sLeft > 5,
        canScrollRight: sLeft < max - 5,
        activeMonthIdx: activeIdx
      }
    }));
  };

  const handleMemberScrollMonths = (memberId: string, direction: 'left' | 'right') => {
    const el = memberScrollRefs.current[memberId];
    if (!el) return;
    const step = 276; // approximately 3 months
    el.scrollBy({
      left: direction === 'left' ? -step : step,
      behavior: 'smooth'
    });
  };

  const handleMemberScrollToMonth = (memberId: string, monthIndex: number) => {
    const el = memberScrollRefs.current[memberId];
    if (!el) return;
    const targetX = monthIndex * 92;
    el.scrollTo({
      left: targetX,
      behavior: 'smooth'
    });
  };

  const handleMemberRangeScroll = (memberId: string, val: number) => {
    const el = memberScrollRefs.current[memberId];
    if (!el) return;
    el.scrollLeft = val;
    updateMemberScrollState(memberId);
  };

  // Scroll all members together to a specific month or offset
  const handleScrollAllToMonth = (monthIndex: number) => {
    const targetX = monthIndex * 92;
    setGlobalScrollLeft(targetX);
    setGlobalCanScrollLeft(targetX > 5);
    setGlobalCanScrollRight(targetX < globalMaxScrollLeft - 5);

    (Object.values(memberScrollRefs.current) as (HTMLDivElement | null)[]).forEach((el) => {
      if (el) {
        el.scrollTo({
          left: targetX,
          behavior: 'smooth'
        });
      }
    });

    if (grandTotalScrollRef.current) {
      grandTotalScrollRef.current.scrollTo({
        left: targetX,
        behavior: 'smooth'
      });
    }
  };

  // Sync all other members to this member's current scroll position
  const handleSyncMemberToAll = (memberId: string) => {
    const current = memberScrollRefs.current[memberId];
    if (!current) return;
    const targetX = current.scrollLeft;
    setGlobalScrollLeft(targetX);
    setGlobalCanScrollLeft(targetX > 5);
    setGlobalCanScrollRight(targetX < globalMaxScrollLeft - 5);

    (Object.entries(memberScrollRefs.current) as [string, HTMLDivElement | null][]).forEach(([mId, el]) => {
      if (el && mId !== memberId) {
        el.scrollTo({
          left: targetX,
          behavior: 'smooth'
        });
      }
    });

    if (grandTotalScrollRef.current) {
      grandTotalScrollRef.current.scrollTo({
        left: targetX,
        behavior: 'smooth'
      });
    }
  };

  const handleScrollMonths = (direction: 'left' | 'right') => {
    const step = 276;
    const newX = direction === 'left' ? Math.max(0, globalScrollLeft - step) : Math.min(globalMaxScrollLeft, globalScrollLeft + step);
    setGlobalScrollLeft(newX);
    setGlobalCanScrollLeft(newX > 5);
    setGlobalCanScrollRight(newX < globalMaxScrollLeft - 5);

    (Object.values(memberScrollRefs.current) as (HTMLDivElement | null)[]).forEach((el) => {
      if (el) {
        el.scrollBy({
          left: direction === 'left' ? -step : step,
          behavior: 'smooth'
        });
      }
    });

    if (grandTotalScrollRef.current) {
      grandTotalScrollRef.current.scrollBy({
        left: direction === 'left' ? -step : step,
        behavior: 'smooth'
      });
    }
  };

  const handleScrollToMonth = (monthIndex: number) => {
    handleScrollAllToMonth(monthIndex);
  };

  const handleRangeScroll = (val: number) => {
    setGlobalScrollLeft(val);
    setGlobalCanScrollLeft(val > 5);
    setGlobalCanScrollRight(val < globalMaxScrollLeft - 5);

    (Object.values(memberScrollRefs.current) as (HTMLDivElement | null)[]).forEach((el) => {
      if (el) {
        el.scrollLeft = val;
      }
    });

    if (grandTotalScrollRef.current) {
      grandTotalScrollRef.current.scrollLeft = val;
    }
  };

  const activeVisibleMonthIdx = Math.min(11, Math.max(0, Math.floor(globalScrollLeft / 92)));

  // Load from initialPlanningRows when available from database
  const hasLoadedInitialDbRef = React.useRef(false);
  useEffect(() => {
    if (initialPlanningRows && initialPlanningRows.length > 0 && !hasLoadedInitialDbRef.current) {
      hasLoadedInitialDbRef.current = true;
      const dbMap: Record<string, PlanningProjectRow[]> = {};
      initialPlanningRows.forEach((row) => {
        const devKey = row.developer_id || row.developer_name.toLowerCase().trim();
        const devNameKey = row.developer_name.toLowerCase().trim();
        if (!dbMap[devKey]) dbMap[devKey] = [];
        if (devKey !== devNameKey && !dbMap[devNameKey]) dbMap[devNameKey] = [];

        const projRow: PlanningProjectRow = {
          id: row.project_id || row.id || `p-plan-${Math.random().toString(36).substr(2, 6)}`,
          name: row.project_name,
          value: row.project_value,
          monthlyValues: Array.isArray(row.monthly_values) && row.monthly_values.length === 12
            ? [...row.monthly_values]
            : new Array(12).fill(0)
        };
        dbMap[devKey].push(projRow);
        if (devKey !== devNameKey) {
          dbMap[devNameKey].push(projRow);
        }
      });
      setProjectsByDev(dbMap);
      Object.keys(dbMap).forEach((k) => {
        devSnapshotsRef.current[k] = JSON.parse(JSON.stringify(dbMap[k]));
      });
    }
  }, [initialPlanningRows]);

  // Helper to compile current planning matrix into multi-table payloads
  // Saves to project_planning_data, projects, and developers tables.
  // CRITICAL: Kept completely separate from project_assignments so assignments are never deleted!
  const buildPlanningPayload = (currentProjectsByDev: Record<string, PlanningProjectRow[]>, currentDevs: Developer[]) => {
    const planningRows: DbPlanningRow[] = [];
    const updatedProjects: { name: string; totalValue: number; monthlyForecast: number[] }[] = [];

    currentDevs.forEach((dev, devIdx) => {
      const devIdKey = dev.id;
      const devNameKey = dev.name.toLowerCase().trim();
      const devProjects = currentProjectsByDev[devIdKey] || currentProjectsByDev[devNameKey] || [];

      devProjects.forEach((proj, projIdx) => {
        if (!proj.name.trim() || proj.name === 'Enter Project Name...' || proj.name === 'New Project') return;

        planningRows.push({
          id: proj.id,
          developer_id: dev.id,
          developer_name: dev.name,
          developer_monthly_target: dev.monthlyTarget !== undefined && dev.monthlyTarget > 0 ? dev.monthlyTarget : 900000,
          project_id: proj.id,
          project_name: proj.name,
          project_value: proj.value,
          monthly_values: proj.monthlyValues,
          sort_order: devIdx * 100 + projIdx
        });

        updatedProjects.push({
          name: proj.name,
          totalValue: proj.value,
          monthlyForecast: proj.monthlyValues
        });
      });
    });

    return { planningRows, updatedProjects, updatedDevelopers: currentDevs };
  };

  // -------------------------------------------------------------
  // MANUAL PER-DEVELOPER SAVE, UPDATE & REVERT HANDLERS
  // (Auto-saving is disabled per user specification. Edits are saved on demand.)
  // -------------------------------------------------------------

  // Save specific developer's project planning data to database & cache
  const handleSaveDeveloper = async (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    if (!member) return;

    setSavingDevIds((prev) => ({ ...prev, [memberId]: true }));
    try {
      // 1. Build payload for current matrix
      const payload = buildPlanningPayload(projectsByDev, developers);

      // 2. Persist to localStorage
      try {
        localStorage.setItem(LOCAL_STORAGE_PROJECTS_KEY, JSON.stringify(projectsByDev));
      } catch (err) {
        console.error('Failed to cache planning projects:', err);
      }

      // 3. Update parent state
      if (onPlanningDataChange) {
        onPlanningDataChange(payload);
      }

      // 4. Save to Database
      if (onDirectSaveToDatabase) {
        await onDirectSaveToDatabase(payload.planningRows);
      }

      // 5. Update snapshot for this developer
      const currentList = projectsByDev[memberId] || projectsByDev[member.name.toLowerCase().trim()] || member.projects;
      devSnapshotsRef.current[memberId] = JSON.parse(JSON.stringify(currentList));
      devSnapshotsRef.current[member.name.toLowerCase().trim()] = JSON.parse(JSON.stringify(currentList));

      // 6. Mark clean and show success state
      setDirtyDevIds((prev) => ({ ...prev, [memberId]: false }));
      setSavedDevSuccess((prev) => ({ ...prev, [memberId]: true }));
      setTimeout(() => {
        setSavedDevSuccess((prev) => ({ ...prev, [memberId]: false }));
      }, 2500);
    } catch (err) {
      console.error('Error saving developer section:', err);
    } finally {
      setSavingDevIds((prev) => ({ ...prev, [memberId]: false }));
    }
  };

  // Update & re-sync specific developer's section (checking targets and Project Master values)
  const handleUpdateDeveloperSection = async (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    if (!member) return;

    setSavingDevIds((prev) => ({ ...prev, [memberId]: true }));
    try {
      // Sync developer target if modified
      if (onUpdateDeveloper) {
        const devObj = developers.find((d) => d.id === memberId);
        if (devObj) {
          onUpdateDeveloper(devObj);
        }
      }

      // Check if any projects match Project Master and update their values
      const currentList = projectsByDev[memberId] || projectsByDev[member.name.toLowerCase().trim()] || member.projects;
      const updatedList = currentList.map((p) => {
        const masterMatch = existingProjects.find(
          (ep) => ep.name.trim().toLowerCase() === p.name.trim().toLowerCase()
        );
        if (masterMatch && (!p.value || p.value === 0)) {
          return {
            ...p,
            value: masterMatch.totalValue || p.value,
            monthlyValues: (p.monthlyValues.every((v) => v === 0) && masterMatch.monthlyForecast?.length === 12)
              ? [...masterMatch.monthlyForecast]
              : p.monthlyValues
          };
        }
        return p;
      });

      const nextProjectsMap = {
        ...projectsByDev,
        [memberId]: updatedList,
        [member.name.toLowerCase().trim()]: updatedList
      };

      setProjectsByDev(nextProjectsMap);

      try {
        localStorage.setItem(LOCAL_STORAGE_PROJECTS_KEY, JSON.stringify(nextProjectsMap));
      } catch (_) {}

      // Trigger DB & parent sync
      const payload = buildPlanningPayload(nextProjectsMap, developers);
      if (onPlanningDataChange) onPlanningDataChange(payload);
      if (onDirectSaveToDatabase) await onDirectSaveToDatabase(payload.planningRows);

      devSnapshotsRef.current[memberId] = JSON.parse(JSON.stringify(updatedList));
      devSnapshotsRef.current[member.name.toLowerCase().trim()] = JSON.parse(JSON.stringify(updatedList));

      setDirtyDevIds((prev) => ({ ...prev, [memberId]: false }));
      setSavedDevSuccess((prev) => ({ ...prev, [memberId]: true }));
      setTimeout(() => {
        setSavedDevSuccess((prev) => ({ ...prev, [memberId]: false }));
      }, 2500);
    } catch (err) {
      console.error('Error updating developer section:', err);
    } finally {
      setSavingDevIds((prev) => ({ ...prev, [memberId]: false }));
    }
  };

  // Discard unsaved changes for a specific developer
  const handleDiscardDeveloperChanges = (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    if (!member) return;

    const snapshot = devSnapshotsRef.current[memberId] || devSnapshotsRef.current[member.name.toLowerCase().trim()];
    if (!snapshot) {
      setDirtyDevIds((prev) => ({ ...prev, [memberId]: false }));
      return;
    }

    setProjectsByDev((prev) => ({
      ...prev,
      [memberId]: JSON.parse(JSON.stringify(snapshot)),
      [member.name.toLowerCase().trim()]: JSON.parse(JSON.stringify(snapshot))
    }));

    setDirtyDevIds((prev) => ({ ...prev, [memberId]: false }));
  };

  // Direct manual save for ALL developers
  const handleSaveAllDevelopers = async () => {
    setIsManualSaving(true);
    try {
      const payload = buildPlanningPayload(projectsByDev, developers);
      try {
        localStorage.setItem(LOCAL_STORAGE_PROJECTS_KEY, JSON.stringify(projectsByDev));
      } catch (_) {}
      if (onPlanningDataChange) {
        onPlanningDataChange(payload);
      }
      if (onDirectSaveToDatabase) {
        await onDirectSaveToDatabase(payload.planningRows);
      }

      // Update snapshots for all developers
      members.forEach((m) => {
        const list = projectsByDev[m.id] || projectsByDev[m.name.toLowerCase().trim()] || m.projects;
        devSnapshotsRef.current[m.id] = JSON.parse(JSON.stringify(list));
        devSnapshotsRef.current[m.name.toLowerCase().trim()] = JSON.parse(JSON.stringify(list));
      });

      setDirtyDevIds({});
    } finally {
      setIsManualSaving(false);
    }
  };

  // Backward compatibility alias for global manual save button
  const handleManualSave = handleSaveAllDevelopers;

  // Derived Members List from `developers` table!
  const members: PlanningMember[] = developers.map((dev) => {
    const devIdKey = dev.id;
    const devNameKey = dev.name.toLowerCase().trim();

    // Look up projects by id first, then by name
    let devProjects = projectsByDev[devIdKey] || projectsByDev[devNameKey];

    // If still empty, check if assignments associate any existingProjects to this dev
    if (!devProjects || devProjects.length === 0) {
      const devAssignments = assignments.filter((a) => a.developerId === dev.id);
      if (devAssignments.length > 0) {
        devProjects = devAssignments.map((a) => {
          const matchedProj = existingProjects.find((p) => p.id === a.projectId);
          return {
            id: `p-assign-${a.id}`,
            name: matchedProj ? matchedProj.name : 'Assigned Project',
            value: a.projectValue || (matchedProj ? matchedProj.totalValue : 0),
            monthlyValues: matchedProj?.monthlyForecast ? [...matchedProj.monthlyForecast] : new Array(12).fill(0)
          };
        });
      }
    }

    // Default to at least one editable project row if none exist
    if (!devProjects || devProjects.length === 0) {
      devProjects = [
        {
          id: `p-init-${dev.id}`,
          name: 'Enter Project Name...',
          value: 0,
          monthlyValues: new Array(12).fill(0)
        }
      ];
    }

    return {
      id: dev.id,
      name: dev.name,
      role: dev.role,
      monthlyTarget: dev.monthlyTarget !== undefined && dev.monthlyTarget > 0 ? dev.monthlyTarget : 900000,
      projects: devProjects
    };
  });

  // Load Image Preset into Developers Table
  const handleLoadImagePresetIntoDevelopers = () => {
    if (window.confirm('Load Kawshali, Yomal, Chathurika, Buddhika from image directly into the Developers Table with 900,000 monthly target?')) {
      const newDevs: Developer[] = SCREENSHOT_INITIAL_MEMBERS.map((m) => ({
        id: crypto.randomUUID(),
        name: m.name,
        role: m.role,
        maxWeeklyHours: 40,
        monthlyTarget: m.monthlyTarget
      }));

      if (onLoadDevelopers) {
        onLoadDevelopers(newDevs);
      } else if (onAddDeveloper) {
        newDevs.forEach((d) => onAddDeveloper(d));
      }

      setProjectsByDev((prev) => {
        const next = { ...prev };
        newDevs.forEach((nd) => {
          const template = SCREENSHOT_INITIAL_MEMBERS.find((sm) => sm.name.toLowerCase() === nd.name.toLowerCase());
          if (template) {
            next[nd.id] = template.projects;
            next[nd.name.toLowerCase().trim()] = template.projects;
          }
        });
        return next;
      });
    }
  };

  // Add new member to developers table
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    const newDev: Omit<Developer, 'id'> = {
      name: newMemberName.trim(),
      role: 'Fullstack Developer',
      maxWeeklyHours: 40,
      monthlyTarget: Number(newMemberTarget) || 900000
    };

    if (onAddDeveloper) {
      onAddDeveloper(newDev);
    }

    setNewMemberName('');
    setNewMemberTarget(900000);
    setIsAddingMember(false);
  };

  // Delete member from developers table
  const handleDeleteMember = (memberId: string) => {
    if (window.confirm('Delete this developer from the Developers Table?')) {
      if (onDeleteDeveloper) {
        onDeleteDeveloper(memberId);
      }
    }
  };

  // Update member field (name or monthlyTarget) directly in Developers table!
  const handleUpdateMemberField = (memberId: string, field: 'name' | 'monthlyTarget', val: string | number) => {
    const targetDev = developers.find((d) => d.id === memberId);
    if (!targetDev || !onUpdateDeveloper) return;

    markDevDirty(memberId);
    if (field === 'monthlyTarget') {
      onUpdateDeveloper({
        ...targetDev,
        monthlyTarget: Number(val) || 0
      });
    } else {
      onUpdateDeveloper({
        ...targetDev,
        name: String(val)
      });
    }
  };

  // -------------------------------------------------------------
  // PROJECT MASTER SELECTION & ADDITION
  // -------------------------------------------------------------

  // Trigger Project Master Picker Modal
  const openProjectMasterPicker = (memberId: string, rowIdToReplace?: string) => {
    setAddingProjectForMemberId(memberId);
    if (rowIdToReplace) {
      setReplacingProjectRow({ memberId, projectId: rowIdToReplace });
    } else {
      setReplacingProjectRow(null);
    }
    setProjectMasterSearch('');
    setCustomProjectName('');
    setCustomProjectValue('');
  };

  // Select project from Project Master catalog
  const handleSelectProjectFromMaster = (targetMemberId: string, masterProj: Project) => {
    const newProjectRow: PlanningProjectRow = {
      id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: masterProj.name,
      value: masterProj.totalValue || 0,
      monthlyValues: masterProj.monthlyForecast && masterProj.monthlyForecast.length === 12
        ? [...masterProj.monthlyForecast]
        : new Array(12).fill(0)
    };

    markDevDirty(targetMemberId);
    setProjectsByDev((prev) => {
      const member = members.find((m) => m.id === targetMemberId);
      const memberNameKey = member?.name.toLowerCase().trim() || '';
      const currentList = prev[targetMemberId] || (memberNameKey ? prev[memberNameKey] : []) || member?.projects || [];

      // If replacing a specific row
      if (replacingProjectRow && replacingProjectRow.memberId === targetMemberId) {
        const updated = currentList.map((p) => (p.id === replacingProjectRow.projectId ? newProjectRow : p));
        return {
          ...prev,
          [targetMemberId]: updated,
          ...(memberNameKey ? { [memberNameKey]: updated } : {})
        };
      }

      // If adding new: clean up dummy rows if only dummy row existed
      const cleanedList = currentList.filter(
        (p) => p.name !== 'Enter Project Name...' && p.name !== 'New Project'
      );

      const nextList = [...cleanedList, newProjectRow];
      return {
        ...prev,
        [targetMemberId]: nextList,
        ...(memberNameKey ? { [memberNameKey]: nextList } : {})
      };
    });

    setAddingProjectForMemberId(null);
    setReplacingProjectRow(null);
  };

  // Add custom project (with option to register into Project Master)
  const handleAddCustomProject = (targetMemberId: string) => {
    if (!customProjectName.trim()) return;

    const val = Number(customProjectValue) || 0;
    const newProjectRow: PlanningProjectRow = {
      id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: customProjectName.trim(),
      value: val,
      monthlyValues: new Array(12).fill(0)
    };

    // Save into Project Master pool if checkbox enabled
    if (saveToMasterChecked && onAddProjectToMaster) {
      onAddProjectToMaster({
        name: customProjectName.trim(),
        category: 'Client Work',
        totalValue: val,
        status: 'planning',
        color: '#8b5cf6',
        monthlyForecast: new Array(12).fill(0),
        isExpanded: true
      });
    }

    markDevDirty(targetMemberId);
    setProjectsByDev((prev) => {
      const member = members.find((m) => m.id === targetMemberId);
      const memberNameKey = member?.name.toLowerCase().trim() || '';
      const currentList = prev[targetMemberId] || (memberNameKey ? prev[memberNameKey] : []) || member?.projects || [];

      if (replacingProjectRow && replacingProjectRow.memberId === targetMemberId) {
        const updated = currentList.map((p) => (p.id === replacingProjectRow.projectId ? newProjectRow : p));
        return {
          ...prev,
          [targetMemberId]: updated,
          ...(memberNameKey ? { [memberNameKey]: updated } : {})
        };
      }

      const cleanedList = currentList.filter(
        (p) => p.name !== 'Enter Project Name...' && p.name !== 'New Project'
      );

      const nextList = [...cleanedList, newProjectRow];
      return {
        ...prev,
        [targetMemberId]: nextList,
        ...(memberNameKey ? { [memberNameKey]: nextList } : {})
      };
    });

    setCustomProjectName('');
    setCustomProjectValue('');
    setAddingProjectForMemberId(null);
    setReplacingProjectRow(null);
  };

  // Delete project from member
  const handleDeleteProject = (memberId: string, projectId: string) => {
    const member = members.find((m) => m.id === memberId);
    if (!member) return;

    markDevDirty(memberId);
    setProjectsByDev((prev) => {
      const currentList = prev[memberId] || prev[member.name.toLowerCase().trim()] || member.projects;
      const updatedList = currentList.filter((p) => p.id !== projectId);
      return {
        ...prev,
        [memberId]: updatedList,
        [member.name.toLowerCase().trim()]: updatedList
      };
    });
  };

  // Update project name or contract value inline
  const handleUpdateProject = (memberId: string, projectId: string, field: 'name' | 'value', val: string | number) => {
    const member = members.find((m) => m.id === memberId);
    if (!member) return;

    markDevDirty(memberId);
    // Check if entered name matches an existing project in Project Master
    let autoValue: number | undefined;
    let autoMonthly: number[] | undefined;

    if (field === 'name' && typeof val === 'string') {
      const matched = existingProjects.find(
        (p) => p.name.trim().toLowerCase() === val.trim().toLowerCase()
      );
      if (matched) {
        autoValue = matched.totalValue;
        if (matched.monthlyForecast && matched.monthlyForecast.length === 12) {
          autoMonthly = [...matched.monthlyForecast];
        }
      }
    }

    setProjectsByDev((prev) => {
      const currentList = prev[memberId] || prev[member.name.toLowerCase().trim()] || member.projects;
      const updatedList = currentList.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            [field]: field === 'value' ? Number(val) || 0 : val,
            ...(autoValue !== undefined ? { value: autoValue } : {}),
            ...(autoMonthly !== undefined ? { monthlyValues: autoMonthly } : {})
          };
        }
        return p;
      });
      return {
        ...prev,
        [memberId]: updatedList,
        [member.name.toLowerCase().trim()]: updatedList
      };
    });
  };

  // Update specific month value
  const handleUpdateMonthValue = (memberId: string, projectId: string, monthIdx: number, val: number) => {
    const member = members.find((m) => m.id === memberId);
    if (!member) return;

    markDevDirty(memberId);
    setProjectsByDev((prev) => {
      const currentList = prev[memberId] || prev[member.name.toLowerCase().trim()] || member.projects;
      const updatedList = currentList.map((p) => {
        if (p.id === projectId) {
          const newMonthly = [...p.monthlyValues];
          newMonthly[monthIdx] = Math.max(0, Number(val) || 0);
          return {
            ...p,
            monthlyValues: newMonthly
          };
        }
        return p;
      });
      return {
        ...prev,
        [memberId]: updatedList,
        [member.name.toLowerCase().trim()]: updatedList
      };
    });
  };

  // -------------------------------------------------------------
  // DRAG & DROP HANDLERS
  // -------------------------------------------------------------

  // 1. Project Drag
  const handleProjectDragStart = (e: React.DragEvent, memberId: string, projectId: string, projectName: string) => {
    e.stopPropagation();
    setDraggedProject({ memberId, projectId, projectName });
    e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'PROJECT', memberId, projectId }));
    e.dataTransfer.effectAllowed = 'move';
  };

  // 2. Member Drag (Reorder in developers table)
  const handleMemberDragStart = (e: React.DragEvent, memberId: string) => {
    setDraggedMemberId(memberId);
    e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'MEMBER', memberId }));
    e.dataTransfer.effectAllowed = 'move';
  };

  // 3. Value Tag Drag
  const handleValueDragStart = (e: React.DragEvent, fromMemberId: string, fromProjectId: string, fromMonthIdx: number, value: number) => {
    e.stopPropagation();
    setDraggedValue({ fromMemberId, fromProjectId, fromMonthIdx, value });
    e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'VALUE', fromMemberId, fromProjectId, fromMonthIdx, value }));
    e.dataTransfer.effectAllowed = 'copyMove';
  };

  // Drop onto a Member (Move project to that member)
  const handleDropOnMember = (e: React.DragEvent, targetMemberId: string) => {
    e.preventDefault();
    setDragOverMemberId(null);

    // Reorder members in developers table
    if (draggedMemberId) {
      if (draggedMemberId !== targetMemberId && onLoadDevelopers) {
        const fromIndex = developers.findIndex((d) => d.id === draggedMemberId);
        const toIndex = developers.findIndex((d) => d.id === targetMemberId);
        if (fromIndex >= 0 && toIndex >= 0) {
          const updated = [...developers];
          const [moved] = updated.splice(fromIndex, 1);
          updated.splice(toIndex, 0, moved);
          onLoadDevelopers(updated);
        }
      }
      setDraggedMemberId(null);
      return;
    }

    // Move project to another member
    if (draggedProject) {
      const { memberId: srcMemberId, projectId } = draggedProject;
      if (srcMemberId === targetMemberId) {
        setDraggedProject(null);
        return;
      }

      const srcMember = members.find((m) => m.id === srcMemberId);
      const targetMember = members.find((m) => m.id === targetMemberId);
      if (!srcMember || !targetMember) return;

      const movingProject = srcMember.projects.find((p) => p.id === projectId);
      if (!movingProject) return;

      markDevDirty(srcMemberId);
      markDevDirty(targetMemberId);
      setProjectsByDev((prev) => {
        const srcList = (prev[srcMemberId] || srcMember.projects).filter((p) => p.id !== projectId);
        const targetList = [...(prev[targetMemberId] || targetMember.projects), movingProject];

        return {
          ...prev,
          [srcMemberId]: srcList,
          [srcMember.name.toLowerCase().trim()]: srcList,
          [targetMemberId]: targetList,
          [targetMember.name.toLowerCase().trim()]: targetList
        };
      });

      setDraggedProject(null);
    }
  };

  // Drop onto a Month Cell (Move / copy value)
  const handleDropOnCell = (e: React.DragEvent, toMemberId: string, toProjectId: string, toMonthIdx: number) => {
    e.preventDefault();
    setDragOverCell(null);

    if (draggedValue) {
      const { fromMemberId, fromProjectId, fromMonthIdx, value } = draggedValue;
      if (fromMemberId === toMemberId && fromProjectId === toProjectId && fromMonthIdx === toMonthIdx) {
        setDraggedValue(null);
        return;
      }

      const fromMember = members.find((m) => m.id === fromMemberId);
      const toMember = members.find((m) => m.id === toMemberId);
      if (!fromMember || !toMember) return;

      markDevDirty(fromMemberId);
      markDevDirty(toMemberId);
      setProjectsByDev((prev) => {
        const next = { ...prev };

        // 1. Remove from source
        const srcList = (next[fromMemberId] || fromMember.projects).map((p) => {
          if (p.id === fromProjectId) {
            const monthly = [...p.monthlyValues];
            monthly[fromMonthIdx] = 0;
            return { ...p, monthlyValues: monthly };
          }
          return p;
        });
        next[fromMemberId] = srcList;
        next[fromMember.name.toLowerCase().trim()] = srcList;

        // 2. Add to target
        const targetList = (next[toMemberId] || toMember.projects).map((p) => {
          if (p.id === toProjectId) {
            const monthly = [...p.monthlyValues];
            monthly[toMonthIdx] = (monthly[toMonthIdx] || 0) + value;
            return { ...p, monthlyValues: monthly };
          }
          return p;
        });
        next[toMemberId] = targetList;
        next[toMember.name.toLowerCase().trim()] = targetList;

        return next;
      });

      setDraggedValue(null);
      return;
    }

    // Preset palette tag drop
    try {
      const dataStr = e.dataTransfer.getData('text/plain');
      if (dataStr) {
        const parsed = JSON.parse(dataStr);
        if (parsed.type === 'PRESET_VALUE' && typeof parsed.value === 'number') {
          handleUpdateMonthValue(toMemberId, toProjectId, toMonthIdx, parsed.value);
        }
      }
    } catch (_) {}
  };

  // Export table as CSV
  const handleExportCSV = () => {
    const headers = ['Member', 'Role', 'Project', 'Project Value', 'Member MonthlyTarget', ...PLANNING_MONTHS, 'Total Planned'];
    const rows: string[][] = [];

    members.forEach((member) => {
      member.projects.forEach((project) => {
        const totalPlanned = project.monthlyValues.reduce((s, v) => s + v, 0);
        rows.push([
          `"${member.name}"`,
          `"${member.role || 'Developer'}"`,
          `"${project.name}"`,
          `${project.value}`,
          `${member.monthlyTarget}`,
          ...project.monthlyValues.map((v) => `${v}`),
          `${totalPlanned}`
        ]);
      });
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Project_Planning_Developers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtering by search query
  const filteredMembers = members.filter((m) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const matchesMember = m.name.toLowerCase().includes(query) || (m.role || '').toLowerCase().includes(query);
    const matchesProject = m.projects.some((p) => p.name.toLowerCase().includes(query));
    return matchesMember || matchesProject;
  });

  // Filter Project Master list in Modal
  const filteredMasterProjects = existingProjects.filter((p) => {
    if (!projectMasterSearch.trim()) return true;
    const q = projectMasterSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q) ||
      (p.client || '').toLowerCase().includes(q)
    );
  });

  // Grand totals across all members & projects
  const grandTotalMonthly = PLANNING_MONTHS.map((_, monthIdx) => {
    return members.reduce((sum, member) => {
      return sum + member.projects.reduce((pSum, proj) => pSum + (proj.monthlyValues[monthIdx] || 0), 0);
    }, 0);
  });

  const grandTotalProjectValue = members.reduce((sum, member) => {
    return sum + member.projects.reduce((pSum, p) => pSum + p.value, 0);
  }, 0);

  const grandTotalMonthlyTarget = members.reduce((sum, member) => sum + member.monthlyTarget, 0);
  const grandTotalPlanned = grandTotalMonthly.reduce((s, v) => s + v, 0);

  // Active target member for the Project Master modal
  const activeModalMember = members.find((m) => m.id === addingProjectForMemberId);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col relative">
      {/* HTML5 Datalist for Project Master autocomplete */}
      <datalist id="project-master-datalist">
        {existingProjects.map((p) => (
          <option key={p.id} value={p.name}>
            {p.category ? `${p.category} • ` : ''}{formatCurrency(p.totalValue, currencySymbol)}
          </option>
        ))}
      </datalist>

      {/* Top Banner & Control Bar */}
      <div className="p-4 sm:p-6 bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 text-white border-b border-purple-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-purple-700/60 rounded-xl border border-purple-500/50 text-white shadow-xs">
                <FileSpreadsheet className="w-6 h-6" />
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    Project Planning Matrix
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                    <Database className="w-3 h-3 text-emerald-300" />
                    <span>Loaded from Developers Table ({developers.length} Developers)</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/40 text-purple-200 border border-purple-400/30">
                    <FolderKanban className="w-3 h-3 text-purple-300" />
                    <span>Project Master Linked ({existingProjects.length} Projects)</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/30 text-amber-200 border border-amber-400/30">
                    <Save className="w-3 h-3 text-amber-300" />
                    <span>Auto-Save Disabled • Manual Save Per Developer</span>
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-purple-200/90 font-medium mt-0.5">
                  Members load live from <strong className="text-white">developers</strong>. Auto-saving is turned off—use the dedicated <strong className="text-white">Save</strong> and <strong className="text-white">Update</strong> buttons on each developer section to save your planning changes.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons & Database Sync Controls */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Live Database Sync Badge & Manual Save Button */}
            <button
              onClick={handleSaveAllDevelopers}
              disabled={isManualSaving || dbSaveStatus === 'saving'}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer border ${
                dbSaveStatus === 'saving' || isManualSaving
                  ? 'bg-amber-500/20 text-amber-200 border-amber-400/50 cursor-wait'
                  : Object.values(dirtyDevIds).some(Boolean)
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black border-emerald-300 shadow-emerald-950/40 ring-2 ring-emerald-400 animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/40 shadow-emerald-950/40'
              }`}
              title="Saves all developers' project planning data to project_planning_data, projects, and developers tables. Preserves project_assignments independently."
            >
              {isManualSaving || dbSaveStatus === 'saving' ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
                  <span>Saving All Developers...</span>
                </>
              ) : Object.values(dirtyDevIds).some(Boolean) ? (
                <>
                  <Save className="w-3.5 h-3.5 text-emerald-950" />
                  <span>Save All Changes ({Object.values(dirtyDevIds).filter(Boolean).length} Unsaved)</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span>All Developers Synced</span>
                </>
              )}
            </button>

            <button
              onClick={handleLoadImagePresetIntoDevelopers}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-purple-700/80 hover:bg-purple-600 rounded-lg shadow-sm border border-purple-500/50 transition-all cursor-pointer"
              title="Populates Kawshali, Yomal, Chathurika, Buddhika directly into the Developers Table with 900k target"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Load Template</span>
            </button>

            <button
              onClick={() => setIsAddingMember(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-lg shadow-sm transition-all cursor-pointer"
              title="Adds a new developer to the developers table"
            >
              <Plus className="w-3.5 h-3.5 text-purple-700" />
              <span>Add Developer</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-purple-100 hover:text-white bg-purple-900/60 hover:bg-purple-800/80 border border-purple-600 rounded-lg shadow-sm transition-all cursor-pointer"
              title="Download planning data as Excel CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Quick Drag & Drop Instruction Pill */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-purple-800/60 text-xs">
          <div className="flex items-center gap-2 text-purple-200 font-medium">
            <Move className="w-4 h-4 text-purple-300" />
            <span>
              <strong>Tips:</strong> Click <span className="font-semibold text-white">+ Add Project</span> to pick from <span className="font-semibold text-white">Project Master</span>. Drag <span className="font-semibold text-white">⋮⋮ Grip</span> to reassign projects!
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-purple-300" />
              <input
                type="text"
                placeholder="Search developer or project..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1 bg-purple-950/60 border border-purple-700 focus:border-purple-300 rounded-lg text-xs text-white placeholder-purple-300/70 outline-none w-48 sm:w-60"
              />
            </div>
            <button
              onClick={() => setShowQuickValuePalette(!showQuickValuePalette)}
              className="text-xs text-purple-200 hover:text-white underline underline-offset-2 cursor-pointer font-medium"
            >
              {showQuickValuePalette ? 'Hide Quick Tags' : 'Show Quick Tags'}
            </button>
          </div>
        </div>

        {/* Draggable Value Tags Palette */}
        {showQuickValuePalette && (
          <div className="mt-3 p-2.5 bg-purple-950/70 border border-purple-700/80 rounded-xl flex items-center flex-wrap gap-2 text-xs animate-in fade-in duration-200">
            <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1 mr-1">
              <Tag className="w-3 h-3 text-purple-400" />
              <span>Drag Value Tag:</span>
            </span>
            {[900000, 500000, 450000, 400000, 300000, 150000, 100000].map((val) => (
              <div
                key={val}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'PRESET_VALUE', value: val }));
                  e.dataTransfer.effectAllowed = 'copy';
                }}
                className="px-2.5 py-1 bg-purple-700/70 hover:bg-purple-600 border border-purple-400/60 rounded-md text-white font-mono font-bold text-xs cursor-grab active:cursor-grabbing shadow-xs transition-transform hover:scale-105 select-none"
                title={`Drag ${formatCurrency(val, currencySymbol)} into any monthly cell`}
              >
                {formatCurrency(val, currencySymbol)}
              </div>
            ))}
            <span className="text-[10px] text-purple-300 ml-auto italic hidden lg:inline">
              Drag directly onto any monthly box below
            </span>
          </div>
        )}
      </div>

      {/* Add New Developer to Table Bar */}
      {isAddingMember && (
        <form onSubmit={handleAddMember} className="p-4 bg-purple-50 border-b border-purple-200 flex flex-wrap items-center gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-purple-900 uppercase">Developer Name:</span>
            <input
              type="text"
              required
              placeholder="e.g. Ruwan Silva"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-purple-300 bg-white text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-purple-500 outline-none w-48"
              autoFocus
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-purple-900 uppercase">Monthly Target ({currencySymbol}):</span>
            <input
              type="number"
              required
              min="0"
              step="10000"
              placeholder="900000"
              value={newMemberTarget}
              onChange={(e) => setNewMemberTarget(Number(e.target.value))}
              className="px-3 py-1.5 rounded-lg border border-purple-300 bg-white text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-purple-500 outline-none w-36"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save to Developers Table</span>
            </button>
            <button
              type="button"
              onClick={() => setIsAddingMember(false)}
              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Master Month View Controller (Scroll All Members Together) */}
      <div className="bg-purple-950/95 text-white px-4 py-2.5 border-b border-purple-800 flex flex-wrap items-center justify-between gap-3 text-xs select-none">
        <div className="flex items-center gap-2">
          <CalendarRange className="w-4 h-4 text-purple-300" />
          <span className="font-bold text-white tracking-wide uppercase text-[11px]">
            Master Month Controller (All Members):
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-800 text-purple-200 border border-purple-600">
            Current Focus: <strong className="text-white">{PLANNING_MONTHS[activeVisibleMonthIdx]}</strong>
          </span>
        </div>

        {/* Global Controls to scroll all members */}
        <div className="flex items-center gap-2 flex-1 max-w-xl mx-2">
          <button
            type="button"
            onClick={() => handleScrollMonths('left')}
            disabled={!globalCanScrollLeft}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              globalCanScrollLeft
                ? 'bg-purple-800 hover:bg-purple-700 text-white border-purple-600 shadow-xs'
                : 'bg-purple-950/40 text-purple-400/40 border-purple-900 cursor-not-allowed'
            }`}
            title="Scroll all members to earlier months"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="relative flex-1 bg-purple-900/90 rounded-lg p-1 border border-purple-700/80 flex items-center overflow-hidden">
            <div className="w-full flex justify-between px-1 text-[9px] font-mono text-purple-300">
              {PLANNING_MONTHS.map((m, idx) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleScrollToMonth(idx)}
                  className={`px-1 py-0.5 rounded transition-all cursor-pointer ${
                    idx === activeVisibleMonthIdx
                      ? 'bg-purple-600 text-white font-bold ring-1 ring-purple-300'
                      : 'hover:bg-purple-800/80 hover:text-white'
                  }`}
                  title={`Scroll all to ${m}`}
                >
                  {m.slice(0, 3)}
                </button>
              ))}
            </div>

            <input
              type="range"
              min="0"
              max={globalMaxScrollLeft}
              value={globalScrollLeft}
              onChange={(e) => handleRangeScroll(Number(e.target.value))}
              className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full"
              title="Drag to scroll all members simultaneously"
            />
          </div>

          <button
            type="button"
            onClick={() => handleScrollMonths('right')}
            disabled={!globalCanScrollRight}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              globalCanScrollRight
                ? 'bg-purple-800 hover:bg-purple-700 text-white border-purple-600 shadow-xs'
                : 'bg-purple-950/40 text-purple-400/40 border-purple-900 cursor-not-allowed'
            }`}
            title="Scroll all members to later months"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Quarter Jump Pills */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleScrollToMonth(0)}
            className="px-2 py-1 rounded bg-purple-900/80 hover:bg-purple-700 text-purple-200 hover:text-white text-[10px] font-bold border border-purple-700 transition-colors cursor-pointer"
            title="Scroll all members to Q1 (March - May)"
          >
            All Q1
          </button>
          <button
            type="button"
            onClick={() => handleScrollToMonth(3)}
            className="px-2 py-1 rounded bg-purple-900/80 hover:bg-purple-700 text-purple-200 hover:text-white text-[10px] font-bold border border-purple-700 transition-colors cursor-pointer"
            title="Scroll all members to Q2 (June - August)"
          >
            All Q2
          </button>
          <button
            type="button"
            onClick={() => handleScrollToMonth(6)}
            className="px-2 py-1 rounded bg-purple-900/80 hover:bg-purple-700 text-purple-200 hover:text-white text-[10px] font-bold border border-purple-700 transition-colors cursor-pointer"
            title="Scroll all members to Q3 (September - November)"
          >
            All Q3
          </button>
          <button
            type="button"
            onClick={() => handleScrollToMonth(9)}
            className="px-2 py-1 rounded bg-purple-900/80 hover:bg-purple-700 text-purple-200 hover:text-white text-[10px] font-bold border border-purple-700 transition-colors cursor-pointer"
            title="Scroll all members to Q4 (December - February)"
          >
            All Q4
          </button>
        </div>
      </div>

      {/* MEMBER-WISE PROJECT PLANNING SECTIONS */}
      <div className="p-4 sm:p-5 bg-slate-100/70 space-y-6">
        {filteredMembers.length === 0 ? (
          <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex flex-col items-center justify-center">
              <Users className="w-10 h-10 mb-2 opacity-30 text-purple-600" />
              <p className="font-bold text-slate-800 text-base">No developers found in the developers table.</p>
              <p className="text-xs text-slate-500 mt-1 max-w-md">Click below to load template developers directly from the user specification or add a new developer.</p>
              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={handleLoadImagePresetIntoDevelopers}
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Load Template Developers</span>
                </button>
                <button
                  onClick={() => setIsAddingMember(true)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs border border-slate-300 cursor-pointer"
                >
                  + Add Developer
                </button>
              </div>
            </div>
          </div>
        ) : (
          filteredMembers.map((member) => {
            const projectCount = member.projects.length;
            const memberTotalValue = member.projects.reduce((s, p) => s + p.value, 0);

            // Calculate member's monthly totals across 12 months
            const memberMonthTotals = PLANNING_MONTHS.map((_, mIdx) => {
              return member.projects.reduce((s, p) => s + (p.monthlyValues[mIdx] || 0), 0);
            });
            const memberTotalPlannedAllMonths = memberMonthTotals.reduce((s, v) => s + v, 0);

            // Get this member's dedicated scroll state
            const mScroll = getMemberScrollState(member.id);
            const isDropTarget = dragOverMemberId === member.id;

            // Per-developer save and dirty tracking
            const isDevDirty = !!dirtyDevIds[member.id] || !!dirtyDevIds[member.name.toLowerCase().trim()];
            const isDevSaving = !!savingDevIds[member.id];
            const isDevSaved = !!savedDevSuccess[member.id];

            return (
              <div
                key={member.id}
                className={`bg-white rounded-2xl border transition-all shadow-sm overflow-hidden ${
                  isDropTarget ? 'border-purple-500 ring-2 ring-purple-400 shadow-purple-100' : 'border-purple-200/90 hover:border-purple-300'
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (draggedProject && draggedProject.memberId !== member.id) {
                    setDragOverMemberId(member.id);
                  }
                }}
                onDragLeave={() => {
                  if (dragOverMemberId === member.id) setDragOverMemberId(null);
                }}
                onDrop={(e) => handleDropOnMember(e, member.id)}
              >
                {/* 1. Member Information Header Bar with Dedicated Section Save, Update, Discard Buttons */}
                <div className="bg-gradient-to-r from-[#581c87] via-[#6b21a8] to-[#4c1d95] text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      draggable
                      onDragStart={(e) => handleMemberDragStart(e, member.id)}
                      className="cursor-grab active:cursor-grabbing text-purple-300 hover:text-white p-1 rounded-lg bg-purple-900/60 border border-purple-600/50"
                      title="Drag to reorder developer in table"
                    >
                      <GripVertical className="w-4 h-4" />
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-purple-700/80 border border-purple-400/40 flex items-center justify-center font-bold text-white shadow-2xs">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={member.name}
                            onChange={(e) => handleUpdateMemberField(member.id, 'name', e.target.value)}
                            className="font-black text-white bg-transparent hover:bg-purple-900/60 focus:bg-purple-900 px-1.5 py-0.5 rounded-lg border border-transparent hover:border-purple-500 focus:border-purple-400 outline-none text-sm w-36 sm:w-44"
                            title="Edit developer name in developers table"
                          />
                          {member.role && (
                            <span className="text-[10px] text-purple-200 font-semibold bg-purple-800/80 border border-purple-600/60 px-2 py-0.5 rounded-full hidden sm:inline">
                              {member.role}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-purple-200/80 flex items-center gap-2 mt-0.5">
                          <span>{projectCount} {projectCount === 1 ? 'Project' : 'Projects'}</span>
                          <span>•</span>
                          <span>Value: <strong className="text-white font-mono">{formatCurrency(memberTotalValue, currencySymbol)}</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Monthly Target and Per-Developer Action Buttons: Save, Update, Discard, Add Project */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Monthly Target Box */}
                    <div className="flex items-center gap-1.5 bg-purple-950/60 border border-purple-700 px-2.5 py-1 rounded-xl">
                      <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">
                        Target / Mo:
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="10000"
                        value={member.monthlyTarget || ''}
                        onChange={(e) => handleUpdateMemberField(member.id, 'monthlyTarget', e.target.value)}
                        className="w-24 text-right font-mono font-bold text-white bg-purple-900/90 px-1.5 py-0.5 rounded border border-purple-600 focus:border-purple-400 outline-none text-xs"
                        placeholder="900000"
                        title="Updates monthly_target in developers table"
                      />
                    </div>

                    {/* Developer Status Pill */}
                    {isDevSaving ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-500/20 text-blue-200 border border-blue-400/40 animate-pulse">
                        <Loader2 className="w-3 h-3 animate-spin text-blue-300" />
                        <span>Saving...</span>
                      </span>
                    ) : isDevSaved ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/50">
                        <Check className="w-3 h-3 text-emerald-300" />
                        <span>Saved to DB</span>
                      </span>
                    ) : isDevDirty ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/30 text-amber-200 border border-amber-400/50 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                        <span>Unsaved</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-purple-900/60 text-purple-300 border border-purple-700/60 hidden sm:inline-flex">
                        <CheckCircle2 className="w-3 h-3 text-purple-400" />
                        <span>Synced</span>
                      </span>
                    )}

                    {/* DEDICATED SAVE BUTTON FOR THIS DEVELOPER */}
                    <button
                      type="button"
                      onClick={() => handleSaveDeveloper(member.id)}
                      disabled={isDevSaving}
                      className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer border ${
                        isDevSaving
                          ? 'bg-purple-900/80 text-purple-300 border-purple-700 cursor-wait'
                          : isDevDirty
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black border-emerald-300 shadow-emerald-950/40 ring-2 ring-emerald-400 animate-pulse'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500/60'
                      }`}
                      title={`Save ${member.name}'s planning data directly to database tables`}
                    >
                      {isDevSaving ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : isDevSaved ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Saved</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          <span>Save</span>
                        </>
                      )}
                    </button>

                    {/* DEDICATED UPDATE BUTTON FOR THIS DEVELOPER */}
                    <button
                      type="button"
                      onClick={() => handleUpdateDeveloperSection(member.id)}
                      disabled={isDevSaving}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer border border-indigo-400/50"
                      title={`Update & re-sync ${member.name}'s project planning & target allocations`}
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isDevSaving ? 'animate-spin' : ''}`} />
                      <span>Update</span>
                    </button>

                    {/* DISCARD BUTTON (When changes exist) */}
                    {isDevDirty && (
                      <button
                        type="button"
                        onClick={() => handleDiscardDeveloperChanges(member.id)}
                        disabled={isDevSaving}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-rose-200 hover:text-white bg-rose-950/60 hover:bg-rose-900/90 px-2.5 py-1.5 rounded-xl border border-rose-700/60 transition-all cursor-pointer"
                        title={`Discard unsaved changes for ${member.name} and revert to last saved state`}
                      >
                        <Undo2 className="w-3.5 h-3.5 text-rose-300" />
                        <span>Discard</span>
                      </button>
                    )}

                    {/* ADD PROJECT BUTTON */}
                    <button
                      type="button"
                      onClick={() => openProjectMasterPicker(member.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-950 bg-white hover:bg-purple-50 px-3 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer border border-white"
                      title="Load data from Project Master into this member"
                    >
                      <Plus className="w-3.5 h-3.5 text-purple-700" />
                      <span>Add Project</span>
                      <FolderKanban className="w-3.5 h-3.5 text-purple-700" />
                    </button>

                    {/* DELETE DEVELOPER BUTTON */}
                    <button
                      type="button"
                      onClick={() => handleDeleteMember(member.id)}
                      className="p-1.5 text-purple-300 hover:text-red-400 hover:bg-purple-900/60 rounded-lg transition-colors cursor-pointer"
                      title="Delete developer from developers table"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 2. DEDICATED MEMBER-WISE MONTH HORIZONTAL SCROLLER BAR */}
                <div className="bg-purple-950/90 text-white px-4 py-2 border-b border-purple-800/80 flex flex-wrap items-center justify-between gap-2.5 text-xs select-none">
                  <div className="flex items-center gap-2">
                    <CalendarRange className="w-3.5 h-3.5 text-purple-300" />
                    <span className="font-bold text-[11px] text-purple-200 uppercase tracking-wide">
                      {member.name}'s Month Scroller:
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-800 text-white border border-purple-600">
                      Showing: <strong className="text-white">{PLANNING_MONTHS[mScroll.activeMonthIdx]}</strong>
                    </span>
                  </div>

                  {/* Scroller Controls for this Member */}
                  <div className="flex items-center gap-1.5 flex-1 max-w-lg mx-2">
                    <button
                      type="button"
                      onClick={() => handleMemberScrollMonths(member.id, 'left')}
                      disabled={!mScroll.canScrollLeft}
                      className={`p-1 rounded-md border text-xs transition-colors cursor-pointer ${
                        mScroll.canScrollLeft
                          ? 'bg-purple-800 hover:bg-purple-700 text-white border-purple-600 shadow-xs'
                          : 'bg-purple-950/40 text-purple-500/40 border-purple-900 cursor-not-allowed'
                      }`}
                      title={`Scroll earlier months for ${member.name}`}
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>

                    {/* Interactive Month Range Track for this Member */}
                    <div className="relative flex-1 bg-purple-900/90 rounded-md p-1 border border-purple-700 flex items-center overflow-hidden">
                      <div className="w-full flex justify-between px-1 text-[9px] font-mono text-purple-300">
                        {PLANNING_MONTHS.map((m, idx) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => handleMemberScrollToMonth(member.id, idx)}
                            className={`px-1 py-0.5 rounded transition-all cursor-pointer ${
                              idx === mScroll.activeMonthIdx
                                ? 'bg-purple-600 text-white font-bold ring-1 ring-purple-300'
                                : 'hover:bg-purple-800 hover:text-white'
                            }`}
                            title={`Jump ${member.name} to ${m}`}
                          >
                            {m.slice(0, 3)}
                          </button>
                        ))}
                      </div>

                      <input
                        type="range"
                        min="0"
                        max={mScroll.maxScrollLeft}
                        value={mScroll.scrollLeft}
                        onChange={(e) => handleMemberRangeScroll(member.id, Number(e.target.value))}
                        className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full"
                        title={`Slide months horizontally for ${member.name}`}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleMemberScrollMonths(member.id, 'right')}
                      disabled={!mScroll.canScrollRight}
                      className={`p-1 rounded-md border text-xs transition-colors cursor-pointer ${
                        mScroll.canScrollRight
                          ? 'bg-purple-800 hover:bg-purple-700 text-white border-purple-600 shadow-xs'
                          : 'bg-purple-950/40 text-purple-500/40 border-purple-900 cursor-not-allowed'
                      }`}
                      title={`Scroll later months for ${member.name}`}
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Quarter Quick Jump Pills for this Member */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleMemberScrollToMonth(member.id, 0)}
                      className="px-2 py-0.5 rounded bg-purple-900 hover:bg-purple-700 text-purple-200 hover:text-white text-[10px] font-bold border border-purple-700 cursor-pointer"
                      title="Q1 (March - May)"
                    >
                      Q1
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMemberScrollToMonth(member.id, 3)}
                      className="px-2 py-0.5 rounded bg-purple-900 hover:bg-purple-700 text-purple-200 hover:text-white text-[10px] font-bold border border-purple-700 cursor-pointer"
                      title="Q2 (June - August)"
                    >
                      Q2
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMemberScrollToMonth(member.id, 6)}
                      className="px-2 py-0.5 rounded bg-purple-900 hover:bg-purple-700 text-purple-200 hover:text-white text-[10px] font-bold border border-purple-700 cursor-pointer"
                      title="Q3 (September - November)"
                    >
                      Q3
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMemberScrollToMonth(member.id, 9)}
                      className="px-2 py-0.5 rounded bg-purple-900 hover:bg-purple-700 text-purple-200 hover:text-white text-[10px] font-bold border border-purple-700 cursor-pointer"
                      title="Q4 (December - February)"
                    >
                      Q4
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSyncMemberToAll(member.id)}
                      className="ml-1 px-2 py-0.5 rounded bg-purple-800 hover:bg-purple-600 text-white text-[10px] font-bold border border-purple-500 cursor-pointer"
                      title="Align all other developers to this month view"
                    >
                      Sync All
                    </button>
                  </div>
                </div>

                {/* 3. Member's Project Matrix with its OWN Member-Level Horizontal Scroll Container */}
                <div
                  ref={(el) => {
                    memberScrollRefs.current[member.id] = el;
                  }}
                  onScroll={() => updateMemberScrollState(member.id)}
                  className="overflow-x-auto custom-months-scrollbar select-text relative"
                >
                  <table className="w-full text-left border-collapse min-w-[1764px]">
                    <thead>
                      <tr className="bg-[#6b21a8] text-white text-xs uppercase tracking-wider font-bold divide-x divide-purple-700/80 sticky top-0 z-20 shadow-2xs">
                        {/* Pinned Col 1: Project */}
                        <th className="sticky left-0 z-30 bg-[#6b21a8] py-2.5 px-3 w-[260px] min-w-[260px] max-w-[260px] text-left">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <FolderKanban className="w-3.5 h-3.5 text-purple-300" />
                              <span>Project (Project Master)</span>
                            </span>
                            <span className="text-[10px] text-purple-200 font-normal lowercase">catalog</span>
                          </div>
                        </th>

                        {/* Pinned Col 2: Project Contract Value */}
                        <th className="sticky left-[260px] z-30 bg-[#6b21a8] py-2.5 px-2 w-[120px] min-w-[120px] max-w-[120px] text-right">
                          Contract Value
                        </th>

                        {/* Pinned Col 3: Monthly Target */}
                        <th className="sticky left-[380px] z-30 bg-[#6b21a8] py-2.5 px-2 w-[120px] min-w-[120px] max-w-[120px] text-right border-r-2 border-purple-400 shadow-[3px_0_8px_-2px_rgba(0,0,0,0.25)]">
                          Target / Mo
                        </th>

                        {/* 4-15. 12 SCROLLABLE MONTH COLUMNS (Member Wise) */}
                        {PLANNING_MONTHS.map((month) => (
                          <th key={month} className="py-2.5 px-2 w-[92px] min-w-[92px] max-w-[92px] text-right font-bold">
                            {month}
                          </th>
                        ))}

                        {/* Pinned Col 16: Total Planned */}
                        <th className="sticky right-[50px] z-30 bg-[#581c87] py-2.5 px-2 w-[110px] min-w-[110px] max-w-[110px] text-right border-l-2 border-purple-400 shadow-[-3px_0_8px_-2px_rgba(0,0,0,0.25)]">
                          Total Planned
                        </th>

                        {/* Pinned Col 17: Actions */}
                        <th className="sticky right-0 z-30 bg-[#581c87] py-2.5 px-1 w-[50px] min-w-[50px] max-w-[50px] text-center">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-200 text-xs text-slate-800">
                      {member.projects.map((project, pIdx) => {
                        const isFirstProject = pIdx === 0;
                        const projectPlannedSum = project.monthlyValues.reduce((s, v) => s + v, 0);

                        return (
                          <tr
                            key={project.id}
                            className="divide-x divide-slate-200 hover:bg-purple-50/40 transition-colors"
                          >
                            {/* 1. Project Name (Pinned Left) */}
                            <td className="sticky left-0 z-10 py-1.5 px-3 bg-white w-[260px] min-w-[260px] max-w-[260px] border-r border-slate-200 group">
                              <div className="flex items-center gap-1.5">
                                <div
                                  draggable
                                  onDragStart={(e) => handleProjectDragStart(e, member.id, project.id, project.name)}
                                  className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-purple-600 p-0.5 rounded"
                                  title="Drag to reassign project to another developer"
                                >
                                  <GripVertical className="w-3.5 h-3.5" />
                                </div>
                                <div className="relative flex-1 flex items-center min-w-0">
                                  <input
                                    type="text"
                                    list="project-master-datalist"
                                    value={project.name}
                                    onChange={(e) => handleUpdateProject(member.id, project.id, 'name', e.target.value)}
                                    className="w-full font-semibold text-slate-800 bg-transparent hover:bg-slate-50 focus:bg-white pl-1 pr-6 py-1 rounded border border-transparent hover:border-slate-300 focus:border-purple-500 outline-none text-xs truncate"
                                    placeholder="Pick or type from Project Master..."
                                  />
                                  <button
                                    type="button"
                                    onClick={() => openProjectMasterPicker(member.id, project.id)}
                                    className="absolute right-1 text-slate-400 hover:text-purple-600 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    title="Browse & pick from Project Master catalog"
                                  >
                                    <FolderKanban className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </td>

                            {/* 2. Contract Value (Pinned Left) */}
                            <td className="sticky left-[260px] z-10 py-1.5 px-2 text-right bg-white w-[120px] min-w-[120px] max-w-[120px] border-r border-slate-200">
                              <input
                                type="number"
                                min="0"
                                value={project.value || ''}
                                onChange={(e) => handleUpdateProject(member.id, project.id, 'value', e.target.value)}
                                className="w-full text-right font-mono font-semibold text-slate-800 bg-transparent hover:bg-slate-50 focus:bg-white px-1 py-1 rounded border border-transparent hover:border-slate-300 focus:border-purple-500 outline-none text-xs"
                                placeholder="0"
                              />
                            </td>

                            {/* 3. Monthly Target (Pinned Left with Divider) */}
                            {isFirstProject ? (
                              <td
                                rowSpan={projectCount}
                                className="sticky left-[380px] z-10 py-2.5 px-2 text-right align-top bg-[#faf5ff] border-r-2 border-purple-300 font-bold w-[120px] min-w-[120px] max-w-[120px] shadow-[3px_0_8px_-2px_rgba(0,0,0,0.1)]"
                              >
                                <div className="sticky top-10 text-right">
                                  <div className="font-mono font-bold text-purple-950 text-xs">
                                    {formatCurrency(member.monthlyTarget, currencySymbol)}
                                  </div>
                                  <div className="text-[10px] text-purple-600 font-semibold mt-0.5">
                                    Target / Mo
                                  </div>
                                </div>
                              </td>
                            ) : null}

                            {/* 4-15. 12 Monthly Forecast Cells (Horizontally Scrolled) */}
                            {PLANNING_MONTHS.map((month, mIdx) => {
                              const val = project.monthlyValues[mIdx] || 0;
                              const isCellHovered = dragOverCell?.memberId === member.id && dragOverCell?.projectId === project.id && dragOverCell?.monthIdx === mIdx;

                              return (
                                <td
                                  key={month}
                                  className={`py-1 px-1 text-right relative group/cell transition-colors w-[92px] min-w-[92px] max-w-[92px] ${
                                    isCellHovered ? 'bg-purple-200 ring-2 ring-purple-500' : val > 0 ? 'bg-purple-50/60' : 'bg-white'
                                  }`}
                                  onDragOver={(e) => {
                                    e.preventDefault();
                                    setDragOverCell({ memberId: member.id, projectId: project.id, monthIdx: mIdx });
                                  }}
                                  onDragLeave={() => {
                                    if (dragOverCell?.monthIdx === mIdx) setDragOverCell(null);
                                  }}
                                  onDrop={(e) => handleDropOnCell(e, member.id, project.id, mIdx)}
                                >
                                  <div className="flex items-center justify-end gap-1">
                                    {val > 0 && (
                                      <div
                                        draggable
                                        onDragStart={(e) => handleValueDragStart(e, member.id, project.id, mIdx, val)}
                                        className="cursor-grab active:cursor-grabbing text-purple-500 hover:text-purple-800 opacity-0 group-hover/cell:opacity-100 transition-opacity p-0.5"
                                        title="Drag to move this value to another month cell"
                                      >
                                        <Move className="w-3 h-3" />
                                      </div>
                                    )}
                                    <input
                                      type="number"
                                      min="0"
                                      value={val || ''}
                                      onChange={(e) => handleUpdateMonthValue(member.id, project.id, mIdx, Number(e.target.value))}
                                      className={`w-full text-right font-mono text-xs px-1 py-1 rounded border border-transparent hover:border-slate-300 focus:border-purple-500 outline-none ${
                                        val > 0 ? 'font-bold text-purple-900 bg-purple-100/70' : 'text-slate-600 hover:bg-slate-50'
                                      }`}
                                      placeholder="-"
                                    />
                                  </div>
                                </td>
                              );
                            })}

                            {/* 16. Total Planned (Pinned Right) */}
                            <td className="sticky right-[50px] z-10 py-1.5 px-2 text-right bg-slate-50 font-mono font-bold text-slate-800 w-[110px] min-w-[110px] max-w-[110px] border-l-2 border-purple-300 shadow-[-3px_0_8px_-2px_rgba(0,0,0,0.1)]">
                              {formatCurrency(projectPlannedSum, currencySymbol)}
                            </td>

                            {/* 17. Actions (Pinned Right) */}
                            <td className="sticky right-0 z-10 py-1.5 px-1 text-center bg-white w-[50px] min-w-[50px] max-w-[50px]">
                              <button
                                onClick={() => handleDeleteProject(member.id, project.id)}
                                className="text-slate-300 hover:text-red-500 p-1 rounded transition-colors cursor-pointer"
                                title="Delete project row"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}

                      {/* Member Subtotal Row */}
                      <tr className="bg-purple-100 border-t-2 border-b-2 border-purple-300/80 font-bold text-xs text-purple-950 divide-x divide-purple-200">
                        {/* Subtotal Label (Pinned Left 0) */}
                        <td className="sticky left-0 z-10 bg-purple-100 py-2 px-3 text-right w-[260px] min-w-[260px] max-w-[260px]">
                          <span className="flex items-center justify-end gap-1.5 text-purple-950">
                            <Users className="w-3.5 h-3.5 text-purple-700" />
                            <span>{member.name} Monthly Total:</span>
                          </span>
                        </td>

                        {/* Subtotal Total Project Value (Pinned Left 260px) */}
                        <td className="sticky left-[260px] z-10 bg-purple-100 py-2 px-2 text-right font-mono w-[120px] min-w-[120px] max-w-[120px]">
                          {formatCurrency(memberTotalValue, currencySymbol)}
                        </td>

                        {/* Subtotal Target (Pinned Left 380px) */}
                        <td className="sticky left-[380px] z-10 bg-purple-100 py-2 px-2 text-right font-mono text-purple-900 w-[120px] min-w-[120px] max-w-[120px] border-r-2 border-purple-300 shadow-[3px_0_8px_-2px_rgba(0,0,0,0.1)]">
                          {formatCurrency(member.monthlyTarget, currencySymbol)}
                        </td>

                        {/* Member's Monthly Sums (Horizontally Scrolled) */}
                        {memberMonthTotals.map((monthSum, mIdx) => {
                          const meetsTarget = monthSum >= member.monthlyTarget && member.monthlyTarget > 0;
                          const hasValue = monthSum > 0;

                          return (
                            <td
                              key={mIdx}
                              className={`py-2 px-1 text-right font-mono text-xs w-[92px] min-w-[92px] max-w-[92px] ${
                                meetsTarget
                                  ? 'bg-emerald-100 text-emerald-900 font-black'
                                  : hasValue
                                  ? 'bg-purple-200/70 text-purple-950 font-bold'
                                  : 'text-slate-400'
                              }`}
                              title={`Target: ${formatCurrency(member.monthlyTarget, currencySymbol)} | Planned: ${formatCurrency(monthSum, currencySymbol)}`}
                            >
                              <div>{monthSum > 0 ? formatCurrency(monthSum, currencySymbol) : '-'}</div>
                              {monthSum > 0 && member.monthlyTarget > 0 && (
                                <div className={`text-[9px] font-bold ${meetsTarget ? 'text-emerald-700' : 'text-amber-700'}`}>
                                  {Math.round((monthSum / member.monthlyTarget) * 100)}%
                                </div>
                              )}
                            </td>
                          );
                        })}

                        {/* Subtotal Total Planned (Pinned Right) */}
                        <td className="sticky right-[50px] z-10 bg-purple-200 py-2 px-2 text-right font-mono font-black text-purple-950 w-[110px] min-w-[110px] max-w-[110px] border-l-2 border-purple-300 shadow-[-3px_0_8px_-2px_rgba(0,0,0,0.1)]">
                          {formatCurrency(memberTotalPlannedAllMonths, currencySymbol)}
                        </td>
                        <td className="sticky right-0 z-10 bg-purple-200 py-1.5 px-1 text-center w-[50px] min-w-[50px] max-w-[50px]">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleSaveDeveloper(member.id)}
                              disabled={isDevSaving}
                              className={`p-1 rounded transition-colors cursor-pointer ${
                                isDevDirty
                                  ? 'text-emerald-950 bg-emerald-400 hover:bg-emerald-300 font-bold ring-1 ring-emerald-500 shadow-2xs'
                                  : 'text-purple-800 hover:bg-purple-300'
                              }`}
                              title={`Save ${member.name}'s planning data`}
                            >
                              <Save className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateDeveloperSection(member.id)}
                              disabled={isDevSaving}
                              className="p-1 text-indigo-900 hover:bg-indigo-300 rounded transition-colors cursor-pointer"
                              title={`Update ${member.name}'s section`}
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${isDevSaving ? 'animate-spin' : ''}`} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })
        )}

        {/* Overall Grand Totals across All Members */}
        {filteredMembers.length > 0 && (
          <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-md overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-950 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-slate-300 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-400" />
                <span className="uppercase tracking-wider text-white">Grand Totals Summary (All Developers & Projects)</span>
              </div>
              <div className="flex items-center gap-4 text-slate-400 flex-wrap">
                <span>Contract Value: <strong className="text-purple-300 font-mono">{formatCurrency(grandTotalProjectValue, currencySymbol)}</strong></span>
                <span>Monthly Target: <strong className="text-purple-300 font-mono">{formatCurrency(grandTotalMonthlyTarget, currencySymbol)}</strong></span>
                <span>Total Pipeline: <strong className="text-emerald-400 font-mono">{formatCurrency(grandTotalPlanned, currencySymbol)}</strong></span>
              </div>
            </div>

            <div
              ref={(el) => {
                grandTotalScrollRef.current = el;
              }}
              className="overflow-x-auto custom-months-scrollbar select-text relative"
            >
              <table className="w-full text-left border-collapse min-w-[1764px] text-xs">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 font-bold border-b border-slate-800 divide-x divide-slate-800">
                    <th className="sticky left-0 z-20 bg-slate-900 py-2.5 px-3 w-[260px] min-w-[260px] max-w-[260px]">Metric</th>
                    <th className="sticky left-[260px] z-20 bg-slate-900 py-2.5 px-2 w-[120px] min-w-[120px] max-w-[120px] text-right">Contract Value</th>
                    <th className="sticky left-[380px] z-20 bg-slate-900 py-2.5 px-2 w-[120px] min-w-[120px] max-w-[120px] text-right border-r border-slate-700">Monthly Target</th>
                    {PLANNING_MONTHS.map((m) => (
                      <th key={m} className="py-2.5 px-2 w-[92px] min-w-[92px] max-w-[92px] text-right text-slate-300">{m}</th>
                    ))}
                    <th className="sticky right-[50px] z-20 bg-slate-950 py-2.5 px-2 w-[110px] min-w-[110px] max-w-[110px] text-right border-l border-slate-700">Total Planned</th>
                    <th className="sticky right-0 z-20 bg-slate-950 py-2.5 px-1 w-[50px] min-w-[50px] max-w-[50px]"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="font-mono font-bold text-white divide-x divide-slate-800">
                    <td className="sticky left-0 z-20 bg-slate-900 py-3 px-3 font-sans text-purple-300 w-[260px]">Combined Monthly Pipeline Planned</td>
                    <td className="sticky left-[260px] z-20 bg-slate-900 py-3 px-2 text-right text-purple-300 w-[120px]">{formatCurrency(grandTotalProjectValue, currencySymbol)}</td>
                    <td className="sticky left-[380px] z-20 bg-slate-900 py-3 px-2 text-right text-purple-300 w-[120px] border-r border-slate-700">{formatCurrency(grandTotalMonthlyTarget, currencySymbol)}</td>
                    {grandTotalMonthly.map((total, idx) => (
                      <td key={idx} className="py-3 px-2 text-right w-[92px] text-white">{total > 0 ? formatCurrency(total, currencySymbol) : '-'}</td>
                    ))}
                    <td className="sticky right-[50px] z-20 bg-slate-950 py-3 px-2 text-right text-emerald-400 font-black w-[110px] border-l border-slate-700">{formatCurrency(grandTotalPlanned, currencySymbol)}</td>
                    <td className="sticky right-0 z-20 bg-slate-950 py-3 px-1 w-[50px]"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>


      {/* Summary KPI Strip at Bottom */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-6 flex-wrap">
          <div>
            <span className="text-slate-500 font-medium">Developers in Table:</span>{' '}
            <strong className="text-slate-800">{developers.length}</strong>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Projects in Project Master:</span>{' '}
            <strong className="text-purple-700">{existingProjects.length}</strong>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Total Planned Projects:</span>{' '}
            <strong className="text-slate-800">
              {members.reduce((s, m) => s + m.projects.length, 0)}
            </strong>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Total Project Contract Value:</span>{' '}
            <strong className="text-purple-700 font-mono font-bold">
              {formatCurrency(grandTotalProjectValue, currencySymbol)}
            </strong>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Total Pipeline Planned (12 Months):</span>{' '}
            <strong className="text-emerald-700 font-mono font-bold">
              {formatCurrency(grandTotalPlanned, currencySymbol)}
            </strong>
          </div>
        </div>

        {onSyncWithMainProjects && (
          <button
            onClick={() => {
              const flattened = members.flatMap((m) =>
                m.projects.map((p) => ({
                  name: p.name,
                  totalValue: p.value,
                  monthlyForecast: p.monthlyValues
                }))
              );
              onSyncWithMainProjects(flattened);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Sync to Main Financial Projects</span>
          </button>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* PROJECT MASTER PICKER MODAL                                   */}
      {/* ------------------------------------------------------------- */}
      {addingProjectForMemberId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-800 to-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-purple-700/60 rounded-xl border border-purple-400/40">
                  <FolderKanban className="w-5 h-5 text-purple-200" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Load from Project Master</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-500/40 text-purple-200">
                      {existingProjects.length} In Master
                    </span>
                  </h3>
                  <p className="text-xs text-purple-200/90 mt-0.5">
                    Select a project to load its title, contract value, and monthly forecast for{' '}
                    <strong className="text-white underline">{activeModalMember?.name || 'Developer'}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setAddingProjectForMemberId(null);
                  setReplacingProjectRow(null);
                }}
                className="p-1.5 text-purple-200 hover:text-white hover:bg-purple-700/60 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Filter Bar */}
            <div className="p-3.5 bg-slate-50 border-b border-slate-200">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search project by title, category, or client..."
                  value={projectMasterSearch}
                  onChange={(e) => setProjectMasterSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none shadow-2xs font-medium"
                  autoFocus
                />
              </div>
            </div>

            {/* Project Master List Body */}
            <div className="p-4 overflow-y-auto flex-1 space-y-2.5">
              {filteredMasterProjects.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  <FolderKanban className="w-8 h-8 mx-auto mb-2 opacity-30 text-purple-600" />
                  <p className="text-xs font-semibold text-slate-600">No matching projects found in Project Master.</p>
                  <p className="text-[11px] text-slate-400 mt-1">You can enter a custom project name below.</p>
                </div>
              ) : (
                filteredMasterProjects.map((proj) => {
                  const hasMonthly = proj.monthlyForecast && proj.monthlyForecast.some((v) => v > 0);

                  return (
                    <div
                      key={proj.id}
                      onClick={() => handleSelectProjectFromMaster(addingProjectForMemberId, proj)}
                      className="group p-3 rounded-xl border border-slate-200 hover:border-purple-400 hover:bg-purple-50/40 transition-all flex items-center justify-between gap-3 cursor-pointer shadow-2xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-slate-800 text-sm group-hover:text-purple-900 transition-colors">
                            {proj.name}
                          </h4>
                          {proj.category && (
                            <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                              {proj.category}
                            </span>
                          )}
                          {proj.client && (
                            <span className="text-[10px] text-slate-500">
                              Client: {proj.client}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500">
                          <div>
                            <span>Contract Value:</span>{' '}
                            <strong className="font-mono text-purple-800 font-bold">
                              {formatCurrency(proj.totalValue, currencySymbol)}
                            </strong>
                          </div>
                          {hasMonthly && (
                            <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Includes 12-Month Forecast Plan</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="px-3 py-1.5 bg-purple-700 group-hover:bg-purple-800 text-white text-xs font-bold rounded-lg shadow-2xs flex items-center gap-1 shrink-0 transition-colors"
                      >
                        <span>Select</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}

              {/* Bottom Custom Project Form */}
              <div className="pt-3 mt-3 border-t border-slate-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  <Plus className="w-3.5 h-3.5 text-purple-600" />
                  <span>Or Enter Custom Project (New Initiative)</span>
                </div>

                <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200/80 space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Project Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Core Banking API v3"
                        value={customProjectName}
                        onChange={(e) => setCustomProjectName(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-purple-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Contract Value ({currencySymbol})</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 500000"
                        value={customProjectValue}
                        onChange={(e) => setCustomProjectValue(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-medium text-slate-800 outline-none focus:border-purple-600"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={saveToMasterChecked}
                        onChange={(e) => setSaveToMasterChecked(e.target.checked)}
                        className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span>Also save into Project Master database</span>
                    </label>

                    <button
                      type="button"
                      disabled={!customProjectName.trim()}
                      onClick={() => handleAddCustomProject(addingProjectForMemberId)}
                      className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors cursor-pointer"
                    >
                      Add Custom Project
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>Click any project row above to load it directly into planning.</span>
              <button
                onClick={() => {
                  setAddingProjectForMemberId(null);
                  setReplacingProjectRow(null);
                }}
                className="px-3 py-1 bg-white hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-300 font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
