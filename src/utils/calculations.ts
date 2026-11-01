import { MonthFinancials, Project } from '../types';

export interface MonthlyCombinedSummary {
  monthIndex: number;
  monthName: string;
  directCost: number;
  overheadCost: number;
  totalCost: number;
  actualRevenue: number;
  forecastedRevenue: number;
  totalRevenue: number; // actualRevenue (or combined)
  netProfitLoss: number;
  profitMarginPercent: number;
  isProfit: boolean;
  revenueDetails?: { id: string; description: string; amount: number; }[];
  projectRevenues?: { projectId: string; projectName: string; amount: number; }[];
}

export interface FinancialTotals {
  totalDirectCost: number;
  totalOverheadCost: number;
  totalCost: number;
  totalActualRevenue: number;
  totalForecastedRevenue: number;
  grandTotalRevenue: number; // Actual + Forecasted or Actual
  currentYearNetProfitLoss: number;
  lastYearLossProfit: number;
  netProfitLoss: number;
  netProfitMarginPercent: number;
  isProfit: boolean;
  yearlyBudget: number;
  budgetRemaining: number;
  budgetUtilizationPercent: number;
  averageMonthlyBurnRate: number;
  runwayMonths: number;
  nextYearProjectRevenue?: number;
}

export function calculateMonthlySummaries(
  monthlyData: MonthFinancials[],
  projects: Project[]
): MonthlyCombinedSummary[] {
  // Compute forecasted revenue per month from projects
  const forecastedPerMonth = new Array(12).fill(0);
  const projectRevenuesPerMonth: { projectId: string; projectName: string; amount: number; }[][] = Array.from({ length: 12 }, () => []);

  projects.forEach((proj) => {
    const invoiced = proj.invoicedMonths || new Array(12).fill(false);

    proj.monthlyForecast.forEach((val, idx) => {
      forecastedPerMonth[idx] += val;
      if (invoiced[idx] && val > 0) {
        projectRevenuesPerMonth[idx].push({
          projectId: proj.id,
          projectName: proj.name,
          amount: val
        });
      }
    });
  });

  return monthlyData.map((m, idx) => {
    const directCost = m.directCost || 0;
    const overheadCost = m.overheadCost || 0;
    const totalCost = directCost + overheadCost;
    
    const projectRevs = projectRevenuesPerMonth[idx] || [];
    const totalProjectRevenue = projectRevs.reduce((sum, p) => sum + p.amount, 0);
    const totalManualRevenue = m.revenueDetails?.reduce((sum, d) => sum + d.amount, 0) || 0;
    const actualRevenue = totalProjectRevenue + totalManualRevenue;
    
    const forecastedRevenue = forecastedPerMonth[idx] || 0;
    
    // Revenue used for P&L can be Actual Revenue (or Actual + Forecasted depending on view context)
    const netProfitLoss = actualRevenue - totalCost;
    const profitMarginPercent = actualRevenue > 0 ? (netProfitLoss / actualRevenue) * 100 : 0;

    return {
      monthIndex: m.monthIndex,
      monthName: m.monthName,
      directCost,
      overheadCost,
      totalCost,
      actualRevenue,
      forecastedRevenue,
      totalRevenue: actualRevenue,
      netProfitLoss,
      profitMarginPercent,
      isProfit: netProfitLoss >= 0,
      revenueDetails: m.revenueDetails,
      projectRevenues: projectRevs
    };
  });
}

export function calculateFinancialTotals(
  monthlyData: MonthFinancials[],
  projects: Project[],
  yearlyBudget: number,
  lastYearLossProfit: number = 0
): FinancialTotals {
  const summaries = calculateMonthlySummaries(monthlyData, projects);

  let totalDirectCost = 0;
  let totalOverheadCost = 0;
  let totalCost = 0;
  let totalActualRevenue = 0;
  let totalForecastedRevenue = 0;

  summaries.forEach((s) => {
    totalDirectCost += s.directCost;
    totalOverheadCost += s.overheadCost;
    totalCost += s.totalCost;
    totalActualRevenue += s.actualRevenue;
    totalForecastedRevenue += s.forecastedRevenue;
  });

  const currentYearNetProfitLoss = totalActualRevenue - totalCost;
  const netProfitLoss = currentYearNetProfitLoss + (lastYearLossProfit || 0);
  const netProfitMarginPercent = totalActualRevenue > 0 ? (netProfitLoss / totalActualRevenue) * 100 : 0;
  const isProfit = netProfitLoss >= 0;

  const budgetRemaining = yearlyBudget - totalCost;
  const budgetUtilizationPercent = yearlyBudget > 0 ? (totalCost / yearlyBudget) * 100 : 0;
  const averageMonthlyBurnRate = totalCost / 12;
  const runwayMonths = averageMonthlyBurnRate > 0 ? budgetRemaining / averageMonthlyBurnRate : 0;

  let nextYearProjectRevenue = 0;
  projects.forEach((proj) => {
    nextYearProjectRevenue += (proj.nextYearRollover || 0);
  });

  return {
    totalDirectCost,
    totalOverheadCost,
    totalCost,
    totalActualRevenue,
    totalForecastedRevenue,
    grandTotalRevenue: totalActualRevenue,
    currentYearNetProfitLoss,
    lastYearLossProfit: lastYearLossProfit || 0,
    netProfitLoss,
    netProfitMarginPercent,
    isProfit,
    yearlyBudget,
    budgetRemaining,
    budgetUtilizationPercent,
    averageMonthlyBurnRate,
    runwayMonths,
    nextYearProjectRevenue
  };
}

export function formatCurrency(amount: number, symbol: string = '$', compact: boolean = false): string {
  const space = symbol.length > 1 ? ' ' : '';
  if (isNaN(amount)) return `${symbol}${space}0`;
  
  if (compact && Math.abs(amount) >= 1000000) {
    return `${symbol}${space}${(amount / 1000000).toFixed(2)}M`;
  }
  if (compact && Math.abs(amount) >= 10000) {
    return `${symbol}${space}${(amount / 1000).toFixed(1)}k`;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  })
    .format(amount)
    .replace('$', symbol + space);
}

export function formatPercent(value: number): string {
  if (isNaN(value)) return '0.0%';
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}
