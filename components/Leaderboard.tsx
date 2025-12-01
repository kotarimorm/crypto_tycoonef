import React from 'react';
import { Trophy, Medal, User } from 'lucide-react';
import { LeaderboardEntry } from '../types';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ entries }) => {
  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-3 font-mono">
          <Trophy className="text-yellow-500" /> ТОП ИГРОКОВ
        </h2>
        <p className="text-slate-400 mt-2">Самые богатые крипто-магнаты мира</p>
      </div>

      <div className="bg-slate-800/80 rounded-2xl border border-slate-700 shadow-xl overflow-hidden backdrop-blur-sm">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-700 bg-slate-900/50 text-slate-400 font-mono text-sm uppercase tracking-wider">
          <div className="col-span-2 text-center">#</div>
          <div className="col-span-6">Игрок</div>
          <div className="col-span-2 text-right">Уровень</div>
          <div className="col-span-2 text-right">Баланс</div>
        </div>
        
        <div className="divide-y divide-slate-700">
          {entries.map((entry, index) => (
            <div 
              key={index}
              className={`grid grid-cols-12 gap-4 p-4 items-center transition-colors
                ${entry.isUser ? 'bg-indigo-600/20 hover:bg-indigo-600/30 border-l-4 border-indigo-500' : 'hover:bg-slate-700/30'}
              `}
            >
              <div className="col-span-2 flex justify-center">
                {entry.rank === 1 ? <Medal className="text-yellow-400 w-6 h-6" /> :
                 entry.rank === 2 ? <Medal className="text-slate-400 w-6 h-6" /> :
                 entry.rank === 3 ? <Medal className="text-amber-600 w-6 h-6" /> :
                 <span className="font-mono text-slate-500 text-lg">#{entry.rank}</span>}
              </div>
              
              <div className="col-span-6 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${entry.isUser ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                  <User size={16} />
                </div>
                <div>
                  <div className={`font-bold ${entry.isUser ? 'text-indigo-400' : 'text-white'}`}>
                    {entry.name} {entry.isUser && '(Вы)'}
                  </div>
                </div>
              </div>

              <div className="col-span-2 text-right font-mono text-slate-300">
                {entry.level}
              </div>

              <div className="col-span-2 text-right font-mono font-bold text-green-400">
                {(entry.balance / 1000).toFixed(1)}k
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};