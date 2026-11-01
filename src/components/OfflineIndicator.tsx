import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff, AlertTriangle } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-xl bg-slate-900/95 text-amber-300 px-4 py-2.5 text-xs font-semibold shadow-2xl border border-amber-500/30 backdrop-blur-md animate-in slide-in-from-bottom-2 duration-300">
      <div className="relative flex items-center justify-center">
        <WifiOff className="w-4 h-4 text-amber-400" />
        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
      </div>
      <div>
        <p className="font-bold text-white">Offline Mode</p>
        <p className="text-[10px] text-slate-300">Working with cached developer data</p>
      </div>
    </div>
  );
};
