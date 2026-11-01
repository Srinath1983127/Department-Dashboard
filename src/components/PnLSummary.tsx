import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Receipt, 
  PieChart, 
  PiggyBank, 
  AlertTriangle, 
  CheckCircle2, 
  Layers,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { FinancialTotals, formatCurrency, formatPercent } from '../utils/calculations';

interface PnLSummaryProps {
  totals: FinancialTotals;
  currencySymbol: string;
}

export const PnLSummary: React.FC<PnLSummaryProps> = ({ totals, currencySymbol }) => {
  const {
    totalDirectCost,
    totalOverheadCost,
    totalCost,
    totalActualRevenue,
    totalForecastedRevenue,
    netProfitLoss,
    netProfitMarginPercent,
    isProfit,
    yearlyBudget,
    budgetRemaining,
    budgetUtilizationPercent,
    averageMonthlyBurnRate
  } = totals;

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Receipt className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">
            Profit & Loss Financial Summary
          </h2>
        </div>
        <span className="text-xs font-medium text-slate-500">
          Formula: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-mono">Net Profit = Revenue - (Direct + Overhead)</code>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* CARD 1: Total Revenue */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Total Revenue (Actual)
              </p>
              <h3 id="total-revenue-value" className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                {formatCurrency(totalActualRevenue, currencySymbol)}
              </h3>
            </div>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] grid grid-cols-2 gap-1 text-slate-600">
            <div className="bg-slate-50 p-1.5 rounded border border-slate-100 flex flex-col justify-between">
              <span className="text-slate-500">Total Forecast:</span>
              <span className="font-semibold text-blue-600">{formatCurrency(totalForecastedRevenue, currencySymbol)}</span>
            </div>
            {totals.nextYearProjectRevenue !== undefined && totals.nextYearProjectRevenue > 0 ? (
              <div className="bg-slate-50 p-1.5 rounded border border-slate-100 flex flex-col justify-between">
                <span className="text-slate-500">Next Year Roll-over:</span>
                <span className="font-semibold text-indigo-600">
                  {formatCurrency(totals.nextYearProjectRevenue, currencySymbol, true)}
                </span>
              </div>
            ) : (
              <div className="bg-slate-50 p-1.5 rounded border border-slate-100 flex flex-col justify-between">
                <span className="text-slate-500">Next Year Roll-over:</span>
                <span className="font-semibold text-slate-400">
                  {formatCurrency(0, currencySymbol)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* CARD 2: Total Costs (Direct + Overhead) */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Total Costs (Direct + Overhead)
              </p>
              <h3 id="total-costs-value" className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                {formatCurrency(totalCost, currencySymbol)}
              </h3>
            </div>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg border border-amber-100">
              <PieChart className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-1 text-[11px]">
            <div className="bg-slate-50 p-1.5 rounded border border-slate-100 flex justify-between items-center">
              <span className="text-slate-500">Direct:</span>
              <span className="font-semibold text-slate-800">{formatCurrency(totalDirectCost, currencySymbol, true)}</span>
            </div>
            <div className="bg-slate-50 p-1.5 rounded border border-slate-100 flex justify-between items-center">
              <span className="text-slate-500">Overhead:</span>
              <span className="font-semibold text-slate-800">{formatCurrency(totalOverheadCost, currencySymbol, true)}</span>
            </div>
          </div>
        </div>

        {/* CARD 3: Net Profit / Loss (PROFIT = GREEN, LOSS = RED) */}
        <div 
          className={`rounded-xl border p-4 shadow-xs transition-all relative overflow-hidden ${
            isProfit
              ? 'bg-emerald-50/70 border-emerald-300/80 text-emerald-950'
              : 'bg-rose-50/70 border-rose-300/80 text-rose-950'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-1.5">
                <p className={`text-xs font-semibold uppercase tracking-wider ${isProfit ? 'text-emerald-700' : 'text-rose-700'}`}>
                  Net Profit / Loss
                </p>
                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                  isProfit ? 'bg-emerald-200/80 text-emerald-800' : 'bg-rose-200/80 text-rose-800'
                }`}>
                  {isProfit ? 'PROFITABLE' : 'NET LOSS'}
                </span>
              </div>
              <h3 id="net-profit-value" className={`text-2xl font-black mt-1 tracking-tight ${
                isProfit ? 'text-emerald-700' : 'text-rose-700'
              }`}>
                {isProfit ? '+' : ''}{formatCurrency(netProfitLoss, currencySymbol)}
              </h3>
            </div>
            <div className={`p-2.5 rounded-lg border ${
              isProfit 
                ? 'bg-emerald-100/80 text-emerald-700 border-emerald-200' 
                : 'bg-rose-100/80 text-rose-700 border-rose-200'
            }`}>
              {isProfit ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-current/10 flex flex-col gap-1 text-xs">
            {totals.lastYearLossProfit !== 0 && (
              <div className="flex items-center justify-between text-[11px] opacity-90">
                <span>Current Year P&L:</span>
                <span className="font-semibold">
                  {totals.currentYearNetProfitLoss >= 0 ? '+' : ''}{formatCurrency(totals.currentYearNetProfitLoss, currencySymbol)}
                </span>
              </div>
            )}
            {totals.lastYearLossProfit !== 0 && (
              <div className="flex items-center justify-between text-[11px] opacity-90 pb-1 mb-1 border-b border-current/10">
                <span>Carryforward Value:</span>
                <span className={`font-semibold ${totals.lastYearLossProfit >= 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
                  {totals.lastYearLossProfit >= 0 ? '+' : ''}{formatCurrency(totals.lastYearLossProfit, currencySymbol)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="font-medium">Profit Margin:</span>
              <strong className={`px-2 py-0.5 rounded text-xs font-bold ${
                isProfit ? 'bg-emerald-200/80 text-emerald-900' : 'bg-rose-200/80 text-rose-900'
              }`}>
                {formatPercent(netProfitMarginPercent)}
              </strong>
            </div>
          </div>
        </div>

        {/* CARD 4: Budget Variance & Burn Rate */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Budget Variance
              </p>
              <h3 id="budget-remaining-value" className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                {formatCurrency(budgetRemaining, currencySymbol)}
              </h3>
            </div>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-2">
            <div className="flex justify-between text-[11px] text-slate-500 mb-1">
              <span>Budget Used: {budgetUtilizationPercent.toFixed(1)}%</span>
              <span>Target: {formatCurrency(yearlyBudget, currencySymbol, true)}</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  budgetUtilizationPercent > 100 
                    ? 'bg-rose-500' 
                    : budgetUtilizationPercent > 85 
                      ? 'bg-amber-500' 
                      : 'bg-blue-600'
                }`}
                style={{ width: `${Math.min(100, budgetUtilizationPercent)}%` }}
              />
            </div>
          </div>

          <div className="mt-2 text-[11px] text-slate-500 flex justify-between items-center">
            <span>Avg Monthly Spend:</span>
            <span className="font-semibold text-slate-700">{formatCurrency(averageMonthlyBurnRate, currencySymbol, true)}/mo</span>
          </div>
        </div>

      </div>
    </section>
  );
};
