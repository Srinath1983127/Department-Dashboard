import React, { useState } from 'react';
import { 
  Briefcase, 
  Plus, 
  ChevronDown, 
  ChevronRight, 
  Trash2, 
  Wand2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Sparkles,
  Users,
  UserPlus,
  DollarSign,
  Rocket
} from 'lucide-react';
import { Project, Developer } from '../types';
import { SHORT_MONTH_NAMES, PROJECT_CATEGORIES } from '../data/initialData';
import { formatCurrency } from '../utils/calculations';

interface ProjectPlannerGridProps {
  projects: Project[];
  currencySymbol: string;
  onAddProject: (project: Omit<Project, 'id'>) => void;
  onUpdateProject: (id: string, updated: Partial<Project>) => void;
  onUpdateProjectMonthValue: (projectId: string, monthIdx: number, value: number) => void;
  onDeleteProject: (id: string) => void;
  onSyncForecastToActuals?: () => void;
  onViewDeliveries?: () => void;
  personsPool?: Developer[];
}

export const ProjectPlannerGrid: React.FC<ProjectPlannerGridProps> = ({
  projects,
  currencySymbol,
  onAddProject,
  onUpdateProject,
  onUpdateProjectMonthValue,
  onDeleteProject,
  onSyncForecastToActuals,
  onViewDeliveries,
  personsPool = []
}) => {
  const [newProjectName, setNewProjectName] = useState<string>('');
  const [newProjectCategory, setNewProjectCategory] = useState<string>(PROJECT_CATEGORIES[0]);
  const [newProjectValue, setNewProjectValue] = useState<number>(120000);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [newProjectMilestones, setNewProjectMilestones] = useState<{ id: string; name: string; value: number }[]>([]);

  const [activePersonMonth, setActivePersonMonth] = useState<{ projectId: string, monthIdx: number } | null>(null);

  const handleAddMilestoneField = () => {
    const nextLength = newProjectMilestones.length + 1;
    setNewProjectMilestones([
      ...newProjectMilestones,
      {
        id: `ms_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: `Milestone ${nextLength}`,
        value: Math.max(0, Math.round(newProjectValue / nextLength))
      }
    ]);
  };

  const handleRemoveMilestoneField = (id: string) => {
    setNewProjectMilestones(newProjectMilestones.filter((ms) => ms.id !== id));
  };

  const handleUpdateMilestoneField = (id: string, field: 'name' | 'value', val: any) => {
    setNewProjectMilestones(
      newProjectMilestones.map((ms) => {
        if (ms.id !== id) return ms;
        return { ...ms, [field]: val };
      })
    );
  };

  const milestonesTotal = newProjectMilestones.reduce((sum, ms) => sum + (ms.value || 0), 0);

  // Compute 12-month aggregated forecasted revenue
  const aggregatedMonthlyForecast = new Array(12).fill(0);
  let totalNextYearRollover = 0;
  projects.forEach((proj) => {
    proj.monthlyForecast.forEach((val, idx) => {
      if (idx < 12) {
        aggregatedMonthlyForecast[idx] += (val || 0);
      }
    });
    totalNextYearRollover += (proj.nextYearRollover || 0);
  });

  const totalForecastValue = aggregatedMonthlyForecast.reduce((sum, v) => sum + v, 0);

  // Handler to create a new project
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const totalVal = Math.max(0, newProjectValue || 0);
    // Distribute value evenly over 12 months by default
    const monthlyVal = Math.round(totalVal / 12);
    const initialForecast = new Array(12).fill(monthlyVal);

    const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'];
    const randomColor = colors[projects.length % colors.length];

    onAddProject({
      name: newProjectName.trim(),
      category: newProjectCategory,
      totalValue: totalVal,
      status: 'active',
      color: randomColor,
      isExpanded: true,
      monthlyForecast: initialForecast,
      paymentMilestones: newProjectMilestones.length > 0 ? newProjectMilestones : undefined,
      methodology: 'scrum',
      isDeliveryAchieved: false
    });

    setNewProjectName('');
    setNewProjectValue(120000);
    setNewProjectMilestones([]);
    setIsCreating(false);
  };

  // Quick Preset Distribution for a project
  const handleApplyPresetDistribution = (projectId: string, totalVal: number, mode: 'even' | 'front' | 'back' | 'ramp') => {
    let newForecast = new Array(12).fill(0);

    if (mode === 'even') {
      const perMonth = Math.round(totalVal / 12);
      newForecast = new Array(12).fill(perMonth);
    } else if (mode === 'front') {
      // 50% in M1-M3, 30% in M4-M6, 20% in M7-M12
      const q1 = Math.round((totalVal * 0.5) / 3);
      const q2 = Math.round((totalVal * 0.3) / 3);
      const h2 = Math.round((totalVal * 0.2) / 6);
      newForecast = [q1, q1, q1, q2, q2, q2, h2, h2, h2, h2, h2, h2];
    } else if (mode === 'back') {
      // 20% H1, 80% H2
      const h1 = Math.round((totalVal * 0.2) / 6);
      const h2 = Math.round((totalVal * 0.8) / 6);
      newForecast = [h1, h1, h1, h1, h1, h1, h2, h2, h2, h2, h2, h2];
    } else if (mode === 'ramp') {
      // Linear weights 1..12 = sum 78
      const step = totalVal / 78;
      newForecast = Array.from({ length: 12 }, (_, i) => Math.round((i + 1) * step));
    }

    onUpdateProject(projectId, { monthlyForecast: newForecast });
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200/80 shadow-xs mb-6 overflow-hidden">
      
      {/* Header */}
      <div className="p-5 bg-slate-50/90 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-md bg-blue-50 text-blue-600 border border-blue-100">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">
              3. 12-Month Project Planner & Revenue Forecast
            </h2>
            <p className="text-xs text-slate-500">
              Add client projects, assign total project contract values, and expand the 12-month sub-grid to forecast monthly revenues.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {onViewDeliveries && (
            <button
              type="button"
              onClick={onViewDeliveries}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
              title="Open full Project Delivery Schedule tab"
            >
              <Rocket className="w-3.5 h-3.5 text-indigo-600" />
              <span>Delivery Schedule Tab ↗</span>
            </button>
          )}

          {onSyncForecastToActuals && (
            <button
              onClick={onSyncForecastToActuals}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
              title="Copy Total Forecast Revenue to Actual Monthly Revenue in Matrix"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Copy Forecast to Actuals</span>
            </button>
          )}

          <button
            onClick={() => setIsCreating(!isCreating)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Project</span>
          </button>
        </div>
      </div>

      {/* Inline Create Project Form */}
      {isCreating && (
        <form onSubmit={handleCreateProject} className="p-6 bg-slate-50 border-b border-slate-200 text-xs">
          <div className="max-w-4xl mx-auto space-y-5">
            
            {/* Title / Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  <span>Create New Client Project</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Fill in the basic project details and define its milestone payment structure.
                </p>
              </div>
              <span className="px-2.5 py-1 text-[10px] font-bold bg-blue-100 text-blue-800 rounded-lg uppercase tracking-wider">
                Project Builder
              </span>
            </div>

            {/* Basic Project Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wide text-[10px]">Project Name *</label>
                <input
                  type="text"
                  required
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g., Enterprise Portal - Phase 1"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-2xs font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wide text-[10px]">Category</label>
                <select
                  value={newProjectCategory}
                  onChange={(e) => setNewProjectCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-2xs font-semibold text-slate-700"
                >
                  {PROJECT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-bold text-slate-700 uppercase tracking-wide text-[10px]">
                    Contract Value ({currencySymbol}) * <span className="text-blue-600 font-normal lowercase">(freely defined)</span>
                  </label>
                  {newProjectMilestones.length > 0 && milestonesTotal > 0 && milestonesTotal !== newProjectValue && (
                    <button
                      type="button"
                      onClick={() => setNewProjectValue(milestonesTotal)}
                      className="text-[9px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 cursor-pointer"
                      title="Sync Contract Value to match sum of milestones"
                    >
                      Match Milestones ({currencySymbol}{milestonesTotal.toLocaleString()})
                    </button>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold text-[11px]">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={newProjectValue === 0 ? '' : newProjectValue}
                    placeholder="0"
                    onChange={(e) => setNewProjectValue(e.target.value === '' ? 0 : Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full pl-8 pr-3 py-2 text-xs font-bold rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-blue-500 bg-white text-slate-900 focus:outline-none focus:ring-1 shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Payment Milestones Sub-form */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-3xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                    <DollarSign className="w-4 h-4 text-emerald-500" />
                    <span>Payment Milestones ({newProjectMilestones.length})</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Define scheduled billing stages. Sum of milestones determines the project's contract value & populates the 12-month revenue forecast.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddMilestoneField}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg shadow-3xs transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Milestone</span>
                </button>
              </div>

              {newProjectMilestones.length === 0 ? (
                <div className="text-center py-6 text-slate-400 bg-slate-50/50 border border-dashed border-slate-200 rounded-lg">
                  <p className="font-medium text-[11px]">No payment milestones defined.</p>
                  <p className="text-[10px] mt-0.5">The contract value will be spread evenly across all 12 months by default.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {newProjectMilestones.map((ms, index) => (
                    <div key={ms.id} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-50/70 p-3 rounded-lg border border-slate-100 shadow-3xs">
                      
                      {/* Milestone Number Label */}
                      <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-extrabold flex items-center justify-center text-[10px] shrink-0">
                        {index + 1}
                      </span>

                      {/* Milestone Name Input */}
                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          required
                          value={ms.name}
                          onChange={(e) => handleUpdateMilestoneField(ms.id, 'name', e.target.value)}
                          placeholder="e.g., UI Design Sign-off"
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-semibold text-slate-800"
                        />
                      </div>

                      {/* Milestone Value Input */}
                      <div className="w-full sm:w-36 flex rounded-md border border-slate-200 bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 overflow-hidden transition-all shadow-2xs">
                        <span className="flex items-center px-2 bg-slate-100 text-slate-500 font-bold select-none text-[10px] border-r border-slate-200 shrink-0">
                          {currencySymbol}
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          required
                          value={ms.value || ''}
                          onChange={(e) => handleUpdateMilestoneField(ms.id, 'value', Math.max(0, parseFloat(e.target.value) || 0))}
                          placeholder="0"
                          className="w-full px-2 py-1.5 text-xs font-bold border-0 outline-none focus:outline-none focus:ring-0 text-slate-800"
                        />
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveMilestoneField(ms.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors self-end sm:self-auto shrink-0"
                        title="Remove Milestone"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  
                  {/* Milestones Total Banner */}
                  <div className="flex justify-between items-center px-4 py-2 bg-blue-50 text-blue-800 rounded-lg border border-blue-100 font-bold text-xs mt-3">
                    <span>Sum of Milestones:</span>
                    <span>{formatCurrency(milestonesTotal, currencySymbol)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setNewProjectMilestones([]);
                }}
                className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 text-white font-extrabold rounded-lg hover:bg-blue-700 shadow-md transition-colors cursor-pointer"
              >
                Save Project
              </button>
            </div>
          </div>
        </form>
      )}

      {/* List of Projects */}
      <div className="divide-y divide-slate-200">
        {projects.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No active projects. Click "Add New Project" above to create one.
          </div>
        ) : (
          projects.map((proj) => {
            const sumAllocated = proj.monthlyForecast.reduce((a, b) => a + (b || 0), 0);
            const isBalanced = sumAllocated === proj.totalValue;

            const totalInvoiceAmount = proj.monthlyForecast.reduce((sum, val, idx) => {
              const isInvoiced = proj.invoicedMonths?.[idx] ?? false;
              return sum + (isInvoiced ? (val || 0) : 0);
            }, 0);

            const balanceAmount = (proj.totalValue || 0) - totalInvoiceAmount;

            return (
              <div key={proj.id} className="transition-colors border-b border-slate-100 last:border-b-0">
                
                {/* Project Overview Bar */}
                <div className="px-5 py-3.5 bg-white hover:bg-slate-50/80 flex flex-col xl:flex-row xl:items-center justify-between gap-3 text-xs">
                  
                  {/* Left: Expand Toggle + Name + Category */}
                  <div className="flex items-center space-x-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => onUpdateProject(proj.id, { isExpanded: !proj.isExpanded })}
                      className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors shrink-0"
                      title={proj.isExpanded ? "Collapse 12-Month Grid" : "Expand 12-Month Grid"}
                    >
                      {proj.isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>

                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: proj.color }} />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={proj.name}
                          onChange={(e) => onUpdateProject(proj.id, { name: e.target.value })}
                          className="font-bold text-slate-900 text-sm hover:bg-slate-100 focus:bg-white px-1 py-0.5 rounded border border-transparent hover:border-slate-300 focus:border-blue-500 truncate"
                        />
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-600 rounded shrink-0">
                          {proj.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Total Contract Value + Invoiced + Balance + Preset Tools + Delete */}
                  <div className="flex flex-wrap items-center gap-2.5 xl:justify-end">
                    <div className="flex items-center space-x-1.5 shrink-0 bg-slate-50/90 hover:bg-slate-100/80 px-2.5 py-1 rounded-lg border border-slate-200 shadow-3xs transition-all">
                      <span className="text-slate-600 font-bold text-[11px] whitespace-nowrap">Contract Value:</span>
                      <div className="relative w-36">
                        <span className="absolute inset-y-0 left-0 pl-2 flex items-center text-slate-400 font-bold pointer-events-none text-xs">
                          {currencySymbol}
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={proj.totalValue === 0 ? '' : proj.totalValue}
                          placeholder="0"
                          onChange={(e) => onUpdateProject(proj.id, { totalValue: e.target.value === '' ? 0 : Math.max(0, parseFloat(e.target.value) || 0) })}
                          className="w-full pl-5 pr-1.5 py-0.5 font-black text-slate-900 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-3xs"
                          title="Freely define project contract value"
                        />
                      </div>
                    </div>

                    {/* Allocation Balance Pill */}
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg flex items-center space-x-1 shrink-0 ${
                      isBalanced 
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' 
                        : 'bg-amber-50 text-amber-900 border border-amber-100'
                    }`} title="How much of contract value is allocated across 12 months">
                      {isBalanced ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <AlertCircle className="w-3.5 h-3.5 text-amber-500" />}
                      <span>
                        Allocated: {formatCurrency(sumAllocated, currencySymbol, true)}
                        {!isBalanced && ` (${formatCurrency(sumAllocated - proj.totalValue, currencySymbol)})`}
                      </span>
                    </span>

                    {/* Invoiced Amount Pill */}
                    <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg flex items-center space-x-1 bg-blue-50 text-blue-700 border border-blue-100 shrink-0" title="Sum of months marked as Invoiced">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                      <span>
                        Invoiced: {formatCurrency(totalInvoiceAmount, currencySymbol, true)}
                      </span>
                    </span>

                    {/* Balance Amount Pill */}
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg flex items-center space-x-1 border shrink-0 ${
                      balanceAmount > 0 
                        ? 'bg-purple-50 text-purple-700 border-purple-100' 
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`} title="Contract value minus total invoiced amount">
                      <DollarSign className="w-3.5 h-3.5 text-purple-500" />
                      <span>
                        Balance: {formatCurrency(balanceAmount, currencySymbol, true)}
                      </span>
                    </span>

                    {/* Actions */}
                    <button
                      type="button"
                      onClick={() => onDeleteProject(proj.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0 ml-1"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>

                {/* Expanded 12-Column Sub-Grid */}
                {proj.isExpanded && (
                  <div className="p-5 bg-slate-50/70 border-t border-slate-100">
                    
                    {/* Project Financial Summary Banner */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
                      <div className="flex flex-col">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                            Total Project Value (Contract)
                          </span>
                          <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                            Freely Defined
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="relative w-44">
                            <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 font-extrabold text-xs pointer-events-none">
                              {currencySymbol}
                            </span>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={proj.totalValue === 0 ? '' : proj.totalValue}
                              placeholder="0"
                              onChange={(e) => onUpdateProject(proj.id, { totalValue: e.target.value === '' ? 0 : Math.max(0, parseFloat(e.target.value) || 0) })}
                              className="w-full pl-6 pr-2.5 py-1 font-black text-slate-900 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-3xs transition-all"
                              title="Freely define project contract value"
                            />
                          </div>
                          {sumAllocated > 0 && sumAllocated !== proj.totalValue && (
                            <button
                              type="button"
                              onClick={() => onUpdateProject(proj.id, { totalValue: sumAllocated })}
                              className="text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-1 rounded transition-colors whitespace-nowrap cursor-pointer shadow-3xs"
                              title="Set Contract Value equal to the sum of 12-Month Forecasts"
                            >
                              Match 12-Mo Sum
                            </button>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-2">
                          <span>
                            Allocated: <span className="font-semibold text-slate-700">{formatCurrency(sumAllocated, currencySymbol)}</span> ({proj.totalValue > 0 ? Math.round((sumAllocated / proj.totalValue) * 100) : 0}%)
                          </span>
                          {!isBalanced && (
                            <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                              {sumAllocated > proj.totalValue 
                                ? `+${formatCurrency(sumAllocated - proj.totalValue, currencySymbol)} over` 
                                : `${formatCurrency(proj.totalValue - sumAllocated, currencySymbol)} unallocated`}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col border-t sm:border-t-0 sm:border-l border-slate-100 sm:pl-4 pt-3 sm:pt-0">
                        <span className="text-[10px] uppercase font-bold text-blue-500 tracking-wider flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                          Total Invoice Amount
                        </span>
                        <span className="text-base font-extrabold text-blue-600 mt-0.5">
                          {formatCurrency(totalInvoiceAmount, currencySymbol)}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-1">
                          Progress: <span className="font-semibold text-blue-700">{proj.totalValue > 0 ? Math.round((totalInvoiceAmount / proj.totalValue) * 100) : 0}%</span> of total contract
                        </div>
                      </div>
                      <div className="flex flex-col border-t sm:border-t-0 sm:border-l border-slate-100 sm:pl-4 pt-3 sm:pt-0">
                        <span className="text-[10px] uppercase font-bold text-purple-600 tracking-wider flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${balanceAmount > 0 ? 'bg-purple-500' : 'bg-slate-400'}`} />
                          Balance Amount
                        </span>
                        <span className={`text-base font-extrabold mt-0.5 ${balanceAmount > 0 ? 'text-purple-700' : 'text-slate-600'}`}>
                          {formatCurrency(balanceAmount, currencySymbol)}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-1">
                          Remaining: <span className={`font-semibold ${balanceAmount > 0 ? 'text-purple-700' : 'text-slate-600'}`}>{proj.totalValue > 0 ? Math.max(0, Math.round((balanceAmount / proj.totalValue) * 100)) : 0}%</span> left to invoice
                        </div>
                      </div>
                    </div>
                    
                    {/* Milestones Schedule Table */}
                    <div className="mb-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                            <DollarSign className="w-4 h-4 text-emerald-500" />
                            <span>Project Payment Milestones ({proj.paymentMilestones?.length || 0})</span>
                          </h4>
                          {proj.paymentMilestones && proj.paymentMilestones.length > 0 && (() => {
                            const msSum = proj.paymentMilestones.reduce((sum, m) => sum + (m.value || 0), 0);
                            return msSum > 0 && msSum !== proj.totalValue ? (
                              <button
                                type="button"
                                onClick={() => onUpdateProject(proj.id, { totalValue: msSum })}
                                className="text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded transition-all cursor-pointer shadow-3xs"
                                title="Optionally sync contract value to equal the milestones total"
                              >
                                <span>Match Milestones ({formatCurrency(msSum, currencySymbol)})</span>
                              </button>
                            ) : null;
                          })()}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const currentMilestones = proj.paymentMilestones ? [...proj.paymentMilestones] : [];
                            const newMs = {
                              id: `ms_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                              name: `Milestone ${currentMilestones.length + 1}`,
                              value: 0
                            };
                            const updatedMilestones = [...currentMilestones, newMs];
                            
                            // Keep contract value freely defined; do not force overwrite totalValue
                            onUpdateProject(proj.id, { 
                              paymentMilestones: updatedMilestones
                            });
                          }}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Milestone</span>
                        </button>
                      </div>
                      
                      {(!proj.paymentMilestones || proj.paymentMilestones.length === 0) ? (
                        <div className="text-center py-4 text-slate-400 text-[11px] bg-slate-50/50 border border-dashed border-slate-200 rounded-lg">
                          No custom billing milestones defined. Contract value is spread based on 12-Month grid below.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
                          {proj.paymentMilestones.map((ms, msIndex) => (
                            <div key={ms.id} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100 shadow-2xs">
                              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 font-extrabold flex items-center justify-center text-[9px] shrink-0">
                                {msIndex + 1}
                              </span>
                              <input
                                type="text"
                                value={ms.name}
                                onChange={(e) => {
                                  const updatedMilestones = proj.paymentMilestones!.map(m => m.id === ms.id ? { ...m, name: e.target.value } : m);
                                  onUpdateProject(proj.id, { paymentMilestones: updatedMilestones });
                                }}
                                placeholder="Milestone description"
                                className="flex-1 px-2 py-1 text-xs bg-white border border-slate-200 rounded outline-none text-slate-700 font-semibold focus:border-blue-500"
                              />
                              <div className="w-28 flex rounded border border-slate-200 bg-white overflow-hidden transition-all shadow-2xs">
                                <span className="flex items-center px-1.5 bg-slate-50 text-slate-400 font-bold text-[9px] border-r border-slate-200 shrink-0">
                                  {currencySymbol}
                                </span>
                                <input
                                  type="number"
                                  min="0"
                                  step="any"
                                  value={ms.value || ''}
                                  onChange={(e) => {
                                    const updatedMilestones = proj.paymentMilestones!.map(m => m.id === ms.id ? { ...m, value: Math.max(0, parseFloat(e.target.value) || 0) } : m);
                                    // Keep contract value freely defined; do not force overwrite totalValue
                                    onUpdateProject(proj.id, { 
                                      paymentMilestones: updatedMilestones
                                    });
                                  }}
                                  placeholder="0"
                                  className="w-full px-1.5 py-1 text-xs font-bold border-0 outline-none focus:outline-none focus:ring-0 text-slate-800"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedMilestones = proj.paymentMilestones!.filter(m => m.id !== ms.id);
                                  // Keep contract value freely defined; do not force overwrite totalValue
                                  onUpdateProject(proj.id, { 
                                    paymentMilestones: updatedMilestones
                                  });
                                }}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                                title="Remove Milestone"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Distribution Preset Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-[11px]">
                      <span className="text-slate-500 font-medium flex items-center space-x-1">
                        <Wand2 className="w-3 h-3 text-blue-500" />
                        <span>Quick Distribution Presets for {proj.name}:</span>
                      </span>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleApplyPresetDistribution(proj.id, proj.totalValue, 'even')}
                          className="px-2 py-1 bg-white hover:bg-slate-200 text-slate-700 border border-slate-200 rounded transition-colors"
                        >
                          Even Split (÷12)
                        </button>
                        <button
                          onClick={() => handleApplyPresetDistribution(proj.id, proj.totalValue, 'front')}
                          className="px-2 py-1 bg-white hover:bg-slate-200 text-slate-700 border border-slate-200 rounded transition-colors"
                        >
                          Front-Loaded
                        </button>
                        <button
                          onClick={() => handleApplyPresetDistribution(proj.id, proj.totalValue, 'back')}
                          className="px-2 py-1 bg-white hover:bg-slate-200 text-slate-700 border border-slate-200 rounded transition-colors"
                        >
                          Back-Loaded
                        </button>
                        <button
                          onClick={() => handleApplyPresetDistribution(proj.id, proj.totalValue, 'ramp')}
                          className="px-2 py-1 bg-white hover:bg-slate-200 text-slate-700 border border-slate-200 rounded transition-colors"
                        >
                          Ramp Up
                        </button>
                      </div>
                    </div>

                    {/* 13-Column Month Forecast Inputs Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 xl:grid-cols-[repeat(13,minmax(0,1fr))] gap-2">
                      {proj.monthlyForecast.map((val, idx) => {
                        const isActive = activePersonMonth?.projectId === proj.id && activePersonMonth?.monthIdx === idx;
                        const personCount = proj.monthlyPersons?.[idx]?.length || 0;
                        return (
                          <div key={idx} className={`bg-white p-2 rounded border text-center shadow-2xs transition-colors ${isActive ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200'}`}>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">
                              {SHORT_MONTH_NAMES[idx]}
                            </label>
                            <div className="relative mb-1.5">
                              <input
                                type="number"
                                min="0"
                                step="any"
                                value={val || 0}
                                onChange={(e) => onUpdateProjectMonthValue(proj.id, idx + 1, parseFloat(e.target.value) || 0)}
                                className="w-full text-center py-1 px-1 font-semibold text-slate-900 text-xs bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-blue-500 rounded focus:outline-none"
                              />
                            </div>
                            <label className="flex items-center justify-center gap-1.5 mb-1.5 cursor-pointer hover:bg-slate-50 py-0.5 rounded transition-colors">
                              <input
                                type="checkbox"
                                checked={proj.invoicedMonths?.[idx] ?? false}
                                onChange={(e) => {
                                  const currentInvoiced = proj.invoicedMonths ? [...proj.invoicedMonths] : new Array(12).fill(false);
                                  currentInvoiced[idx] = e.target.checked;
                                  onUpdateProject(proj.id, { invoicedMonths: currentInvoiced });
                                }}
                                className="w-3 h-3 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                              />
                              <span className="text-[9px] font-medium text-slate-500 uppercase select-none">Invoiced</span>
                            </label>
                            <button
                              onClick={() => {
                                const newForecast = [...proj.monthlyForecast];
                                const newInvoiced = [...(proj.invoicedMonths || Array(12).fill(false))];
                                const newPersons = [...(proj.monthlyPersons || Array.from({ length: 12 }, () => []))];
                                
                                const rolloverValue = newForecast[11];
                                
                                for (let i = 11; i > idx; i--) {
                                  newForecast[i] = newForecast[i - 1];
                                  newInvoiced[i] = newInvoiced[i - 1];
                                  newPersons[i] = newPersons[i - 1];
                                }
                                
                                newForecast[idx] = 0;
                                newInvoiced[idx] = false;
                                newPersons[idx] = [];
                                
                                const currentRollover = proj.nextYearRollover || 0;
                                
                                onUpdateProject(proj.id, {
                                  monthlyForecast: newForecast,
                                  invoicedMonths: newInvoiced,
                                  monthlyPersons: newPersons,
                                  nextYearRollover: currentRollover + rolloverValue
                                });
                              }}
                              className="w-full text-[10px] py-1 mb-1.5 rounded font-medium flex items-center justify-center gap-1 transition-colors bg-amber-50 text-amber-700 hover:bg-amber-100"
                              title="Shift this and future months forward"
                            >
                              Shift
                              <ArrowRight className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setActivePersonMonth(isActive ? null : { projectId: proj.id, monthIdx: idx })}
                              className={`w-full text-[10px] py-1 rounded font-medium flex items-center justify-center gap-1 transition-colors ${isActive ? 'bg-blue-100 text-blue-700' : (personCount > 0 ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200')}`}
                              title="Manage Persons & Targets for this Month"
                            >
                              <Users className="w-3 h-3" />
                              {personCount}
                            </button>
                          </div>
                        );
                      })}
                      
                      {/* Next Year Roll-over */}
                      <div className="bg-slate-50/50 p-2 rounded border border-slate-200 text-center shadow-2xs flex flex-col items-center justify-center opacity-90">
                        <label className="block text-[10px] font-bold text-indigo-500 uppercase tracking-tight mb-2">
                          Next Year
                        </label>
                        <div className="text-sm font-bold text-indigo-600">
                          {formatCurrency(proj.nextYearRollover || 0, currencySymbol)}
                        </div>
                      </div>
                    </div>

                    {/* Person Assignment Section for Active Month */}
                    {activePersonMonth?.projectId === proj.id && (
                      <div className="mt-4 p-4 bg-white border border-blue-200 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                          <h4 className="text-sm font-bold text-slate-800">
                            Monthly Person Assignments & Targets — {SHORT_MONTH_NAMES[activePersonMonth.monthIdx]}
                          </h4>
                          <button
                            onClick={() => {
                              const mIdx = activePersonMonth.monthIdx;
                              const currentPersons = [...(proj.monthlyPersons || Array.from({ length: 12 }, () => []))];
                              const newPerson = { id: `person_${Date.now()}`, name: '', target: 0, actual: 0 };
                              currentPersons[mIdx] = [...(currentPersons[mIdx] || []), newPerson];
                              onUpdateProject(proj.id, { monthlyPersons: currentPersons });
                            }}
                            className="flex items-center gap-1 text-[11px] bg-blue-50 text-blue-700 px-2 py-1.5 rounded font-semibold hover:bg-blue-100 transition-colors"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            Assign Person
                          </button>
                        </div>

                        {(!proj.monthlyPersons?.[activePersonMonth.monthIdx] || proj.monthlyPersons[activePersonMonth.monthIdx].length === 0) ? (
                          <div className="text-center py-6 text-slate-400 text-xs border border-dashed border-slate-200 rounded">
                            No persons assigned for {SHORT_MONTH_NAMES[activePersonMonth.monthIdx]}. Click "Assign Person" to add.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {/* Header Row */}
                            <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-500 uppercase px-2 mb-1">
                              <div className="col-span-4">Person Name</div>
                              <div className="col-span-3">Target Amount</div>
                              <div className="col-span-3">Actual Amount</div>
                              <div className="col-span-2 text-right pr-6">Profit / Loss</div>
                            </div>
                            
                            {proj.monthlyPersons[activePersonMonth.monthIdx].map((person, pIdx) => {
                              const profitLoss = person.actual - person.target;
                              const isProfit = profitLoss >= 0;
                              
                              const handleUpdate = (field: 'name' | 'target' | 'actual', value: any) => {
                                const currentPersons = [...(proj.monthlyPersons || Array.from({ length: 12 }, () => []))];
                                const mPersons = [...currentPersons[activePersonMonth.monthIdx]];
                                if (field === 'name') {
                                  const dbPerson = personsPool.find(p => p.name === value);
                                  mPersons[pIdx] = { 
                                    ...mPersons[pIdx], 
                                    name: value, 
                                    id: dbPerson ? dbPerson.id : mPersons[pIdx].id,
                                    target: dbPerson?.monthlyTarget !== undefined ? dbPerson.monthlyTarget : mPersons[pIdx].target
                                  };
                                } else {
                                  mPersons[pIdx] = { ...mPersons[pIdx], [field]: value };
                                }
                                currentPersons[activePersonMonth.monthIdx] = mPersons;
                                onUpdateProject(proj.id, { monthlyPersons: currentPersons });
                              };

                              const handleRemove = () => {
                                const currentPersons = [...(proj.monthlyPersons || Array.from({ length: 12 }, () => []))];
                                currentPersons[activePersonMonth.monthIdx] = currentPersons[activePersonMonth.monthIdx].filter(p => p.id !== person.id);
                                onUpdateProject(proj.id, { monthlyPersons: currentPersons });
                              };

                              return (
                                <div key={person.id} className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-100">
                                  <div className="w-1/3">
                                    <select
                                      value={person.name}
                                      onChange={(e) => handleUpdate('name', e.target.value)}
                                      className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                                    >
                                      <option value="">Select Person...</option>
                                      {personsPool.map((dbPerson) => (
                                        <option key={dbPerson.id} value={dbPerson.name}>
                                          {dbPerson.name} ({dbPerson.role})
                                        </option>
                                      ))}
                                      {person.name && !personsPool.some(p => p.name === person.name) && (
                                        <option value={person.name}>{person.name}</option>
                                      )}
                                    </select>
                                  </div>
                                  <div className="w-1/4 flex rounded-md border border-slate-200 bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 overflow-hidden transition-all">
                                    <span className="flex items-center px-1.5 bg-slate-50 text-slate-400 font-medium select-none text-[11px] border-r border-slate-200 shrink-0">
                                      {currencySymbol}
                                    </span>
                                    <input
                                      type="number"
                                      min="0"
                                      step="any"
                                      value={person.target || ''}
                                      onChange={(e) => handleUpdate('target', Math.max(0, parseFloat(e.target.value) || 0))}
                                      placeholder="0"
                                      className="w-full px-1.5 py-1.5 text-xs font-semibold border-0 outline-none focus:outline-none focus:ring-0"
                                    />
                                  </div>
                                  <div className="w-1/4 flex rounded-md border border-slate-200 bg-white focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 overflow-hidden transition-all">
                                    <span className="flex items-center px-1.5 bg-slate-50 text-slate-400 font-medium select-none text-[11px] border-r border-slate-200 shrink-0">
                                      {currencySymbol}
                                    </span>
                                    <input
                                      type="number"
                                      min="0"
                                      step="any"
                                      value={person.actual || ''}
                                      onChange={(e) => handleUpdate('actual', Math.max(0, parseFloat(e.target.value) || 0))}
                                      placeholder="0"
                                      className="w-full px-1.5 py-1.5 text-xs font-semibold border-0 outline-none focus:outline-none focus:ring-0"
                                    />
                                  </div>
                                  <div className="flex-1 flex justify-end items-center gap-2">
                                    <span className={`text-[11px] font-bold px-2 py-1 rounded ${isProfit ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                      {isProfit ? '+' : ''}{formatCurrency(profitLoss, currencySymbol)}
                                    </span>
                                    <button
                                      onClick={handleRemove}
                                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                      title="Remove Person"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                            
                            {/* Summary Row */}
                            <div className="mt-3 pt-2 border-t border-slate-200 flex justify-end text-xs">
                              <div className="flex gap-4">
                                <div className="text-slate-500">
                                  Total Target: <strong className="text-slate-800">{formatCurrency(proj.monthlyPersons[activePersonMonth.monthIdx].reduce((s, p) => s + p.target, 0), currencySymbol)}</strong>
                                </div>
                                <div className="text-slate-500">
                                  Total Actual: <strong className="text-slate-800">{formatCurrency(proj.monthlyPersons[activePersonMonth.monthIdx].reduce((s, p) => s + p.actual, 0), currencySymbol)}</strong>
                                </div>
                                <div className="text-slate-500">
                                  Net P/L: <strong className={proj.monthlyPersons[activePersonMonth.monthIdx].reduce((s, p) => s + (p.actual - p.target), 0) >= 0 ? "text-emerald-600" : "text-rose-600"}>
                                    {formatCurrency(proj.monthlyPersons[activePersonMonth.monthIdx].reduce((s, p) => s + (p.actual - p.target), 0), currencySymbol)}
                                  </strong>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

      {/* Sub-grid Footer Aggregation Row */}
      <div className="p-4 bg-slate-900 text-white text-xs font-bold border-t border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2">
          <span className="uppercase tracking-wider text-blue-400">Total Project Forecasted Revenue per Month:</span>
          <div className="flex gap-4">
            <span>Annual Total Forecast: <strong className="text-emerald-400 font-extrabold">{formatCurrency(totalForecastValue, currencySymbol)}</strong></span>
            <span>Next Year Roll-over: <strong className="text-indigo-400 font-extrabold">{formatCurrency(totalNextYearRollover, currencySymbol)}</strong></span>
          </div>
        </div>

        {/* 13 Month Summary Array */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 xl:grid-cols-[repeat(13,minmax(0,1fr))] gap-2 text-center text-[11px]">
          {aggregatedMonthlyForecast.map((val, idx) => (
            <div key={idx} className="bg-slate-800 p-1.5 rounded border border-slate-700">
              <span className="block text-slate-400 text-[9px] uppercase">{SHORT_MONTH_NAMES[idx]}</span>
              <span className="text-blue-300 font-bold">{formatCurrency(val, currencySymbol, true)}</span>
            </div>
          ))}
          <div className="bg-indigo-900/50 p-1.5 rounded border border-indigo-700">
            <span className="block text-indigo-300 text-[9px] uppercase">Next Year</span>
            <span className="text-indigo-200 font-bold">{formatCurrency(totalNextYearRollover, currencySymbol, true)}</span>
          </div>
        </div>
      </div>

    </section>
  );
};
