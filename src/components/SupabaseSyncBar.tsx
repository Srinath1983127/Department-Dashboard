import React, { useState, useEffect } from 'react';
import { Database, CloudDownload, CloudUpload, RefreshCw } from 'lucide-react';
import { 
  checkSupabaseConnection, 
  fetchDepartmentConfigsFromSupabase, 
  fetchProjectsFromSupabase,
  saveDepartmentConfigToSupabase,
  saveProjectsToSupabase,
  saveMonthlyFinancialsToSupabase,
  saveDevelopersToSupabase,
  saveAssignmentsToSupabase,
  SUPABASE_URL
} from '../lib/supabase';
import { DepartmentConfig, Project, MonthFinancials, Developer, ProjectAssignment } from '../types';

interface SupabaseSyncBarProps {
  currentConfig: DepartmentConfig;
  currentProjects: Project[];
  currentMonthlyData: MonthFinancials[];
  currentDevelopers: Developer[];
  currentAssignments: ProjectAssignment[];
  onRefreshPresets: () => Promise<any>;
  onLoadConfig: (config: DepartmentConfig) => void;
  onLoadProjects: (projects: Project[]) => void;
  onLoadMonthlyData: (monthlyData: MonthFinancials[]) => void;
  onLoadDevelopers?: (devs: Developer[]) => void;
  onLoadAssignments?: (assignments: ProjectAssignment[]) => void;
  showToast: (message: string) => void;
}

export const SupabaseSyncBar: React.FC<SupabaseSyncBarProps> = ({
  currentConfig,
  currentProjects,
  currentMonthlyData,
  currentDevelopers,
  currentAssignments,
  onRefreshPresets,
  onLoadConfig,
  onLoadProjects,
  onLoadMonthlyData,
  onLoadDevelopers,
  onLoadAssignments,
  showToast
}) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('Checking connection...');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    const verifyConn = async () => {
      const res = await checkSupabaseConnection();
      setIsConnected(res.success);
      setStatusMessage(res.message);
    };
    verifyConn();
  }, []);

  const handleLoadFromSupabase = async () => {
    setIsLoading(true);
    try {
      const refreshedPresets = await onRefreshPresets();
      if (refreshedPresets && refreshedPresets.length > 0) {
        // Find if the currently loaded department ID exists in the refreshed list, and load its latest data
        const activePreset = refreshedPresets.find((p: any) => p.id === currentConfig.id) ||
                             refreshedPresets.find((p: any) => p.config.departmentName.trim().toLowerCase() === 'software development-alpha team') ||
                             refreshedPresets[0];
        onLoadConfig(activePreset.config);
        onLoadMonthlyData(activePreset.monthlyData);
        onLoadProjects(activePreset.projects);
        
        // Load global developers and assignments
        import('../lib/supabase').then(async (m) => {
          const freshDevs = await m.fetchDevelopersFromSupabase();
          if (freshDevs && onLoadDevelopers) onLoadDevelopers(freshDevs);
          const freshAssigns = await m.fetchAssignmentsFromSupabase();
          if (freshAssigns && onLoadAssignments) onLoadAssignments(freshAssigns);
        });

        showToast(`Successfully refreshed and loaded "${activePreset.config.departmentName}" from Supabase database!`);
      } else {
        showToast('Connected to Supabase, but no data records found yet in tables.');
      }
    } catch (err: any) {
      console.error(err);
      showToast('Error loading data from Supabase: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToSupabase = async () => {
    setIsSaving(true);
    try {
      const configRes = await saveDepartmentConfigToSupabase(currentConfig);
      
      let monthlyRes: { success: boolean; error?: string } = { success: true };
      if (configRes.success && configRes.id) {
        monthlyRes = await saveMonthlyFinancialsToSupabase(configRes.id, currentMonthlyData);
      }
      
      const projectsRes = await saveProjectsToSupabase(currentProjects);
      
      const devsRes = await saveDevelopersToSupabase(currentDevelopers);
      const assignsRes = await saveAssignmentsToSupabase(currentAssignments, currentProjects, currentDevelopers);

      if (configRes.success && monthlyRes.success && projectsRes.success && devsRes.success && assignsRes.success) {
        // Refresh presets list so dropdown stays perfectly synced
        await onRefreshPresets();
        
        // Also refresh developers and assignments from DB to get real UUIDs
        import('../lib/supabase').then(async (m) => {
          const freshDevs = await m.fetchDevelopersFromSupabase();
          if (freshDevs && onLoadDevelopers) onLoadDevelopers(freshDevs);
          const freshAssigns = await m.fetchAssignmentsFromSupabase();
          if (freshAssigns && onLoadAssignments) onLoadAssignments(freshAssigns);
        });

        showToast('Successfully updated Department Configuration, Monthly Financials, Projects, & Assignments in Supabase!');
      } else {
        const errorMsg = configRes.error || monthlyRes.error || projectsRes.error || devsRes.error || assignsRes.error || 'Unknown error';
        showToast('Error saving data to database: ' + errorMsg);
      }
    } catch (err: any) {
      console.error(err);
      showToast('Error saving to Supabase: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-slate-900/95 border-b border-slate-800 text-slate-200 py-2 px-4 sm:px-6 lg:px-8 shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {/* Connection Status Indicator */}
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center justify-center p-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-100 flex items-center gap-1.5">
              <span>Supabase Connected</span>
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </span>
            <span className="text-slate-500 hidden md:inline">|</span>
            <span className="text-slate-400 text-[11px] font-mono hidden sm:inline">
              {SUPABASE_URL.replace('https://', '')}
            </span>
          </div>
        </div>



        {/* Sync Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleLoadFromSupabase}
            disabled={isLoading || isSaving}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition-colors disabled:opacity-50 cursor-pointer"
            title="Load latest data from Supabase database"
          >
            {isLoading ? (
              <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
            ) : (
              <CloudDownload className="w-3.5 h-3.5 text-blue-400" />
            )}
            <span>Load from Supabase</span>
          </button>

          <button
            onClick={handleSaveToSupabase}
            disabled={isLoading || isSaving}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/70 text-emerald-200 border border-emerald-700/60 font-medium transition-colors disabled:opacity-50 cursor-pointer"
            title="Save current configuration & projects to Supabase"
          >
            {isSaving ? (
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
            ) : (
              <CloudUpload className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span>Sync to Supabase</span>
          </button>
        </div>
      </div>
    </div>
  );
};
