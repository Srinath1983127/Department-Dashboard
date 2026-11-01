import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Users, Briefcase, Calendar, Percent, Plus, Trash2, Shield, Activity, TrendingUp, Filter, Edit2, Check, X, FileDown, ChevronLeft, ChevronRight, Search, ChevronDown } from 'lucide-react';
import { Project, Developer, ProjectAssignment } from '../types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface SearchableOption {
  id: string;
  name: string;
  subText?: string;
  badge?: string;
}

interface SearchableSelectProps {
  label: string;
  placeholder: string;
  searchPlaceholder: string;
  options: SearchableOption[];
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  required?: boolean;
  hasError?: boolean;
  errorMessage?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  placeholder,
  searchPlaceholder,
  options,
  value,
  onChange,
  icon,
  required,
  hasError,
  errorMessage
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close when clicked outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearch('');
    }
  }, [isOpen]);

  const selectedOption = useMemo(() => {
    return options.find((o) => o.id === value);
  }, [options, value]);

  const filteredOptions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        (o.subText && o.subText.toLowerCase().includes(q)) ||
        (o.badge && o.badge.toLowerCase().includes(q))
    );
  }, [options, search]);

  const handleSelect = (id: string) => {
    onChange(id);
    setIsOpen(false);
    setSearch('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearch('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter' && isOpen && filteredOptions.length > 0) {
      e.preventDefault();
      handleSelect(filteredOptions[0].id);
    }
  };

  return (
    <div className="relative" ref={containerRef} onKeyDown={handleKeyDown}>
      <div className="flex items-center justify-between mb-1">
        <label className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="text-[9px] text-slate-400 hover:text-rose-600 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full text-xs p-2 text-left bg-white border rounded transition-all flex items-center justify-between shadow-2xs outline-none cursor-pointer ${
          hasError && !value
            ? 'border-rose-400 ring-1 ring-rose-400 bg-rose-50/20'
            : isOpen
            ? 'border-indigo-500 ring-1 ring-indigo-500'
            : 'border-slate-300 hover:border-slate-400'
        }`}
      >
        <div className="flex items-center min-w-0 pr-2 gap-2">
          {icon && <span className="text-slate-400 flex-shrink-0">{icon}</span>}
          {selectedOption ? (
            <div className="truncate flex items-center gap-1.5">
              <span className="font-semibold text-slate-800 truncate">{selectedOption.name}</span>
              {selectedOption.subText && (
                <span className="text-[10px] text-slate-500 font-normal truncate">
                  ({selectedOption.subText})
                </span>
              )}
            </div>
          ) : (
            <span className="text-slate-400 truncate">{placeholder}</span>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {value && (
            <span
              onClick={handleClear}
              className="p-0.5 text-slate-400 hover:text-rose-500 rounded hover:bg-slate-100 transition-colors cursor-pointer"
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-indigo-500' : ''
            }`}
          />
        </div>
      </button>

      {hasError && !value && errorMessage && (
        <span className="text-[10px] text-rose-500 mt-1 block font-medium">
          {errorMessage}
        </span>
      )}

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 p-2 space-y-1.5 animate-in fade-in-50 duration-100">
          {/* Search Box */}
          <div className="relative flex items-center border border-slate-200 rounded-md bg-slate-50 px-2 py-1.5 focus-within:bg-white focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
            <Search className="w-3.5 h-3.5 text-indigo-500 mr-1.5 flex-shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full text-xs bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 font-medium">
            <span>
              {filteredOptions.length === options.length
                ? `${options.length} options`
                : `${filteredOptions.length} of ${options.length} matching`}
            </span>
            {search && filteredOptions.length > 0 && (
              <span className="text-indigo-600 font-semibold">Press Enter to select</span>
            )}
          </div>

          {/* Options List */}
          <div className="max-h-52 overflow-y-auto space-y-0.5 pr-0.5">
            {filteredOptions.length === 0 ? (
              <div className="py-5 text-center text-xs text-slate-400">
                <Search className="w-4 h-4 mx-auto mb-1 text-slate-300" />
                <p>No matches for &ldquo;{search}&rdquo;</p>
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.id === value;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelect(opt.id)}
                    className={`w-full text-left p-2 rounded-md transition-colors flex items-center justify-between group cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 text-indigo-900'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs truncate flex items-center gap-1.5">
                        <span
                          className={
                            isSelected
                              ? 'text-indigo-700 font-bold'
                              : 'font-medium text-slate-800'
                          }
                        >
                          {opt.name}
                        </span>
                        {opt.badge && (
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                              isSelected
                                ? 'bg-indigo-200/70 text-indigo-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      {opt.subText && (
                        <div className="text-[10px] text-slate-400 group-hover:text-slate-500 truncate mt-0.5">
                          {opt.subText}
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface DeveloperAssignmentGridProps {
  projects: Project[];
  developers: Developer[];
  assignments: ProjectAssignment[];
  onAddDeveloper: (dev: Omit<Developer, 'id'>) => void;
  onAddAssignment: (assignment: Omit<ProjectAssignment, 'id'>) => void;
  onUpdateAssignment: (assignment: ProjectAssignment) => void;
  onUpdateDeveloper?: (dev: Developer) => void;
  onDeleteAssignment: (id: string) => void;
  onDeleteDeveloper: (id: string) => void;
  currencySymbol?: string;
}

const DeveloperAssignmentGrid: React.FC<DeveloperAssignmentGridProps> = ({
  projects,
  developers,
  assignments,
  onAddDeveloper,
  onAddAssignment,
  onUpdateAssignment,
  onUpdateDeveloper,
  onDeleteAssignment,
  onDeleteDeveloper,
  currencySymbol = '$'
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  // New Developer Form State
  const [newDevName, setNewDevName] = useState('');
  const [newDevRole, setNewDevRole] = useState('Software Engineer');
  const [newDevHours, setNewDevHours] = useState(40);
  const [newDevTarget, setNewDevTarget] = useState<number>(0);

  // New Assignment Form State
  const [assignDevId, setAssignDevId] = useState('');
  const [assignProjId, setAssignProjId] = useState('');
  const [assignStart, setAssignStart] = useState('');
  const [assignEnd, setAssignEnd] = useState('');
  const [assignAlloc, setAssignAlloc] = useState(100);
  const [assignRole, setAssignRole] = useState('Developer');
  const [assignValue, setAssignValue] = useState<number>(0);
  const [assignTaskDesc, setAssignTaskDesc] = useState('');
  const [assignInvoiceType, setAssignInvoiceType] = useState('');

  const getCurrentMonthStr = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const currentMonthStr = useMemo(() => getCurrentMonthStr(), []);

  // Assignment List Filter State - Default to current month
  const [filterDevId, setFilterDevId] = useState<string>('');
  const [filterMonth, setFilterMonth] = useState<string>(() => getCurrentMonthStr());

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Editing State
  const [editingAssignId, setEditingAssignId] = useState<string | null>(null);
  const [editAssignForm, setEditAssignForm] = useState<Partial<ProjectAssignment>>({});
  const [editDevTarget, setEditDevTarget] = useState<number>(0);

  const startEditing = (assign: ProjectAssignment) => {
    setEditingAssignId(assign.id);
    setEditAssignForm(assign);
    const dev = developers.find(d => d.id === assign.developerId);
    setEditDevTarget(dev?.monthlyTarget || 0);
  };

  const cancelEditing = () => {
    setEditingAssignId(null);
    setEditAssignForm({});
    setEditDevTarget(0);
  };

  const saveEditing = () => {
    if (editingAssignId && editAssignForm.developerId && editAssignForm.projectId && editAssignForm.startDate && editAssignForm.endDate) {
      onUpdateAssignment(editAssignForm as ProjectAssignment);
      
      if (onUpdateDeveloper) {
        const dev = developers.find(d => d.id === editAssignForm.developerId);
        if (dev) {
          onUpdateDeveloper({ ...dev, monthlyTarget: editDevTarget });
        }
      }

      setEditingAssignId(null);
      setEditAssignForm({});
      setEditDevTarget(0);
    }
  };

  // Calculate Developer Utilization (Active & Upcoming Assignments)
  const utilization = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // Simple YYYY-MM-DD
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const currentMonthStart = `${year}-${month}-01`;
    const daysInMonth = new Date(year, now.getMonth() + 1, 0).getDate();
    const currentMonthEnd = `${year}-${month}-${daysInMonth}`;
    
    return developers.map(dev => {
      const devAssignments = assignments.filter(a => a.developerId === dev.id);
      
      // Find peak concurrent allocation from today onwards
      let maxAlloc = 0;
      
      // 1. Check load exactly for today
      let loadToday = 0;
      let assignedValueCurrentMonth = 0;
      let isOnLeaveToday = false;
      devAssignments.forEach(a => {
        if (today >= a.startDate && today <= a.endDate) {
          if (a.projectId === 'LEAVE') {
            isOnLeaveToday = true;
          } else {
            loadToday += a.allocationPercentage;
          }
        }
        
        if (a.projectId !== 'LEAVE' && a.startDate <= currentMonthEnd && a.endDate >= currentMonthStart) {
          assignedValueCurrentMonth += (a.projectValue || 0);
        }
      });
      maxAlloc = Math.max(maxAlloc, loadToday);

      // 2. Check load at the start of any assignment (to catch overlapping future peaks)
      devAssignments.forEach(a1 => {
        if (a1.endDate >= today) {
          let loadAtStart = 0;
          devAssignments.forEach(a2 => {
            // If a2 is active on the start date of a1
            if (a1.startDate >= a2.startDate && a1.startDate <= a2.endDate) {
              loadAtStart += a2.allocationPercentage;
            }
          });
          maxAlloc = Math.max(maxAlloc, loadAtStart);
        }
      });

      const currentAlloc = maxAlloc;

      // Calculate booked date range for active/future assignments
      const activeAssignments = devAssignments.filter(a => a.endDate >= today);
      let bookedStartDate = null;
      let bookedEndDate = null;
      
      if (activeAssignments.length > 0) {
        bookedStartDate = activeAssignments.reduce((min, a) => a.startDate < min ? a.startDate : min, activeAssignments[0].startDate);
        bookedEndDate = activeAssignments.reduce((max, a) => a.endDate > max ? a.endDate : max, activeAssignments[0].endDate);
      }

      return {
        ...dev,
        assignments: devAssignments,
        currentAllocation: currentAlloc,
        currentAssignedValue: assignedValueCurrentMonth,
        bookedStartDate,
        bookedEndDate,
        status: isOnLeaveToday ? 'On Leave' : (currentAlloc > 100 ? 'Overbooked' : currentAlloc === 100 ? 'Fully Booked' : 'Available')
      };
    });
  }, [developers, assignments]);

  const filteredAssignments = useMemo(() => {
    return assignments.filter(a => {
      // Filter by developer
      if (filterDevId && a.developerId !== filterDevId) return false;
      
      // Filter by month (if a.startDate or a.endDate falls in that month)
      if (filterMonth) {
        const [yearStr, monthStr] = filterMonth.split('-');
        const year = parseInt(yearStr, 10);
        const month = parseInt(monthStr, 10);
        
        const filterStart = `${filterMonth}-01`;
        const daysInMonth = new Date(year, month, 0).getDate();
        const filterEnd = `${filterMonth}-${daysInMonth}`;
        
        // Check for overlap: assignStart <= filterEnd AND assignEnd >= filterStart
        if (!(a.startDate <= filterEnd && a.endDate >= filterStart)) {
          return false;
        }
      }
      
      return true;
    }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [assignments, filterDevId, filterMonth]);

  const totalValue = useMemo(() => {
    return filteredAssignments.reduce((sum, assign) => sum + (assign.projectValue || 0), 0);
  }, [filteredAssignments]);

  // Reset to first page if filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterDevId, filterMonth]);

  const totalPages = Math.max(1, Math.ceil(filteredAssignments.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  // Keep currentPage in sync if assignments change
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedAssignments = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return filteredAssignments.slice(startIndex, startIndex + pageSize);
  }, [filteredAssignments, safeCurrentPage, pageSize]);

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.setTextColor(30, 41, 59); // text-slate-800
    doc.text('Developer Assignment Grid', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // text-slate-500
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 26);
    
    if (filterDevId || filterMonth) {
      let filterText = 'Filters applied: ';
      if (filterDevId) {
        const devName = developers.find(d => d.id === filterDevId)?.name || 'Unknown';
        filterText += `Developer: ${devName}   `;
      }
      if (filterMonth) {
        filterText += `Month: ${filterMonth}`;
      }
      doc.text(filterText, 14, 32);
    }
    
    const tableColumn = ["Developer", "Project & Role", "Timeline", "Allocation", "Value"];
    const tableRows: any[] = [];
    
    filteredAssignments.forEach(assign => {
      const dev = developers.find(d => d.id === assign.developerId);
      const proj = projects.find(p => p.id === assign.projectId);
      const projectName = assign.projectId === 'LEAVE' ? 'Leave / Time Off' : (proj?.name || 'Unknown');
      const devName = dev?.name || 'Unknown';
      let roleAndProject = assign.taskDescription 
        ? `${projectName} (${assign.roleInProject})\nTask: ${assign.taskDescription}`
        : `${projectName} (${assign.roleInProject})`;
      if (assign.invoiceType) {
        roleAndProject += `\nInvoice: ${assign.invoiceType}`;
      }
      const timeline = `${assign.startDate} to ${assign.endDate}`;
      const allocation = `${assign.allocationPercentage}%`;
      const value = assign.projectValue ? `${currencySymbol}${assign.projectValue.toLocaleString()}` : '-';
      
      tableRows.push([
        devName,
        roleAndProject,
        timeline,
        allocation,
        value
      ]);
    });
    
    // Add total row
    tableRows.push([
      "Total Monthly Sum",
      "",
      "",
      "",
      `${currencySymbol}${totalValue.toLocaleString()}`
    ]);
    
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: filterDevId || filterMonth ? 38 : 32,
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] }, // bg-indigo-600
      footStyles: { fillColor: [241, 245, 249], textColor: [30, 41, 59], fontStyle: 'bold' },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 50 },
        2: { cellWidth: 45 },
        3: { cellWidth: 25, halign: 'center' },
        4: { cellWidth: 30, halign: 'right' }
      }
    });
    
    try {
      doc.save(`Assignments_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.warn("Standard PDF save failed, trying Blob URL in new window:", err);
      try {
        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      } catch (fallbackErr) {
        console.error("Fallback open failed:", fallbackErr);
      }
    }
  };

  const handleAddDev = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDevName.trim()) return;
    onAddDeveloper({
      name: newDevName,
      role: newDevRole,
      maxWeeklyHours: newDevHours,
      monthlyTarget: newDevTarget
    });
    setNewDevName('');
    setNewDevTarget(0);
  };

  const [assignmentSubmitted, setAssignmentSubmitted] = useState(false);

  const devOptions: SearchableOption[] = useMemo(() => {
    return developers.map((d) => ({
      id: d.id,
      name: d.name,
      subText: d.role,
      badge: d.monthlyTarget ? `${currencySymbol}${d.monthlyTarget.toLocaleString()}/mo` : undefined
    }));
  }, [developers, currencySymbol]);

  const projectOptions: SearchableOption[] = useMemo(() => {
    const list: SearchableOption[] = projects.map((p) => ({
      id: p.id,
      name: p.name,
      subText: p.client ? `Client: ${p.client}` : 'Project',
      badge: p.status || undefined
    }));
    list.push({
      id: 'LEAVE',
      name: '🌴 Leave / Time Off',
      subText: 'Vacation, Sick Leave, or Personal Time',
      badge: 'Leave'
    });
    return list;
  }, [projects]);

  const handleDevSelect = (devId: string) => {
    setAssignDevId(devId);
    const found = developers.find((d) => d.id === devId);
    if (found && (assignRole === 'Developer' || !assignRole)) {
      setAssignRole(found.role);
    }
  };

  const handleProjSelect = (projId: string) => {
    setAssignProjId(projId);
    if (projId === 'LEAVE') {
      setAssignRole('On Leave');
      setAssignValue(0);
    } else if (assignRole === 'On Leave') {
      const foundDev = developers.find((d) => d.id === assignDevId);
      setAssignRole(foundDev ? foundDev.role : 'Developer');
    }
  };

  const handleAddAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    setAssignmentSubmitted(true);
    if (!assignDevId || !assignProjId || !assignStart || !assignEnd) return;
    onAddAssignment({
      developerId: assignDevId,
      projectId: assignProjId,
      startDate: assignStart,
      endDate: assignEnd,
      allocationPercentage: assignAlloc,
      roleInProject: assignRole,
      projectValue: assignValue,
      taskDescription: assignTaskDesc,
      invoiceType: assignInvoiceType
    });
    // Reset form mostly, keep dev id for quick sequential adds
    setAssignProjId('');
    setAssignStart('');
    setAssignEnd('');
    setAssignAlloc(100);
    setAssignValue(0);
    setAssignRole('Developer');
    setAssignTaskDesc('');
    setAssignInvoiceType('');
    setAssignmentSubmitted(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden mb-6 mt-6">
      <div 
        className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">Resource Allocation & Assignments</h2>
            <p className="text-xs text-slate-500 font-medium">Manage developer capacity, project assignments, and timelines</p>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-5 space-y-6 bg-white">
          
          {/* Top Section: Developer Utilization Overview */}
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center">
              <Activity className="w-4 h-4 mr-2 text-slate-400" />
              Developer Capacity Matrix
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {utilization.map(dev => (
                <div key={dev.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50 flex flex-col relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-1 h-full ${
                    dev.currentAllocation > 100 ? 'bg-rose-500' : 
                    dev.currentAllocation >= 80 ? 'bg-emerald-500' : 
                    'bg-amber-400'
                  }`} />
                  
                  <div className="flex justify-between items-start mb-2 pl-2">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{dev.name}</h4>
                      <p className="text-[10px] text-slate-500 font-medium">{dev.role}</p>
                      {dev.bookedStartDate && dev.bookedEndDate ? (
                        <p className="text-[9px] text-slate-500 mt-1 flex items-center bg-slate-200/50 w-fit px-1.5 py-0.5 rounded">
                          <Calendar className="w-2.5 h-2.5 mr-1 text-slate-400" />
                          {dev.bookedStartDate} to {dev.bookedEndDate}
                        </p>
                      ) : (
                        <p className="text-[9px] text-slate-400 mt-1 flex items-center bg-slate-100 w-fit px-1.5 py-0.5 rounded">
                          <Calendar className="w-2.5 h-2.5 mr-1 text-slate-400" />
                          No active bookings
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        dev.status === 'On Leave' ? 'bg-emerald-200 text-emerald-800' :
                        dev.status === 'Overbooked' ? 'bg-rose-100 text-rose-700' :
                        dev.status === 'Fully Booked' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {dev.status}
                      </span>
                      <button
                        onClick={() => onDeleteDeveloper(dev.id)}
                        className="text-slate-400 hover:text-rose-500 p-0.5 transition-colors"
                        title="Remove Developer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="pl-2 mt-2 border-t border-slate-100 pt-2 mb-2">
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-600 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> Target</span>
                      <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        {currencySymbol}{(dev.monthlyTarget || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold mb-1 mt-2">
                      <span className="text-slate-600 flex items-center gap-1"><Activity className="w-3 h-3"/> Assigned Value</span>
                      <span className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                        {currencySymbol}{(dev.currentAssignedValue || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="pl-2 mt-2">
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-600">Peak Load</span>
                      <span className={dev.currentAllocation > 100 ? 'text-rose-600' : 'text-slate-800'}>
                        {dev.currentAllocation}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${
                          dev.currentAllocation > 100 ? 'bg-rose-500' : 
                          dev.currentAllocation >= 80 ? 'bg-emerald-500' : 
                          'bg-amber-400'
                        }`}
                        style={{ width: `${Math.min(dev.currentAllocation, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-slate-100" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Forms */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Add Developer Form */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Add Developer</h3>
                <form onSubmit={handleAddDev} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Name</label>
                    <input 
                      type="text" required
                      value={newDevName} onChange={e => setNewDevName(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                      placeholder="e.g. Ruwan Silva"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">Role</label>
                      <input 
                        type="text" required
                        value={newDevRole} onChange={e => setNewDevRole(e.target.value)}
                        className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">Max Hrs/Wk</label>
                      <input 
                        type="number" required min="1" max="80"
                        value={newDevHours} onChange={e => setNewDevHours(parseInt(e.target.value) || 40)}
                        className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Monthly Target</label>
                    <input 
                      type="number" required min="0" step="100"
                      value={newDevTarget} onChange={e => setNewDevTarget(parseInt(e.target.value) || 0)}
                      className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                      placeholder="e.g. 100000"
                    />
                  </div>
                  <button type="submit" className="w-full py-2 bg-white border border-indigo-200 text-indigo-700 rounded text-xs font-bold hover:bg-indigo-50 transition-colors flex items-center justify-center">
                    <Plus className="w-3 h-3 mr-1" /> Add Resource
                  </button>
                </form>
              </div>

              {/* Add Assignment Form */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">New Assignment</h3>
                <form onSubmit={handleAddAssignment} className="space-y-3">
                  <SearchableSelect
                    label="Developer"
                    placeholder="Search & select developer..."
                    searchPlaceholder="Search developer by name, role..."
                    options={devOptions}
                    value={assignDevId}
                    onChange={handleDevSelect}
                    icon={<Users className="w-3.5 h-3.5" />}
                    required
                    hasError={assignmentSubmitted && !assignDevId}
                    errorMessage="Please select a developer"
                  />

                  <SearchableSelect
                    label="Project"
                    placeholder="Search & select project..."
                    searchPlaceholder="Search project name, client, leave..."
                    options={projectOptions}
                    value={assignProjId}
                    onChange={handleProjSelect}
                    icon={<Briefcase className="w-3.5 h-3.5" />}
                    required
                    hasError={assignmentSubmitted && !assignProjId}
                    errorMessage="Please select a project"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">Start Date</label>
                      <input 
                        type="date" required
                        value={assignStart} onChange={e => setAssignStart(e.target.value)}
                        className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">End Date</label>
                      <input 
                        type="date" required
                        value={assignEnd} onChange={e => setAssignEnd(e.target.value)}
                        className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">Allocation %</label>
                      <input 
                        type="number" required min="1" max="100"
                        value={assignAlloc} onChange={e => setAssignAlloc(parseInt(e.target.value) || 100)}
                        className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">Project Role</label>
                      <input 
                        type="text" required
                        value={assignRole} onChange={e => setAssignRole(e.target.value)}
                        className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">Project Value (Optional)</label>
                      <input 
                        type="number" min="0" step="100"
                        value={assignValue} onChange={e => setAssignValue(parseInt(e.target.value) || 0)}
                        className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                        placeholder="e.g. 50000"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">Invoice Type (Optional)</label>
                      <input 
                        type="text"
                        list="invoice-types-datalist"
                        value={assignInvoiceType} onChange={e => setAssignInvoiceType(e.target.value)}
                        className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                        placeholder="e.g. Monthly Retainer, T&M..."
                      />
                      <datalist id="invoice-types-datalist">
                        <option value="Time & Material (T&M)" />
                        <option value="Monthly Retainer" />
                        <option value="Fixed Price" />
                        <option value="Milestone Based" />
                        <option value="Hourly Rate" />
                        <option value="Non-Billable" />
                      </datalist>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Task Description / Scope (Optional)</label>
                    <textarea 
                      rows={2}
                      value={assignTaskDesc} onChange={e => setAssignTaskDesc(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
                      placeholder="e.g. Implement auth flow, API refactoring, bug fixes..."
                    />
                  </div>
                  <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded text-xs font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center">
                    <TrendingUp className="w-3 h-3 mr-1" /> Assign to Project
                  </button>
                </form>
              </div>

            </div>

            {/* Right Column: Assignments List */}
            <div className="lg:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center">
                    <Briefcase className="w-4 h-4 mr-2 text-slate-400" />
                    Active & Upcoming Assignments
                  </h3>
                  {filterMonth && (
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                      {filterMonth === currentMonthStr ? 'Current Month' : filterMonth}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative">
                    <Filter className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                    <select
                      value={filterDevId}
                      onChange={e => setFilterDevId(e.target.value)}
                      className="pl-7 pr-2 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-600 font-medium"
                    >
                      <option value="">All Developers</option>
                      {developers.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="month"
                    value={filterMonth}
                    onChange={e => setFilterMonth(e.target.value)}
                    className="px-2 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-600 font-medium cursor-pointer"
                    placeholder="Filter Month"
                    title="Filter Assignments by Month (Defaults to Current Month)"
                  />
                  {filterMonth !== currentMonthStr && (
                    <button
                      type="button"
                      onClick={() => setFilterMonth(currentMonthStr)}
                      className="text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2 py-1 rounded font-medium transition-colors cursor-pointer"
                      title="Reset to current month"
                    >
                      Current Month
                    </button>
                  )}
                  {(filterDevId || filterMonth) && (
                    <button
                      type="button"
                      onClick={() => { setFilterDevId(''); setFilterMonth(''); }}
                      className="text-[10px] text-slate-500 hover:text-slate-700 font-medium underline cursor-pointer"
                      title="Show all assignments without filters"
                    >
                      Show All
                    </button>
                  )}
                  <div className="flex flex-col items-end">
                    <button
                      onClick={downloadPDF}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
                      title="Download Assignments PDF"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </button>
                    <span className="text-[9px] text-slate-400 mt-1 max-w-[220px] text-right leading-tight">
                      * If blocked by preview window, please click <strong className="text-indigo-600">"Open App in New Tab"</strong> at top-right to download.
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">Developer</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">Project & Details</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">Timeline</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase text-center">Alloc.</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase text-center">Value</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredAssignments.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-slate-500 text-xs">
                            No assignments found matching the selected filters.
                          </td>
                        </tr>
                      ) : (
                        <>
                          {paginatedAssignments.map(assign => {
                          const dev = developers.find(d => d.id === assign.developerId);
                          const proj = projects.find(p => p.id === assign.projectId);
                          const projectName = assign.projectId === 'LEAVE' ? '🌴 Leave / Time Off' : (proj?.name || 'Unknown');
                          
                          if (editingAssignId === assign.id) {
                            return (
                              <tr key={assign.id} className="bg-indigo-50/50">
                                <td className="px-4 py-3 align-top">
                                  <div className="text-xs font-bold text-slate-800">{dev?.name || 'Unknown'}</div>
                                  <div className="flex items-center mt-1 space-x-1">
                                    <span className="text-[10px] text-slate-500">Target:</span>
                                    <input
                                      type="number"
                                      value={editDevTarget || 0}
                                      onChange={(e) => setEditDevTarget(parseInt(e.target.value) || 0)}
                                      className="text-[10px] w-16 px-1.5 py-0.5 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                                      placeholder="Target"
                                    />
                                  </div>
                                </td>
                                <td className="px-4 py-3 align-top">
                                  <div className={`text-xs font-bold ${assign.projectId === 'LEAVE' ? 'text-emerald-600' : 'text-slate-800'}`}>{projectName}</div>
                                  <input
                                    type="text"
                                    value={editAssignForm.roleInProject || ''}
                                    onChange={(e) => setEditAssignForm({ ...editAssignForm, roleInProject: e.target.value })}
                                    className="text-[10px] w-full mt-1 px-2 py-1 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                                    placeholder="Role (e.g. Lead, Developer)"
                                  />
                                  <input
                                    type="text"
                                    list="invoice-types-datalist"
                                    value={editAssignForm.invoiceType || ''}
                                    onChange={(e) => setEditAssignForm({ ...editAssignForm, invoiceType: e.target.value })}
                                    className="text-[10px] w-full mt-1 px-2 py-1 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                                    placeholder="Invoice Type (e.g. T&M, Monthly Retainer...)"
                                  />
                                  <input
                                    type="text"
                                    value={editAssignForm.taskDescription || ''}
                                    onChange={(e) => setEditAssignForm({ ...editAssignForm, taskDescription: e.target.value })}
                                    className="text-[10px] w-full mt-1 px-2 py-1 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                                    placeholder="Task Description"
                                  />
                                </td>
                                <td className="px-4 py-3 align-top">
                                  <div className="flex flex-col space-y-1">
                                    <input
                                      type="date"
                                      value={editAssignForm.startDate || ''}
                                      onChange={(e) => setEditAssignForm({ ...editAssignForm, startDate: e.target.value })}
                                      className="text-[10px] px-2 py-1 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                                    />
                                    <input
                                      type="date"
                                      value={editAssignForm.endDate || ''}
                                      onChange={(e) => setEditAssignForm({ ...editAssignForm, endDate: e.target.value })}
                                      className="text-[10px] px-2 py-1 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                                    />
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-center align-top">
                                  <input
                                    type="number"
                                    min="1" max="100"
                                    value={editAssignForm.allocationPercentage || 0}
                                    onChange={(e) => setEditAssignForm({ ...editAssignForm, allocationPercentage: parseInt(e.target.value) || 0 })}
                                    className="text-[10px] w-14 px-2 py-1 text-center border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                                  />
                                </td>
                                <td className="px-4 py-3 text-center align-top">
                                  <input
                                    type="number"
                                    value={editAssignForm.projectValue || 0}
                                    onChange={(e) => setEditAssignForm({ ...editAssignForm, projectValue: parseInt(e.target.value) || 0 })}
                                    className="text-[10px] w-16 px-2 py-1 text-center border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                                    placeholder="Value"
                                  />
                                </td>
                                <td className="px-4 py-3 text-center align-top">
                                  <div className="flex items-center justify-center space-x-1">
                                    <button
                                      onClick={saveEditing}
                                      className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded transition-colors"
                                      title="Save"
                                    >
                                      <Check className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={cancelEditing}
                                      className="p-1.5 text-slate-400 hover:bg-slate-200 rounded transition-colors"
                                      title="Cancel"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          }

                          return (
                            <tr key={assign.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3 align-top">
                                <div className="text-xs font-bold text-slate-800">{dev?.name || 'Unknown'}</div>
                                <div className="text-[10px] text-slate-500 mt-0.5">Target: {currencySymbol}{dev?.monthlyTarget?.toLocaleString() || 0}</div>
                              </td>
                              <td className="px-4 py-3 align-top min-w-[210px]">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`text-xs font-bold ${assign.projectId === 'LEAVE' ? 'text-emerald-600' : 'text-slate-800'}`}>{projectName}</span>
                                  {assign.invoiceType && (
                                    <span className="text-[9px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-1.5 py-0.5 rounded shadow-2xs">
                                      {assign.invoiceType}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-500 font-medium mt-0.5">{assign.roleInProject}</div>
                                {assign.taskDescription && (
                                  <div className="text-[10px] text-slate-600 mt-1.5 bg-slate-50 rounded px-2 py-1 border border-slate-200/70 leading-relaxed">
                                    <span className="font-semibold text-slate-700">Task:</span> {assign.taskDescription}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3 align-top">
                                <div className="flex items-center text-xs font-medium text-slate-600">
                                  <Calendar className="w-3 h-3 mr-1 text-slate-400" />
                                  {assign.startDate} to {assign.endDate}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center align-top">
                                <span className={`inline-flex items-center justify-center px-2 py-1 rounded-md text-[10px] font-bold ${
                                  assign.allocationPercentage >= 100 ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'
                                }`}>
                                  {assign.allocationPercentage}%
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center align-top">
                                {assign.projectValue ? (
                                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md inline-block">
                                    {currencySymbol}{assign.projectValue.toLocaleString()}
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-400">-</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center align-top">
                                <div className="flex items-center justify-center space-x-1">
                                  <button 
                                    onClick={() => startEditing(assign)}
                                    className="p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 rounded transition-colors"
                                    title="Edit Assignment"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => onDeleteAssignment(assign.id)}
                                    className="p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded transition-colors"
                                    title="Remove Assignment"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        <tr className="bg-slate-50 font-semibold border-t-2 border-slate-200">
                          <td className="px-4 py-3 text-xs font-bold text-slate-700">
                            Total Monthly Sum {filteredAssignments.length > pageSize && (
                              <span className="text-[10px] text-slate-400 font-normal ml-1">
                                (All {filteredAssignments.length} filtered)
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3"></td>
                          <td className="px-4 py-3"></td>
                          <td className="px-4 py-3 text-center"></td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">
                              {currencySymbol}{totalValue.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-4 py-3"></td>
                        </tr>
                      </>)}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {filteredAssignments.length > 0 && (
                  <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
                    <div className="flex flex-wrap items-center gap-3">
                      <span>
                        Showing <strong className="text-slate-800">{Math.min((safeCurrentPage - 1) * pageSize + 1, filteredAssignments.length)}</strong> to{' '}
                        <strong className="text-slate-800">{Math.min(safeCurrentPage * pageSize, filteredAssignments.length)}</strong> of{' '}
                        <strong className="text-slate-800">{filteredAssignments.length}</strong> assignments
                      </span>
                      <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
                        <span className="text-slate-500 text-[11px]">Rows per page:</span>
                        <select
                          value={pageSize}
                          onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setCurrentPage(1);
                          }}
                          className="border border-slate-200 rounded px-2 py-0.5 bg-white text-xs text-slate-700 font-medium focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer"
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                        </select>
                      </div>
                    </div>

                    {totalPages > 1 && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={safeCurrentPage === 1}
                          className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-600 font-medium hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 text-xs cursor-pointer"
                          title="Previous Page"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Prev</span>
                        </button>

                        <div className="flex items-center gap-1 px-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                            if (
                              totalPages <= 7 ||
                              page === 1 ||
                              page === totalPages ||
                              Math.abs(page - safeCurrentPage) <= 1
                            ) {
                              const isActive = page === safeCurrentPage;
                              return (
                                <button
                                  key={page}
                                  onClick={() => setCurrentPage(page)}
                                  className={`w-7 h-7 rounded text-xs font-semibold transition-colors flex items-center justify-center cursor-pointer ${
                                    isActive
                                      ? 'bg-indigo-600 text-white shadow-xs'
                                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                                  }`}
                                >
                                  {page}
                                </button>
                              );
                            }
                            if (
                              (page === 2 && safeCurrentPage > 3) ||
                              (page === totalPages - 1 && safeCurrentPage < totalPages - 2)
                            ) {
                              return (
                                <span key={page} className="px-1 text-slate-400 font-bold">
                                  …
                                </span>
                              );
                            }
                            return null;
                          })}
                        </div>

                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={safeCurrentPage === totalPages}
                          className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-600 font-medium hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 text-xs cursor-pointer"
                          title="Next Page"
                        >
                          <span className="hidden sm:inline">Next</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeveloperAssignmentGrid;
