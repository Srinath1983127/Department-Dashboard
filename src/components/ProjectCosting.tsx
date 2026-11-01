import React, { useMemo, useState } from 'react';
import { Project, Developer, ProjectAssignment } from '../types';
import { Calculator, DollarSign, TrendingUp, Users, Clock, ArrowUpRight, ArrowDownRight, Briefcase } from 'lucide-react';
import { formatCurrency } from '../utils/calculations';

interface ProjectCostingProps {
  projects: Project[];
  developers: Developer[];
  assignments: ProjectAssignment[];
  currencySymbol: string;
}

const DEFAULT_HOURLY_RATE = 45; // Standard blended rate

export const ProjectCosting: React.FC<ProjectCostingProps> = ({
  projects,
  developers,
  assignments,
  currencySymbol
}) => {
  const [hourlyRate, setHourlyRate] = useState(DEFAULT_HOURLY_RATE);

  const projectCosts = useMemo(() => {
    return projects.map(project => {
      const projAssignments = assignments.filter(a => a.projectId === project.id);
      
      let totalHours = 0;
      let totalCost = 0;
      
      const devBreakdown = projAssignments.map(assign => {
        const dev = developers.find(d => d.id === assign.developerId);
        
        // Calculate weeks between start and end dates
        const start = new Date(assign.startDate);
        const end = new Date(assign.endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const weeks = diffDays / 7;
        
        const devWeeklyHours = dev ? dev.maxWeeklyHours : 40;
        const assignedHours = weeks * devWeeklyHours * (assign.allocationPercentage / 100);
        const cost = assignedHours * hourlyRate;
        
        totalHours += assignedHours;
        totalCost += cost;
        
        return {
          developer: dev?.name || 'Unknown',
          role: assign.roleInProject,
          weeks: weeks.toFixed(1),
          allocation: assign.allocationPercentage,
          hours: Math.round(assignedHours),
          cost: Math.round(cost)
        };
      });

      const budget = project.totalValue;
      const margin = budget - totalCost;
      const marginPercentage = budget > 0 ? (margin / budget) * 100 : 0;

      return {
        ...project,
        totalHours: Math.round(totalHours),
        totalCost: Math.round(totalCost),
        margin: Math.round(margin),
        marginPercentage: marginPercentage.toFixed(1),
        devBreakdown
      };
    }).sort((a, b) => b.budget - a.budget);
  }, [projects, developers, assignments, hourlyRate]);

  // Aggregate stats
  const totalProjectRevenue = projectCosts.reduce((acc, p) => acc + p.totalValue, 0);
  const totalOverallCost = projectCosts.reduce((acc, p) => acc + p.totalCost, 0);
  const overallMargin = totalProjectRevenue - totalOverallCost;
  const overallMarginPercentage = totalProjectRevenue > 0 ? (overallMargin / totalProjectRevenue) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-1 flex items-center">
            <Calculator className="w-6 h-6 mr-2 text-emerald-600" />
            Project Costing & Margin Analysis
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Analyze estimated developer costs vs project budget to project profitability.
          </p>
        </div>
        
        <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <label className="text-xs font-bold text-slate-600 uppercase">Blended Hourly Rate</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 font-medium">{currencySymbol}</span>
            <input 
              type="number" 
              value={hourlyRate}
              onChange={(e) => setHourlyRate(Number(e.target.value) || 0)}
              className="pl-8 pr-4 py-2 w-28 rounded-lg border border-slate-300 text-sm font-bold text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1 flex items-center">
            <Briefcase className="w-4 h-4 mr-1.5" /> Total Project Budget
          </div>
          <div className="text-3xl font-black text-slate-800">{formatCurrency(totalProjectRevenue, currencySymbol)}</div>
        </div>
        <div className="bg-rose-50 rounded-xl p-5 border border-rose-100">
          <div className="text-rose-600 text-xs font-bold uppercase tracking-wider mb-1 flex items-center">
            <Users className="w-4 h-4 mr-1.5" /> Total Estimated Dev Cost
          </div>
          <div className="text-3xl font-black text-rose-700">{formatCurrency(totalOverallCost, currencySymbol)}</div>
        </div>
        <div className={`rounded-xl p-5 border ${overallMargin >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
          <div className={`text-xs font-bold uppercase tracking-wider mb-1 flex items-center ${overallMargin >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
            <TrendingUp className="w-4 h-4 mr-1.5" /> Projected Margin
          </div>
          <div className="flex items-end space-x-2">
            <div className={`text-3xl font-black ${overallMargin >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
              {formatCurrency(overallMargin, currencySymbol)}
            </div>
            <div className={`text-sm font-bold mb-1 ${overallMargin >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              ({overallMarginPercentage.toFixed(1)}%)
            </div>
          </div>
        </div>
      </div>

      {/* Project Breakdown List */}
      <div className="space-y-6">
        <h3 className="font-bold text-slate-800 text-lg flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-slate-400" />
          Individual Project Costing
        </h3>
        
        {projectCosts.map(project => (
          <div key={project.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
            {/* Project Header */}
            <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full shadow-sm" 
                  style={{ backgroundColor: project.color }}
                />
                <div>
                  <h4 className="font-bold text-slate-800">{project.name}</h4>
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">{project.category}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Budget</div>
                  <div className="font-bold text-slate-700">{formatCurrency(project.totalValue, currencySymbol)}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Est. Cost</div>
                  <div className="font-bold text-rose-600">{formatCurrency(project.totalCost, currencySymbol)}</div>
                </div>
                <div className="text-right bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Margin</div>
                  <div className={`font-bold flex items-center ${project.margin >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {project.margin >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                    {formatCurrency(project.margin, currencySymbol)} 
                    <span className="text-xs ml-1 opacity-70">({project.marginPercentage}%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Developer Breakdown */}
            <div className="p-4">
              {project.devBreakdown.length === 0 ? (
                <div className="text-center py-6 text-slate-400 font-medium text-sm bg-slate-50/50 rounded-lg border border-slate-200 border-dashed">
                  No developers assigned to this project yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="text-slate-500 text-xs uppercase border-b border-slate-100">
                        <th className="pb-2 font-bold">Developer</th>
                        <th className="pb-2 font-bold">Role</th>
                        <th className="pb-2 font-bold text-center">Duration</th>
                        <th className="pb-2 font-bold text-center">Allocation</th>
                        <th className="pb-2 font-bold text-right">Est. Hours</th>
                        <th className="pb-2 font-bold text-right">Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {project.devBreakdown.map((dev, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-3 font-semibold text-slate-800">{dev.developer}</td>
                          <td className="py-3 text-slate-600 text-xs">{dev.role}</td>
                          <td className="py-3 text-center text-slate-600">{dev.weeks} wks</td>
                          <td className="py-3 text-center">
                            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-bold border border-blue-100">
                              {dev.allocation}%
                            </span>
                          </td>
                          <td className="py-3 text-right text-slate-600 font-medium flex items-center justify-end">
                            <Clock className="w-3 h-3 mr-1 opacity-50" />
                            {dev.hours}
                          </td>
                          <td className="py-3 text-right font-semibold text-rose-600">
                            {formatCurrency(dev.cost, currencySymbol)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t border-slate-200 bg-slate-50">
                      <tr>
                        <td colSpan={4} className="py-2 text-right font-bold text-slate-600 text-xs uppercase">Total:</td>
                        <td className="py-2 text-right font-bold text-slate-800">{project.totalHours} hrs</td>
                        <td className="py-2 text-right font-bold text-rose-700">{formatCurrency(project.totalCost, currencySymbol)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
