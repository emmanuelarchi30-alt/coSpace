'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n/I18nContext';
import { Globe } from 'lucide-react';

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useI18n();

  return (
    <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
      <Globe className="w-3.5 h-3.5 ml-1.5 text-slate-400" />
      <button
        type="button"
        onClick={() => setLanguage('es')}
        className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
          language === 'es'
            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        ES
      </button>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
          language === 'en'
            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        EN
      </button>
    </div>
  );
};

export default LanguageSelector;
