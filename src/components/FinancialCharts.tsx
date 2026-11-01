import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  ComposedChart, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart as RePieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { BarChart3, PieChart, TrendingUp, Sparkles } from 'lucide-react';
import { MonthlyCombinedSummary, formatCurrency } from '../utils/calculations';
import { SHORT_MONTH_NAMES } from '../data/initialData';

interface FinancialChartsProps {
  monthlySummaries: MonthlyCombinedSummary[];
  currencySymbol: string;
  totalDirectCost: number;
  totalOverheadCost: number;
}

export const FinancialCharts: React.FC<FinancialChartsProps> = ({
  monthlySummaries,
  currencySymbol,
  totalDirectCost,
  totalOverheadCost
}) => {
  const [activeTab, setActiveTab] = useState<'trend' | 'forecast' | 'cost_pie'>('trend');

  // Format chart data
  const chartData = monthlySummaries.map((s, idx) => ({
    name: SHORT_MONTH_NAMES[idx],
    fullName: s.monthName,
    ActualRevenue: s.actualRevenue,
    ForecastedRevenue: s.forecastedRevenue,
    DirectCost: s.directCost,
    OverheadCost: s.overheadCost,
    TotalCost: s.totalCost,
    NetProfitLoss: s.netProfitLoss
  }));

  const pieData = [
    { name: 'Direct Costs', value: totalDirectCost, color: '#3b82f6' },
    { name: 'Overhead Costs', value: totalOverheadCost, color: '#f59e0b' }
  ];

  const totalCostsAll = totalDirectCost + totalOverheadCost;

  return (
    <section className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 mb-6">
      
      {/* Header & View Switches */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-md bg-blue-50 text-blue-600 border border-blue-100">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">
              12-Month Financial Visualizations
            </h3>
            <p className="text-xs text-slate-500">Visual trend maps for monthly revenue, costs, and project forecast projections.</p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('trend')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'trend'
                ? 'bg-white text-blue-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            P&L Trend
          </button>
          <button
            onClick={() => setActiveTab('forecast')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'forecast'
                ? 'bg-white text-blue-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Actual vs Forecast
          </button>
          <button
            onClick={() => setActiveTab('cost_pie')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'cost_pie'
                ? 'bg-white text-blue-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cost Mix
          </button>
        </div>
      </div>

      {/* Chart Containers */}
      <div className="h-72 w-full">
        {activeTab === 'trend' && (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} />
              <YAxis 
                tick={{ fontSize: 11, fill: '#64748b' }} 
                axisLine={false}
                tickFormatter={(val) => `${currencySymbol}${val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}`} 
              />
              <Tooltip 
                formatter={(value: any, name: any) => [
                  formatCurrency(Number(value) || 0, currencySymbol),
                  name === 'ActualRevenue' ? 'Actual Revenue' :
                  name === 'TotalCost' ? 'Total Costs' :
                  name === 'NetProfitLoss' ? 'Net Profit/Loss' : name
                ]}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#fff', fontSize: '12px' }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                formatter={(value) => (
                  value === 'ActualRevenue' ? 'Actual Revenue' :
                  value === 'TotalCost' ? 'Total Cost (Direct + Overhead)' :
                  value === 'NetProfitLoss' ? 'Net Profit / Loss' : value
                )}
              />
              <Bar dataKey="ActualRevenue" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} />
              <Bar dataKey="TotalCost" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={28} />
              <Line type="monotone" dataKey="NetProfitLoss" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'forecast' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} />
              <YAxis 
                tick={{ fontSize: 11, fill: '#64748b' }} 
                axisLine={false}
                tickFormatter={(val) => `${currencySymbol}${val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}`} 
              />
              <Tooltip 
                formatter={(value: any) => [formatCurrency(Number(value) || 0, currencySymbol)]}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#fff', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="ActualRevenue" name="Actual Revenue" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={24} />
              <Bar dataKey="ForecastedRevenue" name="Project Forecasted Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'cost_pie' && (
          <div className="flex flex-col sm:flex-row items-center justify-center h-full gap-6">
            <div className="w-56 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [formatCurrency(Number(value) || 0, currencySymbol)]}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '0.5rem', color: '#fff', fontSize: '12px' }}
                  />
                </RePieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-blue-50/80 rounded-lg border border-blue-100 flex items-center justify-between min-w-[220px]">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="font-medium text-slate-700">Direct Costs</span>
                </div>
                <div className="text-right">
                  <strong className="text-slate-900 block">{formatCurrency(totalDirectCost, currencySymbol)}</strong>
                  <span className="text-[10px] text-slate-500">
                    {totalCostsAll > 0 ? `${((totalDirectCost / totalCostsAll) * 100).toFixed(1)}%` : '0%'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-amber-50/80 rounded-lg border border-amber-100 flex items-center justify-between min-w-[220px]">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="font-medium text-slate-700">Overhead Costs</span>
                </div>
                <div className="text-right">
                  <strong className="text-slate-900 block">{formatCurrency(totalOverheadCost, currencySymbol)}</strong>
                  <span className="text-[10px] text-slate-500">
                    {totalCostsAll > 0 ? `${((totalOverheadCost / totalCostsAll) * 100).toFixed(1)}%` : '0%'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    </section>
  );
};
