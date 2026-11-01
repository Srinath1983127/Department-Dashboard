import React, { useState } from 'react';
import { ProjectForecast, Project } from '../types';
import { 
  Plus, 
  Trash2, 
  Target, 
  AlertCircle, 
  TrendingUp, 
  DollarSign, 
  Edit2, 
  X, 
  CheckCircle,
  Calendar,
  Rocket,
  FileText,
  CheckSquare,
  Code,
  RotateCcw,
  ArrowUpDown
} from 'lucide-react';
import { formatCurrency } from '../utils/calculations';

interface ProjectForecastTabProps {
  forecasts: ProjectForecast[];
  projects: Project[];
  onAddForecast: (forecast: Omit<ProjectForecast, 'id'>) => void;
  onDeleteForecast: (id: string) => void;
  onEditForecast: (forecast: ProjectForecast) => void;
  onAddProject: (project: Omit<Project, 'id'>) => void;
  onDeleteProject: (id: string) => void;
  onNavigateToPlanning: () => void;
  currencySymbol: string;
}

export const ProjectForecastTab: React.FC<ProjectForecastTabProps> = ({
  forecasts,
  projects,
  onAddForecast,
  onDeleteForecast,
  onEditForecast,
  onAddProject,
  onDeleteProject,
  onNavigateToPlanning,
  currencySymbol
}) => {
  const [name, setName] = useState('');
  const [estimatedValue, setEstimatedValue] = useState<number | ''>('');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  
  // Milestone Dates state
  const [cbsdDate, setCbsdDate] = useState('');
  const [devHandoverDate, setDevHandoverDate] = useState('');
  const [uatDate, setUatDate] = useState('');
  const [goLiveDate, setGoLiveDate] = useState('');

  // CBSD Date ordering state (defaults to ascending, earliest first)
  const [cbsdSortOrder, setCbsdSortOrder] = useState<'asc' | 'desc'>('asc');

  const [editingId, setEditingId] = useState<string | null>(null);

  const startEdit = (forecast: ProjectForecast) => {
    setEditingId(forecast.id);
    setName(forecast.name);
    setEstimatedValue(forecast.estimatedValue);
    setPriority(forecast.priority);
    setCbsdDate(forecast.cbsdDate || '');
    setDevHandoverDate(forecast.devHandoverDate || '');
    setUatDate(forecast.uatDate || '');
    setGoLiveDate(forecast.goLiveDate || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName('');
    setEstimatedValue('');
    setPriority('Medium');
    setCbsdDate('');
    setDevHandoverDate('');
    setUatDate('');
    setGoLiveDate('');
  };

  const handleClearMilestoneDates = () => {
    setCbsdDate('');
    setDevHandoverDate('');
    setUatDate('');
    setGoLiveDate('');
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || estimatedValue === '') return;
    
    const payload = {
      name,
      estimatedValue: Number(estimatedValue),
      priority,
      cbsdDate: cbsdDate || undefined,
      devHandoverDate: devHandoverDate || undefined,
      uatDate: uatDate || undefined,
      goLiveDate: goLiveDate || undefined
    };

    if (editingId) {
      onEditForecast({
        id: editingId,
        ...payload
      });
      setEditingId(null);
    } else {
      onAddForecast(payload);
    }
    
    setName('');
    setEstimatedValue('');
    setPriority('Medium');
    setCbsdDate('');
    setDevHandoverDate('');
    setUatDate('');
    setGoLiveDate('');
  };

  const handleMarkAsPlanned = (forecast: ProjectForecast) => {
    const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'];
    const randomColor = colors[projects.length % colors.length];
    
    onAddProject({
      name: forecast.name.trim(),
      category: 'Client Work',
      totalValue: forecast.estimatedValue,
      status: 'planning',
      color: randomColor,
      isExpanded: true,
      monthlyForecast: new Array(12).fill(0),
      isPlannedFromForecast: true,
      forecastId: forecast.id,
      finalDeliveryDate: forecast.goLiveDate || undefined
    });
    onEditForecast({ ...forecast, status: 'planned' });
    onNavigateToPlanning();
  };

  const handleUnmarkAsPlanned = (forecast: ProjectForecast) => {
    const proj = projects.find(p => p.name.trim().toLowerCase() === forecast.name.trim().toLowerCase());
    if (proj) {
      onDeleteProject(proj.id);
    }
    onEditForecast({ ...forecast, status: 'unplanned' });
  };

  const totalPipeline = forecasts.reduce((sum, f) => sum + f.estimatedValue, 0);
  const plannedForecasts = forecasts.filter(f => f.status === 'planned');
  const unplannedForecasts = forecasts.filter(f => f.status !== 'planned');

  // Milestone metric counts
  const countWithGoLive = forecasts.filter(f => !!f.goLiveDate).length;
  const countWithUat = forecasts.filter(f => !!f.uatDate).length;
  const countWithDevHandover = forecasts.filter(f => !!f.devHandoverDate).length;
  const countWithCbsd = forecasts.filter(f => !!f.cbsdDate).length;

  const renderForecastList = (list: ProjectForecast[], isPlannedSection: boolean) => {
    if (list.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border border-slate-200 border-dashed p-8">
          <Target className="w-8 h-8 mb-2 opacity-20" />
          <p className="font-medium text-slate-500 text-sm">No {isPlannedSection ? 'planned' : 'unplanned'} forecasts.</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {[...list]
          .sort((a, b) => {
            // 1. Primary order: CBSD Date
            const hasCbsdA = !!(a.cbsdDate && a.cbsdDate.trim());
            const hasCbsdB = !!(b.cbsdDate && b.cbsdDate.trim());

            if (hasCbsdA && hasCbsdB) {
              const diff = cbsdSortOrder === 'asc'
                ? a.cbsdDate!.localeCompare(b.cbsdDate!)
                : b.cbsdDate!.localeCompare(a.cbsdDate!);
              if (diff !== 0) return diff;
            } else if (hasCbsdA && !hasCbsdB) {
              return -1; // Projects with CBSD date come first
            } else if (!hasCbsdA && hasCbsdB) {
              return 1; // Projects without CBSD date come after
            }

            // 2. Secondary order: Priority (High > Medium > Low)
            const pScore = { High: 3, Medium: 2, Low: 1 };
            const pDiff = (pScore[b.priority] || 0) - (pScore[a.priority] || 0);
            if (pDiff !== 0) return pDiff;

            // 3. Tertiary order: Estimated Value descending
            return b.estimatedValue - a.estimatedValue;
          })
          .map((forecast) => {
            const hasMilestones = forecast.cbsdDate || forecast.devHandoverDate || forecast.uatDate || forecast.goLiveDate;

            return (
              <div 
                key={forecast.id} 
                className={`group bg-white border ${
                  isPlannedSection ? 'border-emerald-200' : 'border-slate-200'
                } p-4 rounded-xl shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4`}
              >
                <div className="flex items-start space-x-3.5 min-w-0 flex-1">
                  <div className={`w-2.5 h-12 rounded-full shrink-0 mt-0.5 ${
                    forecast.priority === 'High' ? 'bg-red-500' :
                    forecast.priority === 'Medium' ? 'bg-amber-400' : 'bg-emerald-400'
                  }`} />
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-800 text-base leading-tight">{forecast.name}</h4>
                      
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center ${
                        forecast.priority === 'High' ? 'bg-red-50 text-red-700 border border-red-100' :
                        forecast.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 
                        'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}>
                        {forecast.priority === 'High' && <AlertCircle className="w-3 h-3 mr-1" />}
                        {forecast.priority}
                      </span>
                      
                      {isPlannedSection && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Planned
                        </span>
                      )}
                    </div>

                    {/* Milestone Schedule Chips */}
                    {hasMilestones && (
                      <div className="flex items-center flex-wrap gap-2 mt-2.5 pt-2 border-t border-slate-100">
                        {forecast.cbsdDate && (
                          <span 
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-medium border border-purple-200/90"
                            title="Concept Brief / Business Solution Design Date"
                          >
                            <FileText className="w-3.5 h-3.5 text-purple-600" />
                            <span className="text-[10px] uppercase font-bold text-purple-900 tracking-wider">CBSD:</span>
                            <span className="font-mono font-semibold">{forecast.cbsdDate}</span>
                          </span>
                        )}

                        {forecast.devHandoverDate && (
                          <span 
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200/90"
                            title="Development Handover Date"
                          >
                            <Code className="w-3.5 h-3.5 text-blue-600" />
                            <span className="text-[10px] uppercase font-bold text-blue-900 tracking-wider">Dev Handover:</span>
                            <span className="font-mono font-semibold">{forecast.devHandoverDate}</span>
                          </span>
                        )}

                        {forecast.uatDate && (
                          <span 
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 text-xs font-medium border border-amber-200/90"
                            title="User Acceptance Testing Target Date"
                          >
                            <CheckSquare className="w-3.5 h-3.5 text-amber-600" />
                            <span className="text-[10px] uppercase font-bold text-amber-900 tracking-wider">UAT:</span>
                            <span className="font-mono font-semibold">{forecast.uatDate}</span>
                          </span>
                        )}

                        {forecast.goLiveDate && (
                          <span 
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-300 shadow-2xs"
                            title="Production Go Live Date"
                          >
                            <Rocket className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-[10px] uppercase font-bold text-emerald-950 tracking-wider">Go Live:</span>
                            <span className="font-mono font-bold text-emerald-900">{forecast.goLiveDate}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between md:justify-end space-x-5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="text-left md:text-right">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Est. Value</div>
                    <div className="font-black text-slate-800 text-base">{formatCurrency(forecast.estimatedValue, currencySymbol)}</div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {!isPlannedSection && (
                      <button
                        onClick={() => handleMarkAsPlanned(forecast)}
                        className="text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 p-2 rounded-lg transition-colors cursor-pointer"
                        title="Mark as Planned & Link to Project Delivery Tracker"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    {isPlannedSection && (
                      <button
                        onClick={() => handleUnmarkAsPlanned(forecast)}
                        className="text-emerald-600 hover:text-slate-500 hover:bg-slate-100 p-2 rounded-lg transition-colors cursor-pointer"
                        title="Unmark as Planned"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => startEdit(forecast)}
                      className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-colors cursor-pointer"
                      title="Edit Forecast & Milestone Dates"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteForecast(forecast.id)}
                      className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors cursor-pointer"
                      title="Delete Forecast"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 animate-in fade-in zoom-in-95 duration-300">
      {/* Header and Summary Metrics */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-center mb-8 gap-5 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center">
            <Target className="w-6 h-6 mr-2.5 text-indigo-600" />
            Project Forecast Pipeline
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Track upcoming client project forecasts, anticipated values, and critical delivery milestone dates.
          </p>
        </div>
        
        {/* KPI Cards */}
        <div className="flex items-center flex-wrap gap-3">
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl px-4 py-3 min-w-[170px] shadow-2xs">
            <div className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">Total Pipeline</div>
            <div className="text-xl font-black text-indigo-900 mt-0.5">{formatCurrency(totalPipeline, currencySymbol)}</div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl px-3.5 py-3 min-w-[130px] shadow-2xs">
            <div className="flex items-center text-[11px] font-bold text-emerald-700 uppercase tracking-wider gap-1">
              <Rocket className="w-3.5 h-3.5 text-emerald-600" />
              <span>Go-Live Targets</span>
            </div>
            <div className="text-lg font-black text-emerald-900 mt-0.5">{countWithGoLive} <span className="text-xs font-normal text-emerald-700">projects</span></div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-xl px-3.5 py-3 min-w-[120px] shadow-2xs">
            <div className="flex items-center text-[11px] font-bold text-amber-700 uppercase tracking-wider gap-1">
              <CheckSquare className="w-3.5 h-3.5 text-amber-600" />
              <span>In UAT</span>
            </div>
            <div className="text-lg font-black text-amber-900 mt-0.5">{countWithUat} <span className="text-xs font-normal text-amber-700">projects</span></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add / Edit Forecast Form */}
        <div className="lg:col-span-1">
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 sticky top-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 flex items-center text-sm">
                {editingId ? (
                  <><Edit2 className="w-4 h-4 mr-2 text-indigo-600" /> Edit Forecast</>
                ) : (
                  <><Plus className="w-4 h-4 mr-2 text-indigo-600" /> Add New Forecast</>
                )}
              </h3>
              {editingId && (
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-full">
                  Editing Mode
                </span>
              )}
            </div>
            
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Project / Task Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  list="existing-projects"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mobile Banking App v2"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm bg-white"
                />
                <datalist id="existing-projects">
                  {projects.map((p) => (
                    <option key={p.id} value={p.name} />
                  ))}
                </datalist>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Est. Value ({currencySymbol}) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-500 text-xs">
                      <DollarSign className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="number"
                      required
                      min="0"
                      value={estimatedValue}
                      onChange={(e) => setEstimatedValue(Number(e.target.value))}
                      className="w-full pl-8 pr-2.5 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm bg-white font-medium"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as 'High' | 'Medium' | 'Low')}
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm font-medium bg-white"
                  >
                    <option value="High">🔴 High Priority</option>
                    <option value="Medium">🟡 Medium Priority</option>
                    <option value="Low">🟢 Low Priority</option>
                  </select>
                </div>
              </div>

              {/* Milestone Dates Card Section */}
              <div className="pt-3 pb-1 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    Milestone Dates
                  </span>
                  {(cbsdDate || devHandoverDate || uatDate || goLiveDate) && (
                    <button
                      type="button"
                      onClick={handleClearMilestoneDates}
                      className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer transition-colors"
                      title="Clear milestone date inputs"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Clear dates</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2.5 bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
                  {/* CBSD Date */}
                  <div>
                    <label className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                      <span className="flex items-center gap-1.5 text-purple-700">
                        <FileText className="w-3.5 h-3.5" />
                        CBSD Date
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">Concept Brief / Design</span>
                    </label>
                    <input
                      type="date"
                      value={cbsdDate}
                      onChange={(e) => setCbsdDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-xs bg-slate-50/50 hover:bg-white text-slate-800 font-medium cursor-pointer"
                    />
                  </div>

                  {/* Dev Handover Date */}
                  <div>
                    <label className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                      <span className="flex items-center gap-1.5 text-blue-700">
                        <Code className="w-3.5 h-3.5" />
                        Dev Handover Date
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">Dev Complete</span>
                    </label>
                    <input
                      type="date"
                      value={devHandoverDate}
                      onChange={(e) => setDevHandoverDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-xs bg-slate-50/50 hover:bg-white text-slate-800 font-medium cursor-pointer"
                    />
                  </div>

                  {/* UAT Date */}
                  <div>
                    <label className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                      <span className="flex items-center gap-1.5 text-amber-700">
                        <CheckSquare className="w-3.5 h-3.5" />
                        UAT Date
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">Acceptance Testing</span>
                    </label>
                    <input
                      type="date"
                      value={uatDate}
                      onChange={(e) => setUatDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-xs bg-slate-50/50 hover:bg-white text-slate-800 font-medium cursor-pointer"
                    />
                  </div>

                  {/* Go Live Date */}
                  <div>
                    <label className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                      <span className="flex items-center gap-1.5 text-emerald-700">
                        <Rocket className="w-3.5 h-3.5" />
                        Go Live Date
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Production</span>
                    </label>
                    <input
                      type="date"
                      value={goLiveDate}
                      onChange={(e) => setGoLiveDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-xs bg-emerald-50/30 hover:bg-white text-emerald-950 font-bold cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-lg shadow-sm transition-colors text-sm flex items-center justify-center cursor-pointer"
                >
                  {editingId ? (
                    <><Edit2 className="w-4 h-4 mr-1.5" /> Update Forecast</>
                  ) : (
                    <><Plus className="w-4 h-4 mr-1.5" /> Add to Pipeline</>
                  )}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="flex-none bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2.5 px-3 rounded-lg shadow-sm transition-colors text-sm flex items-center justify-center cursor-pointer"
                    title="Cancel editing"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Forecast Lists */}
        <div className="lg:col-span-2 flex flex-col space-y-6">
          {/* CBSD Sorting Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-purple-50/70 via-slate-50 to-indigo-50/50 border border-purple-200/80 rounded-xl px-4 py-2.5 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
              <span className="flex items-center justify-center w-6 h-6 rounded-md bg-purple-100 text-purple-700">
                <Calendar className="w-3.5 h-3.5 text-purple-700" />
              </span>
              <span>Ordering:</span>
              <span className="font-bold text-purple-900 bg-white border border-purple-200 px-2 py-0.5 rounded-md shadow-2xs">
                CBSD Date ({cbsdSortOrder === 'asc' ? 'Earliest first' : 'Latest first'})
              </span>
            </div>

            <button
              type="button"
              onClick={() => setCbsdSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white hover:bg-purple-50 text-purple-800 border border-purple-300 transition-colors shadow-2xs cursor-pointer self-start sm:self-auto"
              title="Click to toggle CBSD date order (Ascending / Descending)"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-purple-600" />
              <span>{cbsdSortOrder === 'asc' ? 'Earliest First (Asc)' : 'Latest First (Desc)'}</span>
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2 flex-wrap gap-2">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span>Unplanned Forecasts</span>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
                  {unplannedForecasts.length}
                </span>
                <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
                  Sorted by CBSD Date
                </span>
              </h3>
              <p className="text-xs text-slate-400">Click checkmark to convert into planned project</p>
            </div>
            {renderForecastList(unplannedForecasts, false)}
          </div>

          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2 flex-wrap gap-2">
              <h3 className="text-lg font-bold text-emerald-800 flex items-center gap-2">
                <span>Planned Forecasts</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                  {plannedForecasts.length}
                </span>
                <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
                  Sorted by CBSD Date
                </span>
              </h3>
              <p className="text-xs text-slate-400">Converted and linked to active projects</p>
            </div>
            {renderForecastList(plannedForecasts, true)}
          </div>
        </div>
      </div>
    </div>
  );
};
