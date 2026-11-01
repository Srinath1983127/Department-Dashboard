import React, { useState, useMemo } from 'react';
import { Developer, ProjectAssignment, Project } from '../types';
import { Calendar, Clock, CheckCircle2, UserCircle2, Briefcase, ArrowRight, LayoutTemplate, CalendarDays, FileText, Save, Loader2, Check, Target, ListTodo, Smartphone } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface DeveloperDashboardProps {
  developers: Developer[];
  assignments: ProjectAssignment[];
  projects: Project[];
  currencySymbol?: string;
}

export const DeveloperDashboard: React.FC<DeveloperDashboardProps> = ({
  developers, assignments, projects,
  currencySymbol = '$'
}) => {
  const [selectedDevId, setSelectedDevId] = useState<string>(developers[0]?.id || '');
  const [viewMode, setViewMode] = useState<'board' | 'schedule' | 'timesheet'>('board');
  const [scheduleMonth, setScheduleMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Timesheet state
  const [timesheetWeekStart, setTimesheetWeekStart] = useState(() => {
    const now = new Date();
    const day = now.getDay() || 7;
    now.setDate(now.getDate() - day + 1);
    return now.toISOString().split('T')[0];
  });
  const [timesheetHours, setTimesheetHours] = useState<Record<string, Record<string, string>>>({});
  const [submittingTimesheet, setSubmittingTimesheet] = useState(false);
  const [timesheetSuccess, setTimesheetSuccess] = useState(false);

  const { past, current, future } = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const devAssignments = assignments.filter(a => a.developerId === selectedDevId);

    const past: any[] = [];
    const current: any[] = [];
    const future: any[] = [];

    devAssignments.forEach(a => {
      const project = projects.find(p => p.id === a.projectId);
      const enriched = { ...a, projectName: a.projectId === 'LEAVE' ? '🌴 Leave / Time Off' : (project?.name || 'Unknown Project') };
      
      if (a.endDate < today) {
        past.push(enriched);
      } else if (a.startDate > today) {
        future.push(enriched);
      } else {
        current.push(enriched);
      }
    });

    // Sort by dates
    past.sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime()); // newest past first
    current.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    future.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    return { past, current, future };
  }, [selectedDevId, assignments, projects]);

  const currentAssignedValue = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const currentMonthStart = `${year}-${month}-01`;
    const daysInMonth = new Date(year, now.getMonth() + 1, 0).getDate();
    const currentMonthEnd = `${year}-${month}-${daysInMonth}`;

    return assignments
      .filter(a => a.developerId === selectedDevId && a.projectId !== 'LEAVE')
      .filter(a => a.startDate <= currentMonthEnd && a.endDate >= currentMonthStart)
      .reduce((sum, a) => sum + (a.projectValue || 0), 0);
  }, [assignments, selectedDevId]);

  // Schedule View Logic
  const { weeks, monthAssignments } = useMemo(() => {
    if (!scheduleMonth) return { weeks: [], monthAssignments: [] };
    
    const [yearStr, monthStr] = scheduleMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const daysInMonth = new Date(year, month, 0).getDate();

    const weeks = [
      { label: 'Week 1 (1-7)', start: `${yearStr}-${monthStr}-01`, end: `${yearStr}-${monthStr}-07` },
      { label: 'Week 2 (8-14)', start: `${yearStr}-${monthStr}-08`, end: `${yearStr}-${monthStr}-14` },
      { label: 'Week 3 (15-21)', start: `${yearStr}-${monthStr}-15`, end: `${yearStr}-${monthStr}-21` },
      { label: 'Week 4 (22-28)', start: `${yearStr}-${monthStr}-22`, end: `${yearStr}-${monthStr}-28` },
    ];
    if (daysInMonth > 28) {
      weeks.push({ label: `Week 5 (29-${daysInMonth})`, start: `${yearStr}-${monthStr}-29`, end: `${yearStr}-${monthStr}-${daysInMonth}` });
    }

    const devAssignments = assignments.filter(a => a.developerId === selectedDevId);
    
    const monthStart = `${yearStr}-${monthStr}-01`;
    const monthEnd = `${yearStr}-${monthStr}-${daysInMonth}`;
    
    const monthAssignments = devAssignments
      .filter(a => a.startDate <= monthEnd && a.endDate >= monthStart)
      .map(a => {
        const project = projects.find(p => p.id === a.projectId);
        return { ...a, projectName: a.projectId === 'LEAVE' ? '🌴 Leave / Time Off' : (project?.name || 'Unknown Project') };
      });

    return { weeks, monthAssignments };
  }, [scheduleMonth, selectedDevId, assignments, projects]);

  // Timesheet View Logic
  const timesheetDays = useMemo(() => {
    const start = new Date(timesheetWeekStart);
    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      return {
        dateStr: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: date.getDate()
      };
    });
  }, [timesheetWeekStart]);

  const timesheetAssignments = useMemo(() => {
    if (!timesheetDays.length) return [];
    const weekStart = timesheetDays[0].dateStr;
    const weekEnd = timesheetDays[6].dateStr;
    
    return assignments
      .filter(a => a.developerId === selectedDevId && a.startDate <= weekEnd && a.endDate >= weekStart)
      .map(a => {
        const project = projects.find(p => p.id === a.projectId);
        return { ...a, projectName: a.projectId === 'LEAVE' ? '🌴 Leave / Time Off' : (project?.name || 'Unknown Project') };
      });
  }, [assignments, selectedDevId, projects, timesheetDays]);

  const handleTimesheetChange = (assignmentId: string, dateStr: string, val: string) => {
    setTimesheetHours(prev => ({
      ...prev,
      [assignmentId]: {
        ...(prev[assignmentId] || {}),
        [dateStr]: val
      }
    }));
  };

  const handleSubmitTimesheet = () => {
    setSubmittingTimesheet(true);
    // Mock API call to save timesheet
    setTimeout(() => {
      setSubmittingTimesheet(false);
      setTimesheetSuccess(true);
      setTimeout(() => setTimesheetSuccess(false), 3000);
    }, 1000);
  };

  const selectedDev = developers.find(d => d.id === selectedDevId);

  // Render cards
  const renderTaskCard = (task: any, status: 'past' | 'current' | 'future') => {
    const isLeave = task.projectId === 'LEAVE';
    const statusColors = {
      past: isLeave ? 'bg-emerald-50/50 border-emerald-200 text-emerald-600 opacity-70' : 'bg-slate-50 border-slate-200 text-slate-500',
      current: isLeave ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-blue-50 border-blue-200 text-blue-700',
      future: isLeave ? 'bg-emerald-50/80 border-emerald-200 text-emerald-700 border-dashed' : 'bg-amber-50 border-amber-200 text-amber-700'
    };

    const taskDesc = (task.taskDescription || task.task_description || '').trim();
    const invType = (task.invoiceType || task.invoice_type || '').trim();

    return (
      <div key={task.id} className={`p-4 rounded-xl border ${statusColors[status]} mb-3 shadow-sm transition-all hover:shadow-md`}>
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-bold text-sm text-slate-800 leading-tight">{task.projectName}</h4>
          <span className="text-xs font-bold px-2 py-1 bg-white rounded-md shadow-sm border border-slate-100 text-slate-700">
            {task.allocationPercentage}%
          </span>
        </div>
        <div className="flex items-center text-xs mb-2.5 font-medium flex-wrap gap-1.5">
          <span className="flex items-center text-slate-600">
            <Briefcase className="w-3.5 h-3.5 mr-1.5 opacity-70" />
            {task.roleInProject}
          </span>
          {invType && (
            <span className="text-[10px] font-semibold bg-white/90 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200 shadow-2xs">
              {invType}
            </span>
          )}
        </div>
        {taskDesc && (
          <div className="mt-2.5 mb-3 bg-white/95 rounded-lg p-2.5 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              <ListTodo className="w-3.5 h-3.5 mr-1 text-blue-600" />
              Task Description
            </div>
            <div className="text-xs text-slate-700 font-medium leading-relaxed whitespace-pre-wrap break-words">
              {taskDesc}
            </div>
          </div>
        )}
        <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-200/50 font-medium text-slate-600">
          <div className="flex items-center">
            <Calendar className="w-3.5 h-3.5 mr-1 opacity-70" />
            {task.startDate}
          </div>
          <ArrowRight className="w-3 h-3 opacity-40 mx-1" />
          <div className="flex items-center">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 opacity-70" />
            {task.endDate}
          </div>
        </div>
      </div>
    );
  };

  if (!developers.length) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-xl shadow-sm border border-slate-200">
        No developers available. Add developers in the Resource Allocation tab.
      </div>
    );
  }

  // Ensure selection if first dev loaded late
  if (!selectedDevId && developers.length > 0) {
      setSelectedDevId(developers[0].id);
  }

  return (
    <div className="flex flex-col space-y-4">
      {/* Mobile PWA Install Banner */}
      <PWAInstallButton variant="banner" />

      {/* Mobile Developer Quick Selector Bar */}
      <div className="md:hidden bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <UserCircle2 className="w-3.5 h-3.5 text-blue-600" />
            Developer
          </span>
          <span className="text-[10px] text-slate-400 font-medium">{developers.length} team members</span>
        </div>
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none snap-x">
          {developers.map(dev => (
            <button
              key={dev.id}
              onClick={() => setSelectedDevId(dev.id)}
              className={`shrink-0 snap-start flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedDevId === dev.id
                  ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-600/30'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${selectedDevId === dev.id ? 'bg-white' : 'bg-blue-500'}`} />
              <span>{dev.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row min-h-[600px] animate-in fade-in zoom-in-95 duration-300">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex md:w-64 bg-slate-50 border-r border-slate-200 flex-col">
          <div className="p-4 border-b border-slate-200 bg-white shadow-sm z-10 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm flex items-center">
              <UserCircle2 className="w-5 h-5 mr-2 text-blue-600" />
              Developer Directory
            </h3>
            <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-mono">{developers.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {developers.map(dev => (
              <button
                key={dev.id}
                onClick={() => setSelectedDevId(dev.id)}
                className={`w-full text-left px-3 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  selectedDevId === dev.id 
                    ? 'bg-blue-600 text-white shadow-md transform scale-[1.01]' 
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 shadow-sm'
                }`}
              >
                <div className="font-bold">{dev.name}</div>
                <div className={`text-[10px] mt-1 ${selectedDevId === dev.id ? 'text-blue-100' : 'text-slate-400'}`}>
                  {dev.role}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-slate-50/50 p-4 sm:p-6 md:p-8">
        {selectedDev ? (
          <div className="h-full flex flex-col max-w-5xl mx-auto">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-1 flex items-center">
                  {selectedDev.name}'s Dashboard
                </h2>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <p className="text-sm text-slate-500 font-medium">
                    Track and manage personal project assignments and timelines.
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded border border-emerald-100 text-xs font-bold shadow-sm">
                      <Target className="w-3.5 h-3.5" />
                      Target: {currencySymbol}{(selectedDev.monthlyTarget || 0).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded border border-blue-100 text-xs font-bold shadow-sm">
                      <FileText className="w-3.5 h-3.5" />
                      Assigned: {currencySymbol}{(currentAssignedValue || 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-slate-100 p-1 rounded-lg flex space-x-1 border border-slate-200">
                  <button
                    onClick={() => setViewMode('board')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center transition-all ${viewMode === 'board' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <LayoutTemplate className="w-3.5 h-3.5 mr-1.5" />
                    Task Board
                  </button>
                  <button
                    onClick={() => setViewMode('schedule')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center transition-all ${viewMode === 'schedule' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <CalendarDays className="w-3.5 h-3.5 mr-1.5" />
                    Weekly Schedule
                  </button>
                  <button
                    onClick={() => setViewMode('timesheet')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center transition-all ${viewMode === 'timesheet' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <FileText className="w-3.5 h-3.5 mr-1.5" />
                    Timesheet
                  </button>
                </div>
                <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm flex items-center space-x-2 hidden sm:flex">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Capacity</span>
                  <span className="text-sm font-bold text-slate-800">{selectedDev.maxWeeklyHours} hrs/wk</span>
                </div>
              </div>
            </div>

            {viewMode === 'board' ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
                
                {/* Past Tasks */}
              <div className="flex flex-col">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center bg-slate-100/80 p-2.5 rounded-lg border border-slate-200">
                  <CheckCircle2 className="w-4 h-4 mr-2 text-slate-400" />
                  Previous Tasks
                  <span className="ml-auto bg-white px-2 py-0.5 rounded-full text-slate-400 border border-slate-200">
                    {past.length}
                  </span>
                </h3>
                <div className="flex-1">
                  {past.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 border-dashed p-6 flex flex-col items-center justify-center text-slate-400">
                      <CheckCircle2 className="w-8 h-8 mb-2 opacity-20" />
                      <p className="text-xs font-medium">No previous tasks</p>
                    </div>
                  ) : (
                    past.map(t => renderTaskCard(t, 'past'))
                  )}
                </div>
              </div>

              {/* Current Tasks */}
              <div className="flex flex-col">
                <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-3 flex items-center bg-blue-50 p-2.5 rounded-lg border border-blue-100">
                  <Clock className="w-4 h-4 mr-2 text-blue-500" />
                  Active Tasks
                  <span className="ml-auto bg-white px-2 py-0.5 rounded-full text-blue-600 border border-blue-200">
                    {current.length}
                  </span>
                </h3>
                <div className="flex-1">
                  {current.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 border-dashed p-6 flex flex-col items-center justify-center text-slate-400">
                      <Clock className="w-8 h-8 mb-2 opacity-20" />
                      <p className="text-xs font-medium">No active tasks</p>
                    </div>
                  ) : (
                    current.map(t => renderTaskCard(t, 'current'))
                  )}
                </div>
              </div>

              {/* Future Tasks */}
              <div className="flex flex-col">
                <h3 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-3 flex items-center bg-amber-50 p-2.5 rounded-lg border border-amber-100">
                  <Calendar className="w-4 h-4 mr-2 text-amber-500" />
                  Future Planning
                  <span className="ml-auto bg-white px-2 py-0.5 rounded-full text-amber-600 border border-amber-200">
                    {future.length}
                  </span>
                </h3>
                <div className="flex-1">
                  {future.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 border-dashed p-6 flex flex-col items-center justify-center text-slate-400">
                      <Calendar className="w-8 h-8 mb-2 opacity-20" />
                      <p className="text-xs font-medium">No future tasks</p>
                    </div>
                  ) : (
                    future.map(t => renderTaskCard(t, 'future'))
                  )}
                </div>
              </div>

            </div>
            ) : viewMode === 'schedule' ? (
              <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center">
                    <CalendarDays className="w-4 h-4 mr-2 text-blue-600" />
                    Monthly Schedule Plan
                  </h3>
                  <input 
                    type="month" 
                    value={scheduleMonth} 
                    onChange={(e) => setScheduleMonth(e.target.value)} 
                    className="text-sm font-medium border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-blue-400 text-slate-700 shadow-sm"
                  />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead>
                       <tr>
                         <th className="border-b border-slate-200 p-3 text-slate-500 font-bold bg-slate-50/50 rounded-tl-lg">Project / Role</th>
                         {weeks.map(w => <th key={w.label} className="border-b border-slate-200 p-3 text-center text-slate-500 font-bold bg-slate-50/50 whitespace-nowrap">{w.label}</th>)}
                       </tr>
                    </thead>
                    <tbody>
                      {monthAssignments.length === 0 ? (
                        <tr>
                          <td colSpan={weeks.length + 1} className="text-center p-8 text-slate-400 font-medium">
                            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-20" />
                            No assignments for this month
                          </td>
                        </tr>
                      ) : (
                        monthAssignments.map(assign => (
                          <tr key={assign.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="border-b border-slate-100 p-3">
                               <div className="font-bold text-slate-800">{assign.projectName}</div>
                               <div className="text-xs text-slate-500 mt-0.5 flex items-center">
                                  <Briefcase className="w-3 h-3 mr-1 opacity-70" />
                                  {assign.roleInProject} • {assign.allocationPercentage}%
                               </div>
                               {(assign.taskDescription || (assign as any).task_description) && (
                                 <div className="text-[11px] text-slate-600 mt-1.5 bg-slate-50 rounded px-2 py-0.5 border border-slate-200/80 leading-snug">
                                   <span className="font-semibold text-slate-700">Task:</span> {assign.taskDescription || (assign as any).task_description}
                                 </div>
                               )}
                            </td>
                            {weeks.map(w => {
                               const isOverlapping = assign.startDate <= w.end && assign.endDate >= w.start;
                               return (
                                 <td key={w.label} className="border-b border-slate-100 p-3 text-center border-l border-slate-100/50">
                                    {isOverlapping ? (
                                      assign.projectId === 'LEAVE' ? (
                                        <div className="bg-emerald-100 text-emerald-700 rounded-md py-1.5 px-2 text-xs font-bold border border-emerald-200 inline-block w-full shadow-sm">
                                          Leave
                                        </div>
                                      ) : (
                                        <div className="bg-blue-100 text-blue-700 rounded-md py-1.5 px-2 text-xs font-bold border border-blue-200 inline-block w-full shadow-sm">
                                          Active
                                        </div>
                                      )
                                    ) : (
                                      <div className="text-slate-200">-</div>
                                    )}
                                 </td>
                               )
                            })}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-blue-600" />
                    Weekly Timesheet
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-400">Week of:</span>
                    <input 
                      type="date" 
                      value={timesheetWeekStart} 
                      onChange={(e) => setTimesheetWeekStart(e.target.value)} 
                      className="text-sm font-medium border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-blue-400 text-slate-700 shadow-sm"
                    />
                  </div>
                </div>
                
                <div className="flex-1 overflow-x-auto mb-4">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead>
                       <tr>
                         <th className="border-b border-slate-200 p-3 text-slate-500 font-bold bg-slate-50/50 rounded-tl-lg sticky left-0 z-10 w-64 bg-slate-50/90 backdrop-blur">Project / Assignment</th>
                         {timesheetDays.map(d => (
                           <th key={d.dateStr} className="border-b border-slate-200 p-3 text-center text-slate-500 font-bold bg-slate-50/50 min-w-[80px]">
                             <div className="text-xs uppercase">{d.dayName}</div>
                             <div className="text-slate-800 text-lg mt-0.5">{d.dayNum}</div>
                           </th>
                         ))}
                       </tr>
                    </thead>
                    <tbody>
                      {timesheetAssignments.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center p-8 text-slate-400 font-medium">
                            <FileText className="w-8 h-8 mx-auto mb-2 opacity-20" />
                            No assignments for this week.
                          </td>
                        </tr>
                      ) : (
                        timesheetAssignments.map(assign => (
                          <tr key={assign.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="border-b border-slate-100 p-3 bg-white sticky left-0 z-10 shadow-[1px_0_0_rgba(0,0,0,0.05)]">
                               <div className="font-bold text-slate-800 truncate">{assign.projectName}</div>
                               <div className="text-xs text-slate-500 mt-0.5 flex items-center">
                                  <Briefcase className="w-3 h-3 mr-1 opacity-70" />
                                  {assign.roleInProject}
                               </div>
                               {(assign.taskDescription || (assign as any).task_description) && (
                                 <div className="text-[10px] text-slate-500 mt-1 truncate max-w-[220px]" title={assign.taskDescription || (assign as any).task_description}>
                                   <span className="font-semibold text-slate-600">Task:</span> {assign.taskDescription || (assign as any).task_description}
                                 </div>
                               )}
                            </td>
                            {timesheetDays.map(d => (
                              <td key={d.dateStr} className="border-b border-slate-100 p-2 text-center border-l border-slate-100/50">
                                <input
                                  type="number"
                                  min="0"
                                  max="24"
                                  step="0.5"
                                  value={timesheetHours[assign.id]?.[d.dateStr] || ''}
                                  onChange={(e) => handleTimesheetChange(assign.id, d.dateStr, e.target.value)}
                                  className="w-16 text-center border border-slate-200 rounded-md py-1.5 text-sm font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                  placeholder="0"
                                />
                              </td>
                            ))}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button
                    onClick={handleSubmitTimesheet}
                    disabled={submittingTimesheet || timesheetAssignments.length === 0}
                    className={`flex items-center px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${timesheetSuccess ? 'bg-emerald-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed'}`}
                  >
                    {timesheetSuccess ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Timesheet Submitted
                      </>
                    ) : submittingTimesheet ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Submit Timesheet
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400">
            Select a developer to view their dashboard.
          </div>
        )}
      </div>
    </div>
  </div>
  );
};
