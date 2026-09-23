import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600/90 border border-amber-400/40 px-3.5 py-2 text-xs font-bold text-white shadow-xl backdrop-blur-md animate-bounce">
      <WifiOff className="h-4 w-4 text-white" />
      <span>Modo Offline — O Miazoom continuará funcionando assim que a conexão retornar.</span>
    </div>
  );
};
