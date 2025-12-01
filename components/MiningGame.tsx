
import React, { useEffect, useState } from 'react';
import { Cpu, Zap, Server, MousePointer2, Lock } from 'lucide-react';
import { Button } from './Button';
import { MiningUpgrade } from '../types';
import { playSound } from '../utils/sound';

interface MiningGameProps {
  balance: number;
  upgrades: MiningUpgrade[];
  onUpdateBalance: (amount: number) => void;
  onAddXp: (amount: number) => void;
  onUpgrade: (id: string) => void;
}

const MAX_LEVEL = 15;

export const MiningGame: React.FC<MiningGameProps> = ({ 
  balance, 
  upgrades, 
  onUpdateBalance, 
  onAddXp, 
  onUpgrade 
}) => {
  const [clickEffect, setClickEffect] = useState<{id: number, x: number, y: number, value: number}[]>([]);

  // Calculate totals
  const autoIncome = upgrades.filter(u => u.type === 'auto').reduce((acc, u) => acc + (u.basePower * u.level), 0);
  const clickPower = 1 + upgrades.filter(u => u.type === 'click').reduce((acc, u) => acc + (u.basePower * u.level), 0);

  // Auto-mining loop handled here for visual feedback, but money logic is likely fine here if component stays mounted. 
  // NOTE: If component unmounts, auto-mining stops. This is acceptable for this simple game type, 
  // or `App.tsx` could handle the interval. For now, we keep it active only when tab is open.
  useEffect(() => {
    if (autoIncome === 0) return;
    const interval = setInterval(() => {
      onUpdateBalance(autoIncome);
    }, 1000);
    return () => clearInterval(interval);
  }, [autoIncome, onUpdateBalance]);

  const handleMine = (e: React.MouseEvent) => {
    onUpdateBalance(clickPower);
    playSound('pop');
    
    // XP Nerf: Only 10% chance to get 1 XP per click
    if (Math.random() > 0.9) {
        onAddXp(1);
    }

    // Visual effect
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newEffect = { id: Date.now(), x, y, value: clickPower };
    setClickEffect(prev => [...prev, newEffect]);

    setTimeout(() => {
      setClickEffect(prev => prev.filter(ef => ef.id !== newEffect.id));
    }, 800);
  };

  const handleBuyUpgrade = (id: string) => {
    const u = upgrades.find(up => up.id === id);
    if (!u) return;

    if (u.level >= MAX_LEVEL) {
        playSound('error');
        return;
    }

    const cost = Math.floor(u.baseCost * Math.pow(u.costMultiplier, u.level));
    if (balance >= cost) {
      playSound('success');
      onUpgrade(id);
    } else {
      playSound('error');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-6xl mx-auto animate-fade-in">
      
      {/* Mining Area */}
      <div className="bg-slate-800/80 p-8 rounded-2xl border border-slate-700 shadow-xl flex flex-col items-center justify-center min-h-[500px] backdrop-blur-sm relative overflow-hidden">
        
        {/* Background Animation */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
             <div className="absolute top-10 left-10 animate-pulse"><Cpu size={40} className="text-indigo-500" /></div>
             <div className="absolute bottom-20 right-20 animate-bounce"><Server size={40} className="text-cyan-500" /></div>
        </div>

        <div className="text-center mb-8 z-10">
          <h2 className="text-4xl font-bold text-white font-mono mb-2">МАЙНИНГ ФЕРМА</h2>
          <div className="flex gap-4 justify-center text-sm font-mono">
            <div className="bg-slate-900/80 px-4 py-2 rounded-lg border border-slate-700 text-green-400 flex items-center gap-2">
              <Zap size={16} /> {autoIncome} RUB/сек
            </div>
            <div className="bg-slate-900/80 px-4 py-2 rounded-lg border border-slate-700 text-indigo-400 flex items-center gap-2">
              <MousePointer2 size={16} /> {clickPower} RUB/клик
            </div>
          </div>
        </div>

        <button 
          onClick={handleMine}
          className="relative group w-64 h-64 rounded-full bg-gradient-to-br from-indigo-600 to-blue-700 border-8 border-slate-800 shadow-[0_0_50px_rgba(79,70,229,0.3)] hover:scale-105 active:scale-95 transition-all duration-100 flex items-center justify-center z-10"
        >
           <div className="absolute inset-0 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-20 animate-ping"></div>
           <Cpu size={100} className="text-white drop-shadow-lg" />
           
           {/* Click Effects */}
           {clickEffect.map(ef => (
             <span 
                key={ef.id}
                className="absolute text-2xl font-bold text-white pointer-events-none animate-float-up"
                style={{ left: ef.x, top: ef.y }}
             >
               +{ef.value}
             </span>
           ))}
        </button>

        <p className="mt-8 text-slate-400 text-sm animate-pulse">Нажми, чтобы майнить блок...</p>
      </div>

      {/* Upgrades Shop */}
      <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 shadow-xl overflow-hidden flex flex-col h-[600px] backdrop-blur-sm">
         <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 font-mono border-b border-slate-700 pb-4">
            <Server className="text-green-400" /> ОБОРУДОВАНИЕ
        </h3>
        
        <div className="overflow-y-auto pr-2 space-y-3 flex-1">
            {upgrades.map((upgrade) => {
                const currentCost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level));
                const canAfford = balance >= currentCost;
                const isMaxed = upgrade.level >= MAX_LEVEL;

                return (
                    <div key={upgrade.id} className="flex items-center justify-between bg-slate-900/50 p-4 rounded-xl border border-slate-700 hover:border-indigo-500/50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg shadow-inner ${upgrade.type === 'auto' ? 'bg-indigo-900/30 text-indigo-400' : 'bg-green-900/30 text-green-400'}`}>
                                {upgrade.type === 'auto' ? <Server size={24} /> : <MousePointer2 size={24} />}
                            </div>
                            <div>
                                <h4 className="font-bold text-white">{upgrade.name}</h4>
                                <div className="flex gap-2 text-xs font-mono mt-1">
                                    <span className={isMaxed ? 'text-yellow-400 font-bold' : 'text-slate-400'}>
                                        {isMaxed ? 'MAX LVL' : `Ур. ${upgrade.level}`}
                                    </span>
                                    {!isMaxed && (
                                        <span className={upgrade.type === 'auto' ? 'text-indigo-400' : 'text-green-400'}>
                                            +{upgrade.basePower} {upgrade.type === 'auto' ? '/сек' : '/клик'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <Button 
                            size="sm" 
                            variant={isMaxed ? 'outline' : (canAfford ? 'primary' : 'outline')}
                            disabled={!canAfford || isMaxed}
                            onClick={() => handleBuyUpgrade(upgrade.id)}
                            className="min-w-[100px] flex flex-col items-center py-1"
                        >
                            {isMaxed ? (
                                <span className="flex items-center gap-1 text-xs"><Lock size={12}/> МАКС.</span>
                            ) : (
                                <>
                                    <span className="text-xs">Купить</span>
                                    <span className="font-mono text-xs opacity-90">{currentCost} CR</span>
                                </>
                            )}
                        </Button>
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
};
