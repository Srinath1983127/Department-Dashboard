import React, { useState } from 'react';
import { 
  Table, 
  DollarSign, 
  Copy, 
  Trash2, 
  TrendingUp, 
  Zap, 
  Sparkles, 
  Calculator,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  ChevronUp,
  Plus
} from 'lucide-react';
import { MonthFinancials, Project, RevenueDetail } from '../types';
import { MonthlyCombinedSummary, formatCurrency, formatPercent } from '../utils/calculations';

interface FinancialMatrixGridProps {
  monthlySummaries: MonthlyCombinedSummary[];
  currencySymbol: string;
  onUpdateMonth: (monthIndex: number, field: keyof MonthFinancials, value: any) => void;
  onBulkUpdateMonths: (updater: (m: MonthFinancials, idx: number) => MonthFinancials) => void;
}

export const FinancialMatrixGrid: React.FC<FinancialMatrixGridProps> = ({
  monthlySummaries,
  currencySymbol,
  onUpdateMonth,
  onBulkUpdateMonths
}) => {
  const [quickToolActive, setQuickToolActive] = useState<boolean>(false);
  const [expandedMonth, setExpandedMonth] = useState<number | null>(null);

  // Quick Action: Copy Month 1 inputs to all 12 months
  const handleCopyMonth1ToAll = () => {
    if (monthlySummaries.length === 0) return;
    const m1 = monthlySummaries[0];
    onBulkUpdateMonths((m) => ({
      ...m,
      directCost: m1.directCost,
      overheadCost: m1.overheadCost,
      actualRevenue: m1.actualRevenue
    }));
  };

  // Quick Action: Increase costs by 5%
  const handleAdjustCostsPercent = (percent: number) => {
    const factor = 1 + percent / 100;
    onBulkUpdateMonths((m) => ({
      ...m,
      directCost: Math.round(m.directCost * factor),
      overheadCost: Math.round(m.overheadCost * factor)
    }));
  };

  // Quick Action: Increase revenue by 5%
  const handleAdjustRevenuePercent = (percent: number) => {
    const factor = 1 + percent / 100;
    onBulkUpdateMonths((m) => ({
      ...m,
      actualRevenue: Math.round(m.actualRevenue * factor)
    }));
  };

  // Quick Action: Reset all monthly financial values to 0
  const handleClearAll = () => {
    onBulkUpdateMonths((m) => ({
      ...m,
      directCost: 0,
      overheadCost: 0,
      actualRevenue: 0
    }));
  };

  // Calculate annual totals for matrix footer
  const totalDirectCost = monthlySummaries.reduce((sum, m) => sum + m.directCost, 0);
  const totalOverheadCost = monthlySummaries.reduce((sum, m) => sum + m.overheadCost, 0);
  const totalCost = monthlySummaries.reduce((sum, m) => sum + m.totalCost, 0);
  const totalActualRevenue = monthlySummaries.reduce((sum, m) => sum + m.actualRevenue, 0);
  const totalForecastedRevenue = monthlySummaries.reduce((sum, m) => sum + m.forecastedRevenue, 0);
  const totalNetProfitLoss = totalActualRevenue - totalCost;
  const overallMarginPercent = totalActualRevenue > 0 ? (totalNetProfitLoss / totalActualRevenue) * 100 : 0;

  return (
    <section className="bg-white rounded-xl border border-slate-200/80 shadow-xs mb-6 overflow-hidden">
      
      {/* Table Section Header */}
      <div className="p-5 bg-slate-50/90 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">
              2. 12-Month Financial Matrix Grid
            </h2>
            <p className="text-xs text-slate-500">
              Input Direct Costs, Overhead Costs, and Actual Revenues for Months 1 through 12. Net Profit/Loss is calculated in real time.
            </p>
          </div>
        </div>

        {/* Quick Batch Tools Toggle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setQuickToolActive(!quickToolActive)}
            className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Batch Matrix Tools</span>
          </button>
        </div>
      </div>

      {/* Quick Batch Assistant Toolbar */}
      {quickToolActive && (
        <div className="bg-amber-50/70 border-b border-amber-200/80 px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-amber-900 flex items-center space-x-1">
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>Batch Fill Actions:</span>
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopyMonth1ToAll}
              className="px-2.5 py-1 bg-white hover:bg-amber-100/60 text-slate-800 border border-amber-200 rounded font-medium transition-colors"
              title="Copy Month 1 numbers to Month 2 through Month 12"
            >
              Copy Month 1 to All
            </button>
            <button
              onClick={() => handleAdjustCostsPercent(5)}
              className="px-2.5 py-1 bg-white hover:bg-amber-100/60 text-slate-800 border border-amber-200 rounded font-medium transition-colors"
            >
              Costs +5%
            </button>
            <button
              onClick={() => handleAdjustRevenuePercent(5)}
              className="px-2.5 py-1 bg-white hover:bg-amber-100/60 text-slate-800 border border-amber-200 rounded font-medium transition-colors"
            >
              Revenue +5%
            </button>
            <button
              onClick={handleClearAll}
              className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-200 rounded font-medium transition-colors"
            >
              Zero All Fields
            </button>
          </div>
        </div>
      )}

      {/* Desktop Financial Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-slate-100/80 text-slate-700 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
              <th className="py-3 px-4 w-36 sticky left-0 bg-slate-100 shadow-xs z-10">Month</th>
              <th className="py-3 px-4 w-40">Direct Cost ({currencySymbol})</th>
              <th className="py-3 px-4 w-40">Overhead Cost ({currencySymbol})</th>
              <th className="py-3 px-4 w-36 bg-slate-50/60">Total Costs ({currencySymbol})</th>
              <th className="py-3 px-4 w-44">Actual Revenue ({currencySymbol})</th>
              <th className="py-3 px-4 w-36 text-blue-700 bg-blue-50/40">Forecast Rev ({currencySymbol})</th>
              <th className="py-3 px-4 w-44 text-right">Net Profit / Loss</th>
              <th className="py-3 px-4 w-28 text-right">Margin %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs text-slate-800">
            {monthlySummaries.map((m) => {
              const { monthIndex, monthName, directCost, overheadCost, totalCost, actualRevenue, forecastedRevenue, netProfitLoss, profitMarginPercent, isProfit, revenueDetails, projectRevenues } = m;
              const isExpanded = expandedMonth === monthIndex;

              const totalProjectRevenue = projectRevenues?.reduce((sum, p) => sum + p.amount, 0) || 0;
              const totalManualRevenue = revenueDetails?.reduce((sum, d) => sum + d.amount, 0) || 0;
              const hasProjects = projectRevenues && projectRevenues.length > 0;
              const hasManual = revenueDetails && revenueDetails.length > 0;

              const handleAddDetail = () => {
                const newDetails = [...(revenueDetails || []), { id: `rev_${Date.now()}`, description: '', amount: 0 }];
                onUpdateMonth(monthIndex, 'revenueDetails', newDetails);
              };

              const handleUpdateDetail = (id: string, field: keyof RevenueDetail, value: any) => {
                const currentDetails = revenueDetails || [];
                const newDetails = currentDetails.map(d => d.id === id ? { ...d, [field]: value } : d);
                onUpdateMonth(monthIndex, 'revenueDetails', newDetails);
              };

              const handleRemoveDetail = (id: string) => {
                const currentDetails = revenueDetails || [];
                const newDetails = currentDetails.filter(d => d.id !== id);
                onUpdateMonth(monthIndex, 'revenueDetails', newDetails);
              };

              return (
                <React.Fragment key={monthIndex}>
                  <tr 
                    className={`hover:bg-slate-50/80 transition-colors group ${isExpanded ? 'bg-slate-50' : ''}`}
                  >
                    {/* Month Name */}
                    <td className="py-2.5 px-4 font-semibold text-slate-900 sticky left-0 bg-white group-hover:bg-slate-50 shadow-xs z-10 border-r border-slate-100">
                      {monthName}
                    </td>

                    {/* Manual Input 1: Direct Cost */}
                    <td className="py-2 px-3">
                      <div className="flex rounded-md border border-slate-200 bg-slate-50/50 hover:bg-white focus-within:bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all overflow-hidden">
                        <span className="flex items-center px-2 bg-slate-100/60 text-slate-400 font-semibold select-none text-[11px] border-r border-slate-200 shrink-0">
                          {currencySymbol}
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={directCost || ''}
                          onChange={(e) => onUpdateMonth(monthIndex, 'directCost', Math.max(0, parseFloat(e.target.value) || 0))}
                          placeholder="0"
                          className="w-full px-2 py-1.5 font-medium text-slate-900 bg-transparent border-0 outline-none focus:outline-none focus:ring-0 text-xs"
                        />
                      </div>
                    </td>

                    {/* Manual Input 2: Overhead Cost */}
                    <td className="py-2 px-3">
                      <div className="flex rounded-md border border-slate-200 bg-slate-50/50 hover:bg-white focus-within:bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all overflow-hidden">
                        <span className="flex items-center px-2 bg-slate-100/60 text-slate-400 font-semibold select-none text-[11px] border-r border-slate-200 shrink-0">
                          {currencySymbol}
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={overheadCost || ''}
                          onChange={(e) => onUpdateMonth(monthIndex, 'overheadCost', Math.max(0, parseFloat(e.target.value) || 0))}
                          placeholder="0"
                          className="w-full px-2 py-1.5 font-medium text-slate-900 bg-transparent border-0 outline-none focus:outline-none focus:ring-0 text-xs"
                        />
                      </div>
                    </td>

                    {/* Computed Column: Total Costs */}
                    <td className="py-2.5 px-4 font-bold text-slate-900 bg-slate-50/50">
                      {formatCurrency(totalCost, currencySymbol)}
                    </td>

                    {/* Computed Column: Actual Revenue */}
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-1">
                        <div className="flex flex-1 rounded-md border border-slate-200 bg-slate-100/80 overflow-hidden">
                          <span className="flex items-center px-2 bg-slate-200/60 text-slate-400 font-semibold select-none text-[11px] border-r border-slate-200 shrink-0">
                            {currencySymbol}
                          </span>
                          <input
                            type="number"
                            value={actualRevenue || 0}
                            readOnly
                            className="w-full px-2 py-1.5 font-bold text-slate-900 bg-transparent border-0 outline-none focus:outline-none focus:ring-0 cursor-default text-xs"
                          />
                        </div>
                        <button
                          onClick={() => setExpandedMonth(isExpanded ? null : monthIndex)}
                          className={`p-1.5 rounded-md border ${isExpanded ? 'bg-emerald-100 border-emerald-300 text-emerald-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                          title="View Revenue Details"
                        >
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>

                    {/* Forecasted Revenue from Project Planner */}
                    <td className="py-2.5 px-4 font-medium text-blue-700 bg-blue-50/30">
                      {formatCurrency(forecastedRevenue, currencySymbol)}
                    </td>

                    {/* Computed Column: Net Profit / Loss */}
                    <td className="py-2.5 px-4 text-right">
                      <span className={`inline-flex items-center space-x-1 font-bold px-2.5 py-1 rounded-md text-xs ${
                        isProfit 
                          ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' 
                          : 'text-rose-700 bg-rose-50 border border-rose-200'
                      }`}>
                        {isProfit ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        <span>{isProfit ? '+' : ''}{formatCurrency(netProfitLoss, currencySymbol)}</span>
                      </span>
                    </td>

                    {/* Computed Column: Profit Margin % */}
                    <td className="py-2.5 px-4 text-right font-semibold text-slate-600">
                      {formatPercent(profitMarginPercent)}
                    </td>
                  </tr>
                  
                  {isExpanded && (
                    <tr className="bg-slate-50/80 border-b border-slate-200">
                      <td colSpan={8} className="p-4 shadow-inner">
                        <div className="max-w-3xl border border-slate-200 rounded-lg bg-white overflow-hidden shadow-xs">
                          <div className="bg-slate-100/80 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Revenue Breakdown for {monthName}</h4>
                            <button
                              onClick={handleAddDetail}
                              className="flex items-center space-x-1 text-[11px] bg-white border border-slate-300 px-2 py-1 rounded hover:bg-slate-50 text-slate-700 font-medium transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add Line Item</span>
                            </button>
                          </div>
                          
                          <div className="p-3">
                            <div className="space-y-4">
                              {/* Projects Section */}
                              {hasProjects && (
                                <div>
                                  <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Project Forecasts</h5>
                                  <div className="space-y-1">
                                    {projectRevenues.map((p) => (
                                      <div key={p.projectId} className="flex justify-between items-center bg-slate-50 border border-slate-100 px-3 py-1.5 rounded">
                                        <span className="text-xs text-slate-700 font-medium">{p.projectName}</span>
                                        <span className="text-xs text-slate-900 font-semibold">{formatCurrency(p.amount, currencySymbol)}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Manual Line Items Section */}
                              <div>
                                <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Additional Line Items</h5>
                                {!hasManual ? (
                                  <div className="text-center py-4 text-slate-400 text-[11px] bg-slate-50 border border-dashed border-slate-200 rounded">
                                    No additional line items added.
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    {revenueDetails.map((detail) => (
                                      <div key={detail.id} className="flex items-center gap-2">
                                        <input
                                          type="text"
                                          value={detail.description}
                                          onChange={(e) => handleUpdateDetail(detail.id, 'description', e.target.value)}
                                          placeholder="Description (e.g. Consulting Fee)"
                                          className="flex-1 text-xs px-3 py-1.5 border border-slate-200 rounded focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                                        />
                                        <div className="flex w-40 rounded-md border border-slate-200 bg-white focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all overflow-hidden">
                                          <span className="flex items-center px-2 bg-slate-50 text-slate-400 font-medium select-none text-[11px] border-r border-slate-200 shrink-0">
                                            {currencySymbol}
                                          </span>
                                          <input
                                            type="number"
                                            min="0"
                                            step="any"
                                            value={detail.amount || ''}
                                            onChange={(e) => handleUpdateDetail(detail.id, 'amount', Math.max(0, parseFloat(e.target.value) || 0))}
                                            placeholder="0"
                                            className="w-full px-2 py-1.5 text-xs font-medium border-0 outline-none focus:outline-none focus:ring-0"
                                          />
                                        </div>
                                        <button
                                          onClick={() => handleRemoveDetail(detail.id)}
                                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                          title="Remove"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Summary Section */}
                              <div className="pt-3 border-t border-slate-200">
                                <div className="flex flex-col gap-1 w-64 ml-auto text-xs">
                                  <div className="flex justify-between text-slate-500">
                                    <span>Projects Total:</span>
                                    <span>{formatCurrency(totalProjectRevenue, currencySymbol)}</span>
                                  </div>
                                  <div className="flex justify-between text-slate-500">
                                    <span>Line Items Total:</span>
                                    <span>{formatCurrency(totalManualRevenue, currencySymbol)}</span>
                                  </div>
                                  <div className="flex justify-between font-bold text-slate-900 pt-1 mt-1 border-t border-slate-100">
                                    <span>Total Actual Revenue:</span>
                                    <span>{formatCurrency(actualRevenue, currencySymbol)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>

          {/* Matrix Footer Totals Row */}
          <tfoot>
            <tr className="bg-slate-900 text-white font-bold text-xs uppercase border-t-2 border-slate-800">
              <td className="py-3.5 px-4 sticky left-0 bg-slate-900 z-10">
                Annual Total (12 Mo)
              </td>
              <td className="py-3.5 px-3">
                {formatCurrency(totalDirectCost, currencySymbol)}
              </td>
              <td className="py-3.5 px-3">
                {formatCurrency(totalOverheadCost, currencySymbol)}
              </td>
              <td className="py-3.5 px-4 bg-slate-800">
                {formatCurrency(totalCost, currencySymbol)}
              </td>
              <td className="py-3.5 px-3 text-emerald-400">
                {formatCurrency(totalActualRevenue, currencySymbol)}
              </td>
              <td className="py-3.5 px-4 text-blue-300 bg-slate-800">
                {formatCurrency(totalForecastedRevenue, currencySymbol)}
              </td>
              <td className="py-3.5 px-4 text-right">
                <span className={`px-2.5 py-1 rounded font-extrabold text-sm ${
                  totalNetProfitLoss >= 0 ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
                }`}>
                  {totalNetProfitLoss >= 0 ? '+' : ''}{formatCurrency(totalNetProfitLoss, currencySymbol)}
                </span>
              </td>
              <td className="py-3.5 px-4 text-right text-slate-300">
                {formatPercent(overallMarginPercent)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

    </section>
  );
};
