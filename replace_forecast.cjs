const fs = require('fs');
const content = fs.readFileSync('src/components/ProjectForecastTab.tsx', 'utf8');

const replacement = `
  const totalPipeline = forecasts.reduce((sum, f) => sum + f.estimatedValue, 0);

  const plannedForecasts = forecasts.filter(f => projects.some(p => p.name.trim().toLowerCase() === f.name.trim().toLowerCase()));
  const unplannedForecasts = forecasts.filter(f => !projects.some(p => p.name.trim().toLowerCase() === f.name.trim().toLowerCase()));

  const renderForecastList = (list: ProjectForecast[], isPlannedSection: boolean) => {
    if (list.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border border-slate-200 border-dashed p-8">
          <Target className="w-8 h-8 mb-2 opacity-20" />
          <p className="font-medium text-slate-500 text-sm">No {isPlannedSection ? 'planned' : 'unplanned'} forecasts.</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {list
          .sort((a, b) => {
            const pScore = { High: 3, Medium: 2, Low: 1 };
            return pScore[b.priority] - pScore[a.priority] || b.estimatedValue - a.estimatedValue;
          })
          .map((forecast) => {
            return (
            <div 
              key={forecast.id} 
              className={\`group bg-white border \${isPlannedSection ? 'border-emerald-200' : 'border-slate-200'} p-4 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-200 transition-all flex items-center justify-between\`}
            >
              <div className="flex items-center space-x-4">
                <div className={\`w-2 h-10 rounded-full \${
                  forecast.priority === 'High' ? 'bg-red-500' :
                  forecast.priority === 'Medium' ? 'bg-amber-400' : 'bg-emerald-400'
                }\`} />
                
                <div>
                  <h4 className="font-bold text-slate-800 text-lg leading-tight">{forecast.name}</h4>
                  <div className="flex items-center mt-1 space-x-3">
                    <span className={\`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center \${
                      forecast.priority === 'High' ? 'bg-red-50 text-red-700 border border-red-100' :
                      forecast.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 
                      'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    }\`}>
                      {forecast.priority === 'High' && <AlertCircle className="w-3 h-3 mr-1" />}
                      {forecast.priority} Priority
                    </span>
                    
                    {isPlannedSection && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Planned
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Est. Value</div>
                  <div className="font-black text-slate-700">{formatCurrency(forecast.estimatedValue, currencySymbol)}</div>
                </div>
                
                <div className="flex items-center">
                  {!isPlannedSection && (
                    <button
                      onClick={() => handleMarkAsPlanned(forecast)}
                      className="text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Mark as Planned"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => startEdit(forecast)}
                    className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Edit Forecast"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteForecast(forecast.id)}
                    className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Delete Forecast"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )})}
      </div>
    );
  };
`;

const startIndex = content.indexOf('const totalPipeline');

let newContent = content.substring(0, startIndex) + replacement;

const listSectionStart = content.indexOf('{/* Forecast List */}');
const listSectionEndStr = '</div>\n      </div>\n    </div>\n  );\n};';
const listSectionEnd = content.indexOf(listSectionEndStr);

newContent += `
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center">
            <Target className="w-6 h-6 mr-2 text-indigo-600" />
            Project Forecast Pipeline
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Track and manage upcoming potential projects and expected values.
          </p>
        </div>
        
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-center justify-between min-w-[250px]">
          <div>
            <div className="text-xs font-bold text-indigo-800 uppercase tracking-wider">Total Pipeline</div>
            <div className="text-xl font-black text-indigo-700">{formatCurrency(totalPipeline, currencySymbol)}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add New Forecast Form */}
        <div className="lg:col-span-1">
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 sticky top-6">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center">
              {editingId ? (
                <><Edit2 className="w-4 h-4 mr-1.5 text-slate-500" /> Edit Forecast</>
              ) : (
                <><Plus className="w-4 h-4 mr-1.5 text-slate-500" /> Add New Forecast</>
              )}
            </h3>
            
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Project / Task Name</label>
                <input
                  type="text"
                  required
                  list="existing-projects"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter task or project name..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                />
                <datalist id="existing-projects">
                  {projects.map((p) => (
                    <option key={p.id} value={p.name} />
                  ))}
                </datalist>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Est. Value ({currencySymbol})</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <DollarSign className="w-4 h-4" />
                  </span>
                  <input
                    type="number"
                    required
                    min="0"
                    value={estimatedValue}
                    onChange={(e) => setEstimatedValue(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as 'High' | 'Medium' | 'Low')}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm font-medium"
                >
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
              </div>

              <div className="flex space-x-2 mt-2">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-lg shadow-sm transition-colors text-sm flex items-center justify-center"
                >
                  {editingId ? (
                    <><Edit2 className="w-4 h-4 mr-1.5" /> Update</>
                  ) : (
                    <><Plus className="w-4 h-4 mr-1.5" /> Add</>
                  )}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="flex-none bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2.5 px-4 rounded-lg shadow-sm transition-colors text-sm flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Forecast List */}
        <div className="lg:col-span-2 flex flex-col space-y-8">
          
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">Unplanned Forecasts ({unplannedForecasts.length})</h3>
            {renderForecastList(unplannedForecasts, false)}
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2 text-emerald-800">Planned Forecasts ({plannedForecasts.length})</h3>
            {renderForecastList(plannedForecasts, true)}
          </div>

        </div>
      </div>
    </div>
  );
};
`
fs.writeFileSync('src/components/ProjectForecastTab.tsx', newContent);
