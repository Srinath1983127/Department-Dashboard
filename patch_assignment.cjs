const fs = require('fs');
let code = fs.readFileSync('src/components/DeveloperAssignmentGrid.tsx', 'utf8');

// 1. Add "Leave" to the Project dropdown
code = code.replace(
  "{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}",
  "{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}\n                      <option value=\"LEAVE\">🌴 Leave / Time Off</option>"
);

// 2. Render "Leave" correctly in the list
code = code.replace(
  "const proj = projects.find(p => p.id === assign.projectId);",
  "const proj = projects.find(p => p.id === assign.projectId);\n                          const projectName = assign.projectId === 'LEAVE' ? '🌴 Leave / Time Off' : (proj?.name || 'Unknown');"
);

code = code.replace(
  "<div className=\"text-xs font-bold text-slate-800\">{proj?.name || 'Unknown'}</div>",
  "<div className=\"text-xs font-bold text-slate-800\">{projectName}</div>"
);

fs.writeFileSync('src/components/DeveloperAssignmentGrid.tsx', code);
console.log("DeveloperAssignmentGrid patched");
