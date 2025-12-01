import React from 'react';
import { Trophy, Check, Lock, Palette, Coins } from 'lucide-react';
import { Button } from './Button';
import { BattlePassReward, Theme } from '../types';

interface BattlePassProps {
  xp: number;
  rewards: BattlePassReward[];
  onClaim: (level: number) => void;
  currentTheme: Theme;
}

export const BattlePass: React.FC<BattlePassProps> = ({ xp, rewards, onClaim, currentTheme }) => {
  const currentLevel = rewards.filter(r => xp >= r.xpRequired).length;
  const nextReward = rewards.find(r => xp < r.xpRequired);
  const progressToNext = nextReward 
    ? ((xp - (rewards[currentLevel-1]?.xpRequired || 0)) / (nextReward.xpRequired - (rewards[currentLevel-1]?.xpRequired || 0))) * 100
    : 100;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="bg-slate-800/80 p-8 rounded-2xl border border-slate-700 shadow-xl relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-2 bg-slate-700">
            <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000"
                style={{ width: `${Math.min(100, (xp / (rewards[rewards.length-1].xpRequired)) * 100)}%` }}
            />
         </div>
         
         <div className="flex justify-between items-end mb-4 relative z-10">
             <div>
                 <h2 className="text-3xl font-bold text-white mb-2">Battle Pass</h2>
                 <p className="text-slate-400">Уровень {currentLevel} <span className="text-slate-600 mx-2">|</span> {xp} XP</p>
             </div>
             <div className="text-right">
                 <p className="text-sm text-slate-400 mb-1">До следующего уровня</p>
                 <div className="w-64 h-4 bg-slate-700 rounded-full overflow-hidden">
                     <div 
                        className="h-full bg-indigo-500 transition-all duration-500"
                        style={{ width: `${progressToNext}%` }}
                     />
                 </div>
                 <p className="text-xs text-slate-500 mt-1">
                    {nextReward ? `${Math.floor(nextReward.xpRequired - xp)} XP` : 'Максимальный уровень!'}
                 </p>
             </div>
         </div>
      </div>

      <div className="grid gap-4">
        {rewards.map((reward) => {
            const isUnlocked = xp >= reward.xpRequired;
            const isClaimed = reward.claimed;

            return (
                <div 
                    key={reward.level}
                    className={`
                        relative p-6 rounded-xl border flex items-center justify-between transition-all
                        ${isUnlocked 
                            ? (isClaimed ? 'bg-slate-900/50 border-slate-700 opacity-75' : 'bg-slate-800 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.15)]') 
                            : 'bg-slate-900/50 border-slate-800 opacity-50 grayscale'}
                    `}
                >
                    <div className="flex items-center gap-6">
                        <div className={`
                            w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold border-4
                            ${isUnlocked ? 'border-indigo-500 bg-indigo-500/20 text-indigo-400' : 'border-slate-700 bg-slate-800 text-slate-600'}
                        `}>
                            {reward.level}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                {reward.type === 'currency' ? <Coins className="text-yellow-500"/> : <Palette className="text-purple-500"/>}
                                {reward.description}
                            </h3>
                            <p className="text-sm text-slate-400">{reward.xpRequired} XP</p>
                        </div>
                    </div>

                    <div>
                        {isClaimed ? (
                            <div className="flex items-center gap-2 text-green-400 font-bold px-4 py-2 bg-green-400/10 rounded-lg">
                                <Check size={20} /> Получено
                            </div>
                        ) : (
                            <Button 
                                onClick={() => onClaim(reward.level)}
                                disabled={!isUnlocked}
                                variant={isUnlocked ? 'primary' : 'outline'}
                                className={isUnlocked ? 'animate-pulse' : ''}
                            >
                                {isUnlocked ? 'Забрать награду' : <Lock size={18} />}
                            </Button>
                        )}
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
};
