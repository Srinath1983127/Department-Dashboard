import React, { useState, useMemo } from 'react';
import { Users, ChevronDown, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { Project, Developer, ProjectAssignment } from '../types';
import { MONTH_NAMES } from '../data/initialData';
import { formatCurrency } from '../utils/calculations';

interface PersonPerformanceGridProps {
  projects: Project[];
  developers: Developer[];
  assignments: ProjectAssignment[];
  currencySymbol: string;
}

interface PersonMonthlyData {
  target: number;
  actual: number;
  projects: { projectName: string; target: number; actual: number }[];
}

interface PersonData {
  name: string;
  monthlyData: PersonMonthlyData[];
}

export const PersonPerformanceGrid: React.FC<PersonPerformanceGridProps> = ({ projects, developers, assignments, currencySymbol }) => {
  const [selectedMonth, setSelectedMonth] = useState<number>(1);
  const [expandedPersons, setExpandedPersons] = useState<Record<string, boolean>>({});

  const togglePerson = (name: string) => {
    setExpandedPersons(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const personDataList = useMemo(() => {
    const personMap = new Map<string, PersonMonthlyData[]>();
    const currentYear = new Date().getFullYear();

    // Initialize all found developers from master
    developers.forEach(dev => {
      const name = dev.name.trim();
      if (name && !personMap.has(name)) {
        // Initialize 12 months array
        personMap.set(name, Array.from({ length: 12 }, () => ({ 
          target: dev.monthlyTarget || 0, // Target from Developer Master
          actual: 0, 
          projects: [] 
        })));
      }
    });

    // Populate actuals from Resource Allocation (assignments)
    assignments.forEach(assign => {
      const dev = developers.find(d => d.id === assign.developerId);
      if (!dev) return;
      const name = dev.name.trim();
      if (!name || !personMap.has(name)) return;
      if (assign.projectId === 'LEAVE') return; // Skip leave assignments
      
      const pData = personMap.get(name)!;
      const proj = projects.find(p => p.id === assign.projectId);
      const projName = proj ? proj.name : 'Unknown Project';
      
      for (let m = 0; m < 12; m++) {
        // Construct start and end dates for the month
        const monthStart = new Date(Date.UTC(currentYear, m, 1)).toISOString().split('T')[0];
        const monthEnd = new Date(Date.UTC(currentYear, m + 1, 0)).toISOString().split('T')[0];
        
        // Check if assignment overlaps with this month
        if (assign.startDate <= monthEnd && assign.endDate >= monthStart) {
          const actualValue = assign.projectValue || 0;
          pData[m].actual += actualValue;
          
          const existingProj = pData[m].projects.find(p => p.projectName === projName);
          if (existingProj) {
            existingProj.actual += actualValue;
          } else {
            pData[m].projects.push({
              projectName: projName,
              target: 0, // Target is per person, actual is per project
              actual: actualValue
            });
          }
        }
      }
    });

    const result: PersonData[] = Array.from(personMap.entries()).map(([name, data]) => ({
      name,
      monthlyData: data
    }));

    // Sort by name
    return result.sort((a, b) => a.name.localeCompare(b.name));
  }, [developers, assignments, projects]);

  const currentMonthData = useMemo(() => {
    return personDataList.map(p => ({
      name: p.name,
      target: p.monthlyData[selectedMonth - 1].target,
      actual: p.monthlyData[selectedMonth - 1].actual,
      projects: p.monthlyData[selectedMonth - 1].projects,
    }));
  }, [personDataList, selectedMonth]);

  return (
    <section className="bg-white rounded-xl shadow-sm border border-slate-200 mt-6 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" />
            Person Performance Tracker
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Track individual targets, actuals, and project involvement per month.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600 uppercase">Select Month:</label>
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2"
          >
            {MONTH_NAMES.map((name, idx) => (
              <option key={idx} value={idx + 1}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-6 w-1/3">Person Name</th>
              <th className="py-3 px-4 text-right">Target</th>
              <th className="py-3 px-4 text-right">Actual</th>
              <th className="py-3 px-4 text-right">Profit / Loss</th>
              <th className="py-3 px-6 text-center w-32">Projects</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {currentMonthData.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  No persons assigned to any projects yet.
                </td>
              </tr>
            ) : (
              currentMonthData.map((person, idx) => {
                const profitLoss = person.actual - person.target;
                const isProfit = profitLoss >= 0;
                const isExpanded = expandedPersons[person.name];

                return (
                  <React.Fragment key={idx}>
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-6 font-semibold text-slate-800">
                        {person.name}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-600">
                        {formatCurrency(person.target, currencySymbol)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-600">
                        {formatCurrency(person.actual, currencySymbol)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`inline-flex items-center gap-1 font-bold px-2.5 py-1 rounded-md text-xs ${
                          isProfit ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
                        }`}>
                          {isProfit ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {isProfit ? '+' : ''}{formatCurrency(profitLoss, currencySymbol)}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-center">
                        <button
                          onClick={() => togglePerson(person.name)}
                          className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                            isExpanded ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {person.projects.length} {person.projects.length === 1 ? 'Project' : 'Projects'}
                          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-slate-50/50">
                        <td colSpan={5} className="py-0 px-0 border-b border-slate-200">
                          <div className="px-6 py-4 bg-indigo-50/30 border-l-4 border-indigo-300">
                            <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-3">
                              Project Breakdown for {person.name} ({MONTH_NAMES[selectedMonth - 1]})
                            </h4>
                            {person.projects.length === 0 ? (
                              <p className="text-xs text-slate-500">No projects assigned for this month.</p>
                            ) : (
                              <div className="space-y-2 max-w-2xl">
                                {person.projects.map((proj, pIdx) => {
                                  return (
                                    <div key={pIdx} className="flex items-center justify-between bg-white px-4 py-2.5 rounded border border-indigo-100 shadow-xs">
                                      <span className="font-semibold text-slate-800 text-sm">{proj.projectName}</span>
                                      <div className="flex items-center gap-6 text-xs">
                                        <div className="flex flex-col text-right">
                                          <span className="text-[10px] text-slate-400 font-medium uppercase">Assigned Value</span>
                                          <span className="font-medium text-slate-600">{formatCurrency(proj.actual, currencySymbol)}</span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
