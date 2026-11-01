import React, { useState, useEffect } from 'react';
import { Settings, DollarSign, Target, Calendar, Sliders, Wand2, ChevronDown, ChevronUp, Plus, Minus } from 'lucide-react';
import { DepartmentConfig } from '../types';

interface ConfigSectionProps {
  config: DepartmentConfig;
  onUpdateConfig: (newConfig: Partial<DepartmentConfig>) => void;
  onApplyBudgetSpread?: (monthlyCost: number) => void;
}

export const ConfigSection: React.FC<ConfigSectionProps> = ({
  config,
  onUpdateConfig,
  onApplyBudgetSpread
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [spreadMode, setSpreadMode] = useState<'equal' | 'custom'>('equal');

  // Local state for Carryforward input to allow typing '-' or empty values smoothly
  const [carryforwardText, setCarryforwardText] = useState<string>(
    config.lastYearLossProfit !== undefined && config.lastYearLossProfit !== null
      ? String(config.lastYearLossProfit)
      : '0'
  );

  useEffect(() => {
    // Keep local text in sync when config changes externally
    const parsedLocal = parseFloat(carryforwardText);
    const currentConfigVal = config.lastYearLossProfit ?? 0;
    if (isNaN(parsedLocal) || parsedLocal !== currentConfigVal) {
      setCarryforwardText(String(currentConfigVal));
    }
  }, [config.lastYearLossProfit]);

  const handleCarryforwardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setCarryforwardText(raw);

    if (raw === '' || raw === '-') {
      onUpdateConfig({ lastYearLossProfit: 0 });
    } else {
      const parsed = parseFloat(raw);
      if (!isNaN(parsed)) {
        onUpdateConfig({ lastYearLossProfit: parsed });
      }
    }
  };

  const handleToggleSign = (isLoss: boolean) => {
    const currentNum = Math.abs(parseFloat(carryforwardText) || config.lastYearLossProfit || 0);
    const newNum = isLoss ? -currentNum : currentNum;
    setCarryforwardText(String(newNum));
    onUpdateConfig({ lastYearLossProfit: newNum });
  };

  const handleApplySpread = () => {
    if (onApplyBudgetSpread && config.yearlyBudget > 0) {
      const monthlyAllowance = Math.round(config.yearlyBudget / 12);
      onApplyBudgetSpread(monthlyAllowance);
    }
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200/80 shadow-xs mb-6 overflow-hidden transition-all">
      {/* Section Header Bar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-5 py-3.5 bg-slate-50/80 hover:bg-slate-100/80 border-b border-slate-200/70 flex items-center justify-between cursor-pointer select-none transition-colors"
      >
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-md bg-blue-50 text-blue-600 border border-blue-100">
            <Settings className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-800">1. Department Configuration</h2>
            <p className="text-xs text-slate-500">Set department profile name, fiscal year target budget, and margin objectives.</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-medium text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-full">
            {config.departmentName || 'Untitled Dept'} • {config.currencySymbol}{config.yearlyBudget.toLocaleString()}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </div>

      {/* Expanded Fields */}
      {isExpanded && (
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* Field 1: Department Name */}
            <div>
              <label htmlFor="department-name-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Department Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative rounded-lg shadow-xs">
                <input
                  id="department-name-input"
                  type="text"
                  value={config.departmentName}
                  onChange={(e) => onUpdateConfig({ departmentName: e.target.value })}
                  placeholder="e.g. Software Engineering & Product"
                  className="w-full px-3 py-2 text-sm text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Field 2: Yearly Budget */}
            <div>
              <label htmlFor="yearly-budget-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Yearly Budget Target <span className="text-rose-500">*</span>
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-semibold text-sm">
                  {config.currencySymbol}
                </div>
                <input
                  id="yearly-budget-input"
                  type="number"
                  min="0"
                  step="any"
                  value={config.yearlyBudget || ''}
                  onChange={(e) => onUpdateConfig({ yearlyBudget: Math.max(0, parseFloat(e.target.value) || 0) })}
                  placeholder="1200000"
                  className="w-full pl-8 pr-3 py-2 text-sm font-semibold text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                <span>Monthly Target: <strong>{config.currencySymbol}{Math.round((config.yearlyBudget || 0) / 12).toLocaleString()}/mo</strong></span>
              </p>
            </div>

            {/* Field 3: Fiscal Year */}
            <div>
              <label htmlFor="fiscal-year-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Fiscal Year & Currency
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    id="fiscal-year-input"
                    type="text"
                    value={config.fiscalYear}
                    onChange={(e) => onUpdateConfig({ fiscalYear: e.target.value })}
                    placeholder="2026"
                    className="w-full px-3 py-2 text-sm text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <select
                  value={config.currencySymbol}
                  onChange={(e) => onUpdateConfig({ currencySymbol: e.target.value })}
                  className="px-2.5 py-2 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  title="Select Currency"
                >
                  <option value="LKR">LKR (Sri Lankan Rupee)</option>
                  <option value="$">$ (USD)</option>
                  <option value="€">€ (EUR)</option>
                  <option value="£">£ (GBP)</option>
                  <option value="₹">₹ (INR)</option>
                  <option value="A$">A$ (AUD)</option>
                </select>
              </div>
            </div>

            {/* Field 4: Target Margin % */}
            <div>
              <label htmlFor="target-profit-margin-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Target Profit Margin (%)
              </label>
              <div className="relative rounded-lg shadow-xs">
                <input
                  id="target-profit-margin-input"
                  type="number"
                  min="0"
                  max="100"
                  step="any"
                  value={config.targetMarginPercentage || 0}
                  onChange={(e) => onUpdateConfig({ targetMarginPercentage: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-sm font-medium text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 font-semibold text-xs">
                  %
                </div>
              </div>
            </div>

            {/* Field 5: Carryforward Value */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="carryforward-value-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Carryforward Value
                </label>
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => handleToggleSign(false)}
                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded cursor-pointer transition-colors ${
                      (config.lastYearLossProfit || 0) >= 0 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                    title="Set as Profit (+)"
                  >
                    + Profit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleSign(true)}
                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded cursor-pointer transition-colors ${
                      (config.lastYearLossProfit || 0) < 0 
                        ? 'bg-rose-600 text-white' 
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                    title="Set as Loss (-)"
                  >
                    - Loss
                  </button>
                </div>
              </div>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-semibold text-xs">
                  {config.currencySymbol}
                </div>
                <input
                  id="carryforward-value-input"
                  type="text"
                  inputMode="decimal"
                  value={carryforwardText}
                  onChange={handleCarryforwardChange}
                  placeholder="e.g. -50000 or 100000"
                  className={`w-full pl-8 pr-3 py-2 text-sm font-semibold bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    (config.lastYearLossProfit || 0) < 0 
                      ? 'text-rose-600 border-rose-300 focus:ring-rose-500' 
                      : (config.lastYearLossProfit || 0) > 0 
                        ? 'text-emerald-600 border-emerald-300 focus:ring-emerald-500'
                        : 'text-slate-800 border-slate-300 focus:ring-blue-500'
                  }`}
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1 flex justify-between items-center">
                <span>Enter positive for Profit, negative for Loss</span>
                {(config.lastYearLossProfit || 0) !== 0 && (
                  <span className={`font-bold ${ (config.lastYearLossProfit || 0) < 0 ? 'text-rose-600' : 'text-emerald-600' }`}>
                    {(config.lastYearLossProfit || 0) < 0 ? 'Loss (-)' : 'Profit (+)'}
                  </span>
                )}
              </p>
            </div>

          </div>

          {/* Quick Helper Tools */}
          {onApplyBudgetSpread && (
            <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2 text-xs text-slate-600">
                <Wand2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Quick Budget Assistant:</span>
                <span className="text-slate-500">Distribute yearly budget ({config.currencySymbol}{config.yearlyBudget.toLocaleString()}) across 12 months</span>
              </div>
              <button
                onClick={handleApplySpread}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
              >
                <span>Spread Evenly ({config.currencySymbol}{Math.round((config.yearlyBudget || 0) / 12).toLocaleString()}/mo)</span>
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
