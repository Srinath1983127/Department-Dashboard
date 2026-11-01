import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Rocket, 
  Layers, 
  Kanban as KanbanIcon, 
  GitBranch, 
  Flag, 
  Award,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  Users,
  Target,
  ArrowRight,
  CheckSquare
} from 'lucide-react';
import { Project, ProjectSprint, ProjectMethodology, ProjectForecast, ProjectAssignment, Developer } from '../types';

interface ProjectDeliveryTrackerProps {
  projects: Project[];
  currencySymbol: string;
  onUpdateProject: (id: string, updated: Partial<Project>) => void;
  projectForecasts?: ProjectForecast[];
  assignments?: ProjectAssignment[];
  developers?: Developer[];
  onNavigateToTab?: (tab: 'financials' | 'resources' | 'developer_dashboard' | 'project_costing' | 'project_forecast' | 'project_deliveries') => void;
}

export const ProjectDeliveryTracker: React.FC<ProjectDeliveryTrackerProps> = ({
  projects,
  currencySymbol,
  onUpdateProject,
  projectForecasts,
  assignments,
  developers,
  onNavigateToTab
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [methodologyFilter, setMethodologyFilter] = useState<'all' | 'scrum' | 'kanban'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'achieved' | 'pending' | 'overdue'>('all');
  
  // Expanded project cards state
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});

  // Modal for editing project delivery details
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // New Sprint state inside modal
  const [newSprintName, setNewSprintName] = useState('');
  const [newSprintStart, setNewSprintStart] = useState('');
  const [newSprintEnd, setNewSprintEnd] = useState('');
  const [newSprintGoal, setNewSprintGoal] = useState('');

  const todayStr = useMemo(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  // Helper to get delivery status of a project
  const getProjectDeliveryStatus = (project: Project): {
    status: 'achieved' | 'overdue' | 'at_risk' | 'on_track' | 'not_set';
    label: string;
    color: string;
    daysDiff?: number;
  } => {
    if (project.isDeliveryAchieved) {
      return {
        status: 'achieved',
        label: 'Delivered / Achieved',
        color: 'bg-emerald-100 text-emerald-800 border-emerald-300'
      };
    }

    if (!project.finalDeliveryDate) {
      return {
        status: 'not_set',
        label: 'Date Not Set',
        color: 'bg-slate-100 text-slate-600 border-slate-200'
      };
    }

    const today = new Date(todayStr).getTime();
    const delivery = new Date(project.finalDeliveryDate).getTime();
    const diffDays = Math.round((delivery - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        status: 'overdue',
        label: `Overdue by ${Math.abs(diffDays)}d`,
        color: 'bg-rose-100 text-rose-800 border-rose-300',
        daysDiff: diffDays
      };
    } else if (diffDays <= 14) {
      return {
        status: 'at_risk',
        label: `Due in ${diffDays}d`,
        color: 'bg-amber-100 text-amber-800 border-amber-300',
        daysDiff: diffDays
      };
    } else {
      return {
        status: 'on_track',
        label: `On Track (${diffDays}d left)`,
        color: 'bg-blue-100 text-blue-800 border-blue-300',
        daysDiff: diffDays
      };
    }
  };

  // Filter for Planned Forecasts projects in Forecast Pipeline (defaults to true)
  const [onlyPlannedForecasts, setOnlyPlannedForecasts] = useState(true);

  // Helper to determine if a project is a Planned Forecast in the Forecast Pipeline
  const isPlannedForecastProject = (project: Project): boolean => {
    // 1. Matches a planned forecast in projectForecasts by forecastId
    if (project.forecastId) {
      const match = projectForecasts?.find((f) => f.id === project.forecastId);
      if (match) return match.status === 'planned';
    }

    // 2. Matches by ID or name to a forecast with status === 'planned'
    const matchedForecast = projectForecasts?.find(
      (f) => f.status === 'planned' && (
        f.id === project.id || 
        f.id === project.forecastId || 
        f.name.trim().toLowerCase() === project.name.trim().toLowerCase()
      )
    );
    if (matchedForecast) return true;

    // 3. Flagged as planned from forecast and not matching an unplanned forecast
    if (project.isPlannedFromForecast) {
      const matched = projectForecasts?.find(
        (f) => f.id === project.forecastId || f.name.trim().toLowerCase() === project.name.trim().toLowerCase()
      );
      if (!matched || matched.status === 'planned') {
        return true;
      }
    }

    return false;
  };

  // List of all projects representing Planned Forecasts in the Forecast Pipeline
  const plannedForecastProjects = useMemo(() => {
    const plannedForecasts = (projectForecasts || []).filter((f) => f.status === 'planned');
    const matchedProjectIds = new Set<string>();
    const list: Project[] = [];

    // 1. Existing projects that correspond to planned forecasts
    projects.forEach((p) => {
      if (isPlannedForecastProject(p)) {
        matchedProjectIds.add(p.id);
        list.push(p);
      }
    });

    // 2. Planned forecasts in pipeline that may not have a projects table record yet
    plannedForecasts.forEach((f) => {
      const alreadyFound = list.some(
        (p) =>
          (p.forecastId && p.forecastId === f.id) ||
          p.id === f.id ||
          p.name.trim().toLowerCase() === f.name.trim().toLowerCase()
      );

      if (!alreadyFound && !matchedProjectIds.has(f.id)) {
        matchedProjectIds.add(f.id);
        let storedDelivery: any = {};
        try {
          const st = localStorage.getItem(`project_delivery_${f.id}`);
          if (st) storedDelivery = JSON.parse(st);
        } catch {}

        list.push({
          id: f.id,
          name: f.name,
          category: 'Forecast Pipeline',
          totalValue: f.estimatedValue || 0,
          status: 'planning',
          color: '#3b82f6',
          monthlyForecast: new Array(12).fill(0),
          isPlannedFromForecast: true,
          forecastId: f.id,
          methodology: storedDelivery.methodology || 'scrum',
          finalDeliveryDate: storedDelivery.finalDeliveryDate || '2026-10-25',
          isDeliveryAchieved: Boolean(storedDelivery.isDeliveryAchieved),
          achievedDate: storedDelivery.achievedDate || '',
          sprints: storedDelivery.sprints || [
            {
              id: `sp_${f.id}_1`,
              sprintNumber: 1,
              name: 'Sprint 1: Architecture & Setup',
              startDate: '2026-09-01',
              endDate: '2026-09-15',
              isAchieved: true,
              achievedDate: '2026-09-14',
              goal: 'Initial setup & architecture'
            },
            {
              id: `sp_${f.id}_2`,
              sprintNumber: 2,
              name: 'Sprint 2: Core Delivery',
              startDate: '2026-09-16',
              endDate: '2026-09-30',
              isAchieved: false,
              goal: 'Feature development and delivery'
            }
          ],
          deliveryNotes: storedDelivery.deliveryNotes || ''
        });
      }
    });

    return list;
  }, [projects, projectForecasts]);

  // Base projects pool: strictly Planned Forecasts only when onlyPlannedForecasts is true
  const baseProjects = useMemo(() => {
    if (onlyPlannedForecasts) {
      return plannedForecastProjects;
    }
    return projects;
  }, [onlyPlannedForecasts, plannedForecastProjects, projects]);

  // KPI Calculations
  const stats = useMemo(() => {
    const total = baseProjects.length;
    let achievedCount = 0;
    let overdueCount = 0;
    let atRiskCount = 0;
    let scrumCount = 0;
    let kanbanCount = 0;

    baseProjects.forEach((p) => {
      const meth = p.methodology || 'scrum';
      if (meth === 'scrum') scrumCount++;
      if (meth === 'kanban') kanbanCount++;

      const st = getProjectDeliveryStatus(p);
      if (st.status === 'achieved') achievedCount++;
      else if (st.status === 'overdue') overdueCount++;
      else if (st.status === 'at_risk') atRiskCount++;
    });

    const achievementRate = total > 0 ? Math.round((achievedCount / total) * 100) : 0;

    return {
      total,
      achievedCount,
      overdueCount,
      atRiskCount,
      scrumCount,
      kanbanCount,
      achievementRate
    };
  }, [baseProjects, todayStr]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return baseProjects.filter((p) => {
      const meth = p.methodology || 'scrum';
      if (methodologyFilter !== 'all' && meth !== methodologyFilter) return false;

      const st = getProjectDeliveryStatus(p);
      if (statusFilter === 'achieved' && !p.isDeliveryAchieved) return false;
      if (statusFilter === 'pending' && p.isDeliveryAchieved) return false;
      if (statusFilter === 'overdue' && st.status !== 'overdue') return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesCat = (p.category || '').toLowerCase().includes(q);
        const matchesClient = (p.client || '').toLowerCase().includes(q);
        if (!matchesName && !matchesCat && !matchesClient) return false;
      }

      return true;
    });
  }, [baseProjects, methodologyFilter, statusFilter, searchTerm, todayStr]);

  const toggleExpand = (id: string) => {
    setExpandedProjects((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Quick toggle achieved status
  const handleToggleAchieved = (project: Project, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newAchieved = !project.isDeliveryAchieved;
    onUpdateProject(project.id, {
      isDeliveryAchieved: newAchieved,
      achievedDate: newAchieved ? (project.achievedDate || todayStr) : undefined
    });
  };

  // Change project methodology
  const handleMethodologyChange = (project: Project, methodology: ProjectMethodology, e?: React.MouseEvent) => {
    e?.stopPropagation();
    onUpdateProject(project.id, {
      methodology,
      // If switching to scrum and no sprints, initialize one
      sprints: methodology === 'scrum' && (!project.sprints || project.sprints.length === 0)
        ? [
            {
              id: `sp_${Date.now()}_1`,
              sprintNumber: 1,
              name: 'Sprint 1',
              startDate: todayStr,
              endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              isAchieved: false,
              goal: 'Core architecture and sprint planning'
            }
          ]
        : project.sprints
    });
  };

  // Update final delivery date directly
  const handleUpdateFinalDeliveryDate = (project: Project, dateVal: string) => {
    onUpdateProject(project.id, {
      finalDeliveryDate: dateVal
    });
  };

  // Toggle sprint achieved
  const handleToggleSprintAchieved = (project: Project, sprintId: string) => {
    const updatedSprints = (project.sprints || []).map((sp) => {
      if (sp.id !== sprintId) return sp;
      const willBeAchieved = !sp.isAchieved;
      return {
        ...sp,
        isAchieved: willBeAchieved,
        achievedDate: willBeAchieved ? todayStr : undefined
      };
    });

    onUpdateProject(project.id, { sprints: updatedSprints });
  };

  // Auto-generate 2-week sprints based on project final delivery date or 3 default sprints
  const handleAutoGenerateSprints = (project: Project) => {
    const sprints: ProjectSprint[] = [];
    const count = 3;
    let currStart = new Date();

    for (let i = 1; i <= count; i++) {
      const startStr = currStart.toISOString().split('T')[0];
      const endObj = new Date(currStart.getTime() + 13 * 24 * 60 * 60 * 1000);
      const endStr = endObj.toISOString().split('T')[0];

      sprints.push({
        id: `sp_${Date.now()}_${i}`,
        sprintNumber: i,
        name: `Sprint ${i}`,
        startDate: startStr,
        endDate: endStr,
        isAchieved: false,
        goal: i === 1 ? 'MVP Setup & Foundation' : i === 2 ? 'Core Feature Development' : 'QA & Final Release Prep'
      });

      currStart = new Date(endObj.getTime() + 24 * 60 * 60 * 1000);
    }

    const calculatedFinalDate = sprints[sprints.length - 1].endDate;

    onUpdateProject(project.id, {
      sprints,
      finalDeliveryDate: project.finalDeliveryDate || calculatedFinalDate
    });
  };

  // Open edit modal
  const handleOpenEditModal = (project: Project) => {
    setEditingProject({
      ...project,
      methodology: project.methodology || 'scrum',
      sprints: project.sprints || []
    });
    setNewSprintName('');
    setNewSprintStart('');
    setNewSprintEnd('');
    setNewSprintGoal('');
  };

  // Add sprint in modal
  const handleAddSprintInModal = () => {
    if (!editingProject) return;
    const currentSprints = editingProject.sprints || [];
    const sprintNum = currentSprints.length + 1;
    const newSprint: ProjectSprint = {
      id: `sp_${Date.now()}_${sprintNum}`,
      sprintNumber: sprintNum,
      name: newSprintName.trim() || `Sprint ${sprintNum}`,
      startDate: newSprintStart || todayStr,
      endDate: newSprintEnd || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      goal: newSprintGoal.trim() || undefined,
      isAchieved: false
    };

    setEditingProject({
      ...editingProject,
      sprints: [...currentSprints, newSprint]
    });

    setNewSprintName('');
    setNewSprintStart('');
    setNewSprintEnd('');
    setNewSprintGoal('');
  };

  // Remove sprint in modal
  const handleRemoveSprintInModal = (sprintId: string) => {
    if (!editingProject) return;
    setEditingProject({
      ...editingProject,
      sprints: (editingProject.sprints || []).filter((s) => s.id !== sprintId)
    });
  };

  // Save modal changes
  const handleSaveModal = () => {
    if (!editingProject) return;
    onUpdateProject(editingProject.id, {
      methodology: editingProject.methodology,
      finalDeliveryDate: editingProject.finalDeliveryDate,
      isDeliveryAchieved: editingProject.isDeliveryAchieved,
      achievedDate: editingProject.achievedDate,
      sprints: editingProject.sprints,
      deliveryNotes: editingProject.deliveryNotes
    });
    setEditingProject(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Description */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="p-2 bg-blue-500/20 border border-blue-400/30 rounded-xl text-blue-300">
                <Rocket className="w-5 h-5" />
              </span>
              <span className="text-xs uppercase tracking-wider font-bold text-blue-300">
                Delivery Schedule & Milestones
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Project Delivery Planner
            </h2>
            <p className="text-slate-300 text-xs mt-1 max-w-2xl leading-relaxed">
              Plan project delivery dates according to development methodology: 
              <strong className="text-blue-300"> Scrum Agile</strong> (Sprint Start, Sprint End & Final Delivery) or 
              <strong className="text-emerald-300"> Kanban</strong> (Continuous Flow & Target Final Delivery). Track whether delivery milestones are achieved.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start md:self-center">
            <div className="bg-white/10 backdrop-blur-sm border border-white/15 px-4 py-2 rounded-xl text-center">
              <span className="text-xs text-slate-300 block">Achievement Rate</span>
              <span className="text-xl font-bold text-emerald-400">{stats.achievementRate}%</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/15 px-4 py-2 rounded-xl text-center">
              <span className="text-xs text-slate-300 block">Achieved Deliveries</span>
              <span className="text-xl font-bold text-white">{stats.achievedCount} / {stats.total}</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Planned Forecasts</span>
            <Target className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-800">{stats.total}</div>
          <div className="text-[11px] text-slate-400 mt-1">In Forecast Pipeline</div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Scrum Agile</span>
            <GitBranch className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-indigo-600">{stats.scrumCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Sprint-based delivery</div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Kanban Flow</span>
            <KanbanIcon className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-teal-600">{stats.kanbanCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Continuous release dates</div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Achieved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">{stats.achievedCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">{stats.achievementRate}% completed</div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Overdue / At Risk</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-600">{stats.overdueCount}</span>
            {stats.atRiskCount > 0 && (
              <span className="text-xs font-semibold text-amber-600">(+{stats.atRiskCount} due soon)</span>
            )}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Require delivery attention</div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search project name, category or client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Methodology Filter Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80">
            <button
              onClick={() => setMethodologyFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                methodologyFilter === 'all'
                  ? 'bg-white text-slate-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setMethodologyFilter('scrum')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                methodologyFilter === 'scrum'
                  ? 'bg-indigo-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-indigo-600'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              Scrum Agile
            </button>
            <button
              onClick={() => setMethodologyFilter('kanban')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                methodologyFilter === 'kanban'
                  ? 'bg-teal-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-teal-600'
              }`}
            >
              <KanbanIcon className="w-3.5 h-3.5" />
              Kanban
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-all ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Status
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-all ${
                statusFilter === 'pending'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-blue-600'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter('achieved')}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-all ${
                statusFilter === 'achieved'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-emerald-600'
              }`}
            >
              Achieved
            </button>
            <button
              onClick={() => setStatusFilter('overdue')}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-all ${
                statusFilter === 'overdue'
                  ? 'bg-rose-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-rose-600'
              }`}
            >
              Overdue
            </button>
          </div>

          {/* Planned Forecasts Only Filter Toggle */}
          <button
            type="button"
            onClick={() => setOnlyPlannedForecasts(!onlyPlannedForecasts)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border flex items-center space-x-1.5 transition-all shadow-3xs cursor-pointer ${
              onlyPlannedForecasts
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
            title="Toggle showing only Planned Forecasts in Forecast Pipeline"
          >
            <Target className={`w-3.5 h-3.5 ${onlyPlannedForecasts ? 'text-white' : 'text-indigo-600'}`} />
            <span>Planned Forecasts Only</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
              onlyPlannedForecasts ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
            }`}>
              {plannedForecastProjects.length}
            </span>
          </button>
        </div>
      </div>

      {/* Planned Forecasts Notification Banner */}
      {onlyPlannedForecasts && (
        <div className="bg-gradient-to-r from-indigo-50/90 via-blue-50/70 to-slate-50 border border-indigo-200/80 rounded-xl px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-3xs">
          <div className="flex items-center space-x-2 text-xs text-indigo-950 font-medium">
            <span className="p-1 rounded-md bg-indigo-100 text-indigo-700">
              <Target className="w-3.5 h-3.5" />
            </span>
            <span>
              Displaying only <strong>{filteredProjects.length} Planned Forecasts</strong> in <strong>Forecast Pipeline</strong>.
            </span>
          </div>
          {projects.length > plannedForecastProjects.length && (
            <button
              type="button"
              onClick={() => setOnlyPlannedForecasts(false)}
              className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 underline underline-offset-2 shrink-0 cursor-pointer self-start sm:self-auto"
            >
              View all {projects.length} matrix projects
            </button>
          )}
        </div>
      )}

      {/* Projects List / Grid */}
      {filteredProjects.length === 0 ? (
        onlyPlannedForecasts && plannedForecastProjects.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center max-w-xl mx-auto shadow-xs">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-3xs">
              <Target className="w-7 h-7" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1.5">
              No Planned Forecasts in Forecast Pipeline Yet
            </h3>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              In this Delivery Schedule, only projects marked as <strong>Planned Forecasts</strong> in the <strong>Forecast Pipeline</strong> are displayed. Go to the Forecast Pipeline tab and mark forecasts as planned to track their delivery milestones.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {onNavigateToTab && (
                <button
                  type="button"
                  onClick={() => onNavigateToTab('project_forecast')}
                  className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Go to Forecast Pipeline ↗</span>
                </button>
              )}
              {projects.length > 0 && (
                <button
                  type="button"
                  onClick={() => setOnlyPlannedForecasts(false)}
                  className="w-full sm:w-auto px-3.5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Show all {projects.length} matrix projects
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400">
            <Calendar className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <h3 className="text-base font-bold text-slate-700">No projects found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              No projects match your current filters. Try changing your search query or reset the methodology filter.
            </p>
          </div>
        )
      ) : (
        <div className="space-y-4">
          {filteredProjects.map((project) => {
            const methodology: ProjectMethodology = project.methodology || 'scrum';
            const deliveryStatus = getProjectDeliveryStatus(project);
            const isExpanded = expandedProjects[project.id] ?? true;
            const sprints = project.sprints || [];
            const achievedSprints = sprints.filter((s) => s.isAchieved).length;
            const sprintProgress = sprints.length > 0 ? Math.round((achievedSprints / sprints.length) * 100) : 0;
            const matchedForecast = projectForecasts?.find(
              (f) => (f.name.trim().toLowerCase() === project.name.trim().toLowerCase() || f.id === project.id)
            );
            const projectCostingAssignments = assignments?.filter((a) => a.projectId === project.id) || [];

            return (
              <div
                key={project.id}
                className={`bg-white border rounded-xl shadow-xs transition-all ${
                  project.isDeliveryAchieved
                    ? 'border-emerald-200/80 bg-gradient-to-r from-emerald-50/20 via-white to-white'
                    : deliveryStatus.status === 'overdue'
                    ? 'border-rose-200 bg-rose-50/10'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Project Header Row */}
                <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100">
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      onClick={() => toggleExpand(project.id)}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors mt-0.5 shrink-0"
                      title={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-blue-500" />
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug truncate">
                          {project.name}
                        </h3>
                        <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                          {project.category}
                        </span>
                        {project.client && (
                          <span className="text-[10px] text-slate-500">
                            Client: {project.client}
                          </span>
                        )}
                        {isPlannedForecastProject(project) && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                            <Target className="w-2.5 h-2.5 text-indigo-600" />
                            <span>Planned Forecast</span>
                          </span>
                        )}
                        {matchedForecast && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                            <Target className="w-2.5 h-2.5 text-blue-600" />
                            <span>Pipeline: {matchedForecast.priority}</span>
                          </span>
                        )}
                        {matchedForecast?.uatDate && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200" title="Forecast UAT Target Date">
                            <CheckSquare className="w-2.5 h-2.5 text-amber-600" />
                            <span>UAT: {matchedForecast.uatDate}</span>
                          </span>
                        )}
                        {matchedForecast?.goLiveDate && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300" title="Forecast Production Go-Live Target Date">
                            <Rocket className="w-2.5 h-2.5 text-emerald-600" />
                            <span>Go Live: {matchedForecast.goLiveDate}</span>
                          </span>
                        )}
                        {projectCostingAssignments.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                            <Users className="w-2.5 h-2.5 text-emerald-600" />
                            <span>{projectCostingAssignments.length} Costed Devs</span>
                          </span>
                        )}
                        <span className="text-xs font-semibold text-slate-600 ml-auto lg:ml-0">
                          {currencySymbol}{project.totalValue.toLocaleString()}
                        </span>
                      </div>

                      {/* Methodology & Mode Switcher */}
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5 flex-wrap">
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] font-medium text-slate-400">Methodology:</span>
                          <div className="inline-flex rounded-md border border-slate-200 p-0.5 bg-slate-50">
                            <button
                              type="button"
                              onClick={(e) => handleMethodologyChange(project, 'scrum', e)}
                              className={`px-2 py-0.5 text-[11px] font-semibold rounded flex items-center gap-1 transition-all ${
                                methodology === 'scrum'
                                  ? 'bg-indigo-600 text-white shadow-2xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              <GitBranch className="w-3 h-3" />
                              Scrum Agile
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleMethodologyChange(project, 'kanban', e)}
                              className={`px-2 py-0.5 text-[11px] font-semibold rounded flex items-center gap-1 transition-all ${
                                methodology === 'kanban'
                                  ? 'bg-teal-600 text-white shadow-2xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              <KanbanIcon className="w-3 h-3" />
                              Kanban
                            </button>
                          </div>
                        </div>

                        {methodology === 'scrum' && (
                          <div className="flex items-center gap-1.5 text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                            <Flag className="w-3 h-3 text-indigo-500" />
                            <span>{sprints.length} Sprints ({achievedSprints} Achieved)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Action & Delivery Status Section */}
                  <div className="flex items-center gap-3 self-end lg:self-center shrink-0 flex-wrap">
                    {/* Status Badge */}
                    <div className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 shadow-2xs ${deliveryStatus.color}`}>
                      {project.isDeliveryAchieved ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : deliveryStatus.status === 'overdue' ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                      )}
                      <span>{deliveryStatus.label}</span>
                    </div>

                    {/* Delivery Achieved Toggle Button */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleAchieved(project, e)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
                        project.isDeliveryAchieved
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-600/20'
                          : 'bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 hover:border-emerald-400'
                      }`}
                      title={project.isDeliveryAchieved ? 'Mark as In-Progress' : 'Mark Final Delivery Achieved'}
                    >
                      <Award className={`w-3.5 h-3.5 ${project.isDeliveryAchieved ? 'text-white' : 'text-emerald-600'}`} />
                      <span>{project.isDeliveryAchieved ? 'Achieved ✓' : 'Mark Achieved'}</span>
                    </button>

                    {/* Edit Details Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(project)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                      title="Edit Dates & Sprints"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 bg-slate-50/50 space-y-4">
                    {/* Final Delivery Date Bar */}
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Final Target Delivery Date
                          </div>
                          <div className="text-xs font-bold text-slate-800 flex items-center gap-2 mt-0.5">
                            {project.finalDeliveryDate ? (
                              <span>{project.finalDeliveryDate}</span>
                            ) : (
                              <span className="text-amber-600 font-medium italic">Not specified yet</span>
                            )}
                            {project.isDeliveryAchieved && project.achievedDate && (
                              <span className="text-[11px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                Delivered on: {project.achievedDate}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quick Date Input & Achieved Checkbox */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <label className="text-[11px] text-slate-500 font-medium whitespace-nowrap">Target Date:</label>
                          <input
                            type="date"
                            value={project.finalDeliveryDate || ''}
                            onChange={(e) => handleUpdateFinalDeliveryDate(project, e.target.value)}
                            className="text-xs bg-white border border-slate-300 rounded px-2 py-1 text-slate-800 outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>

                        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer bg-slate-50 hover:bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                          <input
                            type="checkbox"
                            checked={Boolean(project.isDeliveryAchieved)}
                            onChange={() => handleToggleAchieved(project)}
                            className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                          />
                          <span>Achieved</span>
                        </label>
                      </div>
                    </div>

                    {/* METHODOLOGY 1: SCRUM AGILE (Sprint Start, End, Final Delivery) */}
                    {methodology === 'scrum' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                              <GitBranch className="w-3.5 h-3.5 text-indigo-600" />
                              Sprint Schedule ({sprints.length} Sprints)
                            </span>
                            {sprints.length > 0 && (
                              <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                                {sprintProgress}% Sprints Achieved
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {sprints.length === 0 && (
                              <button
                                type="button"
                                onClick={() => handleAutoGenerateSprints(project)}
                                className="text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                                Auto-Generate Sprints
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(project)}
                              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Add / Manage Sprints
                            </button>
                          </div>
                        </div>

                        {/* Sprint Progress Bar */}
                        {sprints.length > 0 && (
                          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden shadow-inner">
                            <div
                              className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${sprintProgress}%` }}
                            />
                          </div>
                        )}

                        {/* Sprints Cards / Table */}
                        {sprints.length === 0 ? (
                          <div className="bg-white border border-dashed border-slate-300 rounded-xl p-4 text-center">
                            <p className="text-xs text-slate-500 mb-2">
                              No sprints added yet for this Scrum project.
                            </p>
                            <button
                              type="button"
                              onClick={() => handleAutoGenerateSprints(project)}
                              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 transition-colors"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              Auto-Generate 2-Week Sprints
                            </button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {sprints.map((sprint) => {
                              const isPast = sprint.endDate < todayStr;
                              const isCurrent = sprint.startDate <= todayStr && sprint.endDate >= todayStr;

                              return (
                                <div
                                  key={sprint.id}
                                  className={`p-3 rounded-lg border transition-all ${
                                    sprint.isAchieved
                                      ? 'bg-emerald-50/60 border-emerald-200'
                                      : isCurrent
                                      ? 'bg-blue-50/60 border-blue-300 ring-1 ring-blue-300/60'
                                      : isPast
                                      ? 'bg-amber-50/60 border-amber-200'
                                      : 'bg-white border-slate-200'
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-xs text-slate-800">
                                        {sprint.name}
                                      </span>
                                      {isCurrent && !sprint.isAchieved && (
                                        <span className="text-[9px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                          Active
                                        </span>
                                      )}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleToggleSprintAchieved(project, sprint.id)}
                                      className={`text-[10px] font-bold px-2 py-0.5 rounded transition-all flex items-center gap-1 cursor-pointer ${
                                        sprint.isAchieved
                                          ? 'bg-emerald-600 text-white shadow-2xs'
                                          : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-300 hover:text-emerald-700'
                                      }`}
                                    >
                                      {sprint.isAchieved ? <Check className="w-3 h-3" /> : null}
                                      {sprint.isAchieved ? 'Achieved' : 'Set Achieved'}
                                    </button>
                                  </div>

                                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-white/80 p-2 rounded border border-slate-100 mb-1.5">
                                    <div>
                                      <span className="text-[10px] text-slate-400 block font-medium">Sprint Start</span>
                                      <span className="font-semibold text-slate-700">{sprint.startDate || 'Not set'}</span>
                                    </div>
                                    <div>
                                      <span className="text-[10px] text-slate-400 block font-medium">Sprint End</span>
                                      <span className="font-semibold text-slate-700">{sprint.endDate || 'Not set'}</span>
                                    </div>
                                  </div>

                                  {sprint.goal && (
                                    <div className="text-[11px] text-slate-500 italic truncate" title={sprint.goal}>
                                      &ldquo;{sprint.goal}&rdquo;
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* METHODOLOGY 2: KANBAN FLOW */}
                    {methodology === 'kanban' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                            <KanbanIcon className="w-3.5 h-3.5 text-teal-600" />
                            Kanban Continuous Delivery Flow
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Flow status with final delivery target
                          </span>
                        </div>

                        {/* Kanban Stage Pipeline Tracker */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          <div className="bg-white p-3 rounded-lg border border-slate-200 text-center shadow-2xs">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                              1. Backlog & Scoping
                            </span>
                            <span className="text-xs font-bold text-slate-700">Completed</span>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-slate-200 text-center shadow-2xs">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                              2. Work in Progress
                            </span>
                            <span className="text-xs font-bold text-blue-600">Active Execution</span>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-slate-200 text-center shadow-2xs">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                              3. Review & QA
                            </span>
                            <span className="text-xs font-bold text-amber-600">Continuous Testing</span>
                          </div>
                          <div className={`p-3 rounded-lg border text-center shadow-2xs ${
                            project.isDeliveryAchieved 
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                              : 'bg-white border-slate-200'
                          }`}>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                              4. Final Delivery
                            </span>
                            <span className={`text-xs font-bold ${project.isDeliveryAchieved ? 'text-emerald-700' : 'text-slate-800'}`}>
                              {project.isDeliveryAchieved ? '✅ Delivered' : project.finalDeliveryDate || 'Pending'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Delivery Notes */}
                    {project.deliveryNotes && (
                      <div className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 flex items-start gap-2">
                        <Info className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                        <div>
                          <strong className="text-slate-700">Delivery Notes:</strong> {project.deliveryNotes}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Delivery Plan Modal */}
      {editingProject && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in-50 duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-blue-400" />
                  Edit Delivery Plan: {editingProject.name}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Configure methodology, sprint start/end dates, and final delivery target.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingProject(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Methodology Radio */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Development Methodology
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                      editingProject.methodology === 'scrum'
                        ? 'border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-500'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="modal_methodology"
                      value="scrum"
                      checked={editingProject.methodology === 'scrum'}
                      onChange={() => setEditingProject({ ...editingProject, methodology: 'scrum' })}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <GitBranch className="w-3.5 h-3.5 text-indigo-600" />
                        Scrum Agile
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Sprint start/end dates + Final delivery date
                      </div>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                      editingProject.methodology === 'kanban'
                        ? 'border-teal-500 bg-teal-50/50 ring-1 ring-teal-500'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="modal_methodology"
                      value="kanban"
                      checked={editingProject.methodology === 'kanban'}
                      onChange={() => setEditingProject({ ...editingProject, methodology: 'kanban' })}
                      className="text-teal-600 focus:ring-teal-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <KanbanIcon className="w-3.5 h-3.5 text-teal-600" />
                        Kanban
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Continuous flow + Final delivery date
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Final Delivery Date & Achieved Toggle */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Final Target Delivery Date
                    </label>
                    <input
                      type="date"
                      value={editingProject.finalDeliveryDate || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, finalDeliveryDate: e.target.value })}
                      className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Delivery Achieved Date
                    </label>
                    <input
                      type="date"
                      value={editingProject.achievedDate || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, achievedDate: e.target.value })}
                      disabled={!editingProject.isDeliveryAchieved}
                      className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(editingProject.isDeliveryAchieved)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setEditingProject({
                          ...editingProject,
                          isDeliveryAchieved: checked,
                          achievedDate: checked ? (editingProject.achievedDate || todayStr) : undefined
                        });
                      }}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <span>Final Delivery Achieved / Successfully Handed Over</span>
                  </label>
                </div>
              </div>

              {/* Sprints Section (for Scrum Agile) */}
              {editingProject.methodology === 'scrum' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <GitBranch className="w-3.5 h-3.5 text-indigo-600" />
                      Sprints List ({editingProject.sprints?.length || 0})
                    </label>
                  </div>

                  {/* Existing Sprints List */}
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {(!editingProject.sprints || editingProject.sprints.length === 0) ? (
                      <p className="text-xs text-slate-400 italic p-2 bg-slate-50 rounded border border-slate-100">
                        No sprints configured yet. Use the form below to add sprints.
                      </p>
                    ) : (
                      editingProject.sprints.map((sprint) => (
                        <div
                          key={sprint.id}
                          className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={Boolean(sprint.isAchieved)}
                              onChange={() => {
                                const updated = (editingProject.sprints || []).map((s) =>
                                  s.id === sprint.id ? { ...s, isAchieved: !s.isAchieved } : s
                                );
                                setEditingProject({ ...editingProject, sprints: updated });
                              }}
                              className="w-3.5 h-3.5 text-emerald-600 rounded"
                            />
                            <div>
                              <span className="font-bold text-slate-800">{sprint.name}</span>
                              <span className="text-[10px] text-slate-400 ml-2">
                                {sprint.startDate} → {sprint.endDate}
                              </span>
                              {sprint.goal && (
                                <div className="text-[10px] text-slate-500 truncate max-w-xs">
                                  {sprint.goal}
                                </div>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveSprintInModal(sprint.id)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                            title="Remove sprint"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add New Sprint Form */}
                  <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block">
                      Add New Sprint
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Sprint Name (e.g. Sprint 1)"
                        value={newSprintName}
                        onChange={(e) => setNewSprintName(e.target.value)}
                        className="text-xs p-1.5 bg-white border border-slate-200 rounded outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <div>
                        <input
                          type="date"
                          value={newSprintStart}
                          onChange={(e) => setNewSprintStart(e.target.value)}
                          className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <input
                          type="date"
                          value={newSprintEnd}
                          onChange={(e) => setNewSprintEnd(e.target.value)}
                          className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Sprint Goal or Deliverables (optional)"
                        value={newSprintGoal}
                        onChange={(e) => setNewSprintGoal(e.target.value)}
                        className="flex-1 text-xs p-1.5 bg-white border border-slate-200 rounded outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddSprintInModal}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Sprint
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Delivery Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Delivery Notes & Milestones
                </label>
                <textarea
                  rows={2}
                  placeholder="Add any handover notes, scope deliverables, or client milestones..."
                  value={editingProject.deliveryNotes || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, deliveryNotes: e.target.value })}
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingProject(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveModal}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Save Delivery Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
