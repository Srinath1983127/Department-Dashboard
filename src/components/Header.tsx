import React, { useRef, useState } from 'react';
import { 
  Building2, 
  Download, 
  Upload, 
  RotateCcw, 
  Calendar,
  Building,
  Plus,
  Check,
  X,
  RefreshCw,
  CloudLightning
} from 'lucide-react';
import { DepartmentConfig, DepartmentPreset } from '../types';
import { formatCurrency } from '../utils/calculations';

interface HeaderProps {
  config: DepartmentConfig;
  presets: DepartmentPreset[];
  selectedDepartmentName: string;
  selectedFY: string;
  onSelectDepartmentName: (name: string) => void;
  onSelectFY: (fy: string) => void;
  onAddDepartmentName: (name: string) => void;
  onAddFiscalYear: (fy: string) => void;
  onResetData: () => void;
  onExportJSON: () => void;
  onImportJSON: (event: React.ChangeEvent<HTMLInputElement>) => void;
  netProfitLoss: number;
  totalRevenue: number;
  autoSaveStatus?: 'synced' | 'saving' | 'dirty' | 'idle';
}

export const Header: React.FC<HeaderProps> = ({
  config,
  presets,
  selectedDepartmentName,
  selectedFY,
  onSelectDepartmentName,
  onSelectFY,
  onAddDepartmentName,
  onAddFiscalYear,
  onResetData,
  onExportJSON,
  onImportJSON,
  netProfitLoss,
  totalRevenue,
  autoSaveStatus = 'synced'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States for adding inline
  const [isAddingDept, setIsAddingDept] = useState(false);
  const [newDeptInput, setNewDeptInput] = useState('');
  
  const [isAddingFY, setIsAddingFY] = useState(false);
  const [newFYInput, setNewFYInput] = useState('');

  // Extract all unique department names (NOT filtered by Year!)
  const allDepartmentNames = React.useMemo(() => {
    const names = presets.map((p) => p.config.departmentName).filter(Boolean);
    const uniqueNames: string[] = Array.from(new Set(names));
    
    // Ensure the current department name is included
    if (selectedDepartmentName && !uniqueNames.includes(selectedDepartmentName)) {
      uniqueNames.push(selectedDepartmentName);
    }
    
    return uniqueNames.sort((a, b) => {
      const aIsAlpha = a.trim().toLowerCase() === 'software development-alpha team';
      const bIsAlpha = b.trim().toLowerCase() === 'software development-alpha team';
      if (aIsAlpha && !bIsAlpha) return -1;
      if (!aIsAlpha && bIsAlpha) return 1;
      return a.localeCompare(b);
    });
  }, [presets, selectedDepartmentName]);

  // Extract all unique fiscal years
  const allFYs = React.useMemo(() => {
    const years = presets.map((p) => p.config.fiscalYear).filter(Boolean);
    const uniqueYears = Array.from(new Set(years));
    
    const defaults = ['2026', '2026-2027', '2027-2028'];
    defaults.forEach(d => {
      if (!uniqueYears.includes(d)) {
        uniqueYears.push(d);
      }
    });
    
    if (selectedFY && !uniqueYears.includes(selectedFY)) {
      uniqueYears.push(selectedFY);
    }
    
    return uniqueYears.sort();
  }, [presets, selectedFY]);

  const handleSaveNewDept = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newDeptInput.trim();
    if (trimmed) {
      onAddDepartmentName(trimmed);
      setNewDeptInput('');
      setIsAddingDept(false);
    }
  };

  const handleSaveNewFY = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newFYInput.trim();
    if (trimmed) {
      onAddFiscalYear(trimmed);
      setNewFYInput('');
      setIsAddingFY(false);
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Logo & Department Title */}
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-inner font-bold shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2 flex-wrap">
                <h1 className="text-lg font-bold tracking-tight text-slate-100 truncate max-w-[250px] sm:max-w-[400px]">
                  {config.departmentName || 'Department Budgeting'}
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-800 text-blue-400 border border-slate-700 whitespace-nowrap">
                  FY {config.fiscalYear}
                </span>
                
                {/* Autosave badge */}
                {autoSaveStatus === 'saving' && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-950 text-blue-300 border border-blue-800">
                    <RefreshCw className="w-2.5 h-2.5 mr-1 animate-spin" />
                    Auto-saving...
                  </span>
                )}
                {autoSaveStatus === 'synced' && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-950 text-emerald-400 border border-emerald-900">
                    <CloudLightning className="w-2.5 h-2.5 mr-1" />
                    Synced
                  </span>
                )}
                {autoSaveStatus === 'dirty' && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-950 text-amber-400 border border-amber-900 animate-pulse">
                    Changes saving...
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 flex items-center space-x-2 mt-0.5">
                <span>Yearly Budget: <strong className="text-slate-200">{formatCurrency(config.yearlyBudget, config.currencySymbol)}</strong></span>
                <span className="text-slate-600">•</span>
                <span className={`font-medium ${netProfitLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  P&L: {netProfitLoss >= 0 ? '+' : ''}{formatCurrency(netProfitLoss, config.currencySymbol)}
                </span>
              </p>
            </div>
          </div>

          {/* Independent Dropdowns & Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* 1. FINANCIAL YEAR SELECTOR & ADDER */}
            <div className="flex items-center space-x-1.5 bg-slate-800/60 p-1 rounded-lg border border-slate-700/80">
              {isAddingFY ? (
                <form onSubmit={handleSaveNewFY} className="flex items-center space-x-1">
                  <input
                    type="text"
                    value={newFYInput}
                    onChange={(e) => setNewFYInput(e.target.value)}
                    placeholder="New FY (e.g. 2028)"
                    className="px-2 py-1 text-xs font-medium rounded bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 w-36"
                    autoFocus
                  />
                  <button type="submit" className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer" title="Save Year">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => { setIsAddingFY(false); setNewFYInput(''); }} className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 cursor-pointer" title="Cancel">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <div className="relative flex items-center">
                  <Calendar className="w-3.5 h-3.5 text-blue-400 absolute left-2.5 pointer-events-none" />
                  <select
                    value={selectedFY}
                    onChange={(e) => onSelectFY(e.target.value)}
                    className="pl-7 pr-8 py-1 text-xs font-medium rounded-md bg-transparent text-slate-200 border-none focus:outline-none focus:ring-0 cursor-pointer appearance-none min-w-[100px]"
                    title="Select Financial Year"
                  >
                    {allFYs.map((fy) => (
                      <option key={fy} value={fy} className="bg-slate-900 text-slate-200">
                        FY {fy}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-slate-400">
                    <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
              )}
              
              {!isAddingFY && (
                <button
                  type="button"
                  onClick={() => setIsAddingFY(true)}
                  className="p-1.5 rounded-md hover:bg-slate-700 text-slate-400 hover:text-blue-400 transition-colors cursor-pointer"
                  title="Add Custom Year"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* 2. DEPARTMENT SELECTOR & ADDER */}
            <div className="flex items-center space-x-1.5 bg-slate-800/60 p-1 rounded-lg border border-slate-700/80">
              {isAddingDept ? (
                <form onSubmit={handleSaveNewDept} className="flex items-center space-x-1">
                  <input
                    type="text"
                    value={newDeptInput}
                    onChange={(e) => setNewDeptInput(e.target.value)}
                    placeholder="New Dept Name"
                    className="px-2 py-1 text-xs font-medium rounded bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 w-44"
                    autoFocus
                  />
                  <button type="submit" className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer" title="Save Department">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => { setIsAddingDept(false); setNewDeptInput(''); }} className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 cursor-pointer" title="Cancel">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <div className="relative flex items-center">
                  <Building className="w-3.5 h-3.5 text-amber-400 absolute left-2.5 pointer-events-none" />
                  <select
                    value={selectedDepartmentName}
                    onChange={(e) => onSelectDepartmentName(e.target.value)}
                    className="pl-7 pr-8 py-1 text-xs font-medium rounded-md bg-transparent text-slate-200 border-none focus:outline-none focus:ring-0 cursor-pointer appearance-none min-w-[160px]"
                    title="Select Department"
                  >
                    {allDepartmentNames.map((name) => (
                      <option key={name} value={name} className="bg-slate-900 text-slate-200">
                        Dept: {name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-slate-400">
                    <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
              )}
              
              {!isAddingDept && (
                <button
                  type="button"
                  onClick={() => setIsAddingDept(true)}
                  className="p-1.5 rounded-md hover:bg-slate-700 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                  title="Add Custom Department"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* JSON Export/Import & Reset */}
            <div className="flex items-center space-x-1">
              {/* Export JSON */}
              <button
                onClick={onExportJSON}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
                title="Export Budget Data to JSON"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Export</span>
              </button>

              {/* Import JSON */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={onImportJSON}
                accept=".json"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
                title="Import Budget Data from JSON"
              >
                <Upload className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Import</span>
              </button>

              {/* Reset Data Button (Disabled) */}
              <button
                disabled
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 bg-slate-900/40 border border-slate-800/60 rounded-lg opacity-50 cursor-not-allowed"
                title="Reset data is disabled"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
            
          </div>

        </div>
      </div>
    </header>
  );
};
