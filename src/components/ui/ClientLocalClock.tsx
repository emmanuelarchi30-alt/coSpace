'use client';

import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface ClientLocalClockProps {
  className?: string;
}

export const ClientLocalClock: React.FC<ClientLocalClockProps> = ({ className = '' }) => {
  const [mounted, setMounted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [timeZone, setTimeZone] = useState<string>('');

  useEffect(() => {
    setMounted(true);
    const updateTime = (): void => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
      setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // During SSR or before mounting, render a predictable skeleton or placeholder to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-400 ${className}`}>
        <Clock className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
        <span>Sincronizando hora local...</span>
      </div>
    );
  }

  return (
    <div
      suppressHydrationWarning
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-500/20 text-xs text-cyan-200 backdrop-blur-md shadow-sm ${className}`}
    >
      <Clock className="w-3.5 h-3.5 text-cyan-400" />
      <span className="font-mono font-medium">{currentTime}</span>
      <span className="text-[10px] uppercase text-cyan-400/70 border-l border-cyan-500/20 pl-2">
        {timeZone}
      </span>
    </div>
  );
};

export default ClientLocalClock;
