import React from 'react';
import { Palette, Lock, Check } from 'lucide-react';
import { Theme } from '../types';

interface SettingsProps {
  currentTheme: Theme;
  unlockedThemes: Theme[];
  onSetTheme: (theme: Theme) => void;
}

export const Settings: React.FC<SettingsProps> = ({ currentTheme, unlockedThemes, onSetTheme }) => {
  
  const themes: { id: Theme; name: string; color: string }[] = [
    { id: 'default', name: 'Стандартная (Dark Blue)', color: 'bg-slate-900' },
    { id: 'matrix', name: 'Матрица (Hacker Green)', color: 'bg-black border border-green-500' },
    { id: 'gold', name: 'Золотой Магнат (Gold Luxury)', color: 'bg-stone-900 border border-yellow-500' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      <div className="bg-slate-800/80 p-8 rounded-2xl border border-slate-700 shadow-xl backdrop-blur-sm">
        <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3 font-mono">
          <Palette className="text-indigo-400" /> НАСТРОЙКИ
        </h2>

        <div className="space-y-6">
          <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-4">Тема оформления</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {themes.map((t) => {
                const isUnlocked = unlockedThemes.includes(t.id);
                const isActive = currentTheme === t.id;

                return (
                  <button
                    key={t.id}
                    onClick={() => isUnlocked && onSetTheme(t.id)}
                    disabled={!isUnlocked}
                    className={`
                      relative p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-3 h-32 justify-center
                      ${isActive 
                        ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.3)]' 
                        : isUnlocked 
                          ? 'border-slate-600 bg-slate-800 hover:border-slate-500 hover:bg-slate-700' 
                          : 'border-slate-800 bg-slate-900 opacity-60 cursor-not-allowed'}
                    `}
                  >
                    {/* Preview Circle */}
                    <div className={`w-8 h-8 rounded-full ${t.color} shadow-lg`} />
                    
                    <span className={`font-bold ${isActive ? 'text-white' : 'text-slate-400'}`}>
                      {t.name}
                    </span>

                    {isActive && (
                      <div className="absolute top-2 right-2 text-indigo-400">
                        <Check size={16} />
                      </div>
                    )}

                    {!isUnlocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl backdrop-blur-[1px]">
                         <div className="flex items-center gap-2 text-slate-400 bg-black/80 px-3 py-1 rounded-full text-xs">
                           <Lock size={12} /> Battle Pass
                         </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 opacity-70">
            <h3 className="text-xl font-bold text-white mb-2">Звук (Скоро)</h3>
            <p className="text-slate-400 text-sm">Настройки звука будут доступны в следующем обновлении.</p>
          </div>
        </div>
      </div>
    </div>
  );
};