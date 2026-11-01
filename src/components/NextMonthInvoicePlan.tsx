import React, { useState, useMemo } from 'react';
import { Project } from '../types';
import { SHORT_MONTH_NAMES } from '../data/initialData';
import { formatCurrency } from '../utils/calculations';
import { Calendar, DollarSign } from 'lucide-react';

interface NextMonthInvoicePlanProps {
  projects: Project[];
  currencySymbol: string;
}

export function NextMonthInvoicePlan({ projects, currencySymbol }: NextMonthInvoicePlanProps) {
  const [selectedMonthIdx, setSelectedMonthIdx] = useState<number>(new Date().getMonth());

  const invoicePlanData = useMemo(() => {
    const plans: { projectId: string; projectName: string; amount: number }[] = [];
    let total = 0;

    projects.forEach((proj) => {
      const val = proj.monthlyForecast[selectedMonthIdx] || 0;
      if (val > 0) {
        plans.push({
          projectId: proj.id,
          projectName: proj.name,
          amount: val,
        });
        total += val;
      }
    });

    return { plans, total };
  }, [projects, selectedMonthIdx]);

  return (
    <div className="mt-6 bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
      <div className="bg-slate-900 p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-blue-500/20 rounded">
            <Calendar className="w-5 h-5 text-blue-400" />
          </div>
          <h2 className="text-sm font-bold text-white tracking-wide uppercase">Next Month Invoice Plan</h2>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-xs text-slate-400 font-medium">Select Month:</span>
          <select
            value={selectedMonthIdx}
            onChange={(e) => setSelectedMonthIdx(Number(e.target.value))}
            className="text-xs bg-slate-800 text-white border border-slate-700 rounded-md py-1.5 px-3 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer font-medium"
          >
            {SHORT_MONTH_NAMES.map((m, idx) => (
              <option key={idx} value={idx}>
                {m} (Month {idx + 1})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
        <div>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Total Plan Value for {SHORT_MONTH_NAMES[selectedMonthIdx]}</p>
          <p className="text-2xl font-bold text-slate-800">
            {formatCurrency(invoicePlanData.total, currencySymbol)}
          </p>
        </div>
        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-inner">
          <DollarSign className="w-6 h-6" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
              <th className="p-3 pl-5 font-medium">Project Name</th>
              <th className="p-3 text-right pr-5 font-medium">Invoice Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {invoicePlanData.plans.length === 0 ? (
              <tr>
                <td colSpan={2} className="p-6 text-center text-slate-400 text-sm">
                  No invoice plans found for {SHORT_MONTH_NAMES[selectedMonthIdx]}.
                </td>
              </tr>
            ) : (
              invoicePlanData.plans.map((plan, idx) => (
                <tr key={plan.projectId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-3 pl-5 text-slate-700 font-medium flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    {plan.projectName}
                  </td>
                  <td className="p-3 pr-5 text-right font-semibold text-emerald-600">
                    {formatCurrency(plan.amount, currencySymbol)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {invoicePlanData.plans.length > 0 && (
            <tfoot className="bg-slate-50 border-t border-slate-200">
              <tr>
                <td className="p-3 pl-5 text-right font-bold text-slate-600 text-sm">
                  Total
                </td>
                <td className="p-3 pr-5 text-right font-bold text-slate-800 text-sm">
                  {formatCurrency(invoicePlanData.total, currencySymbol)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
