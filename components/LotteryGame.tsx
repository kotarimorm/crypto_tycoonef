
import React, { useState, useEffect } from 'react';
import { Bitcoin, RefreshCw, Lock, Unlock, Cpu, Database } from 'lucide-react';
import { LotteryCell } from '../types';
import { Button } from './Button';
import { playSound } from '../utils/sound';

interface LotteryGameProps {
  balance: number;
  onUpdateBalance: (amount: number) => void;
  onAddXp: (amount: number) => void;
}

const TICKET_COST = 1000;

export const LotteryGame: React.FC<LotteryGameProps> = ({ balance, onUpdateBalance, onAddXp }) => {
  const [cells, setCells] = useState<LotteryCell[]>([]);
  const [gameActive, setGameActive] = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);
  const [message, setMessage] = useState<string>('');
  const [winAmount, setWinAmount] = useState<number | null>(null);

  useEffect(() => {
    resetGrid();
  }, []);

  const resetGrid = () => {
    const newCells: LotteryCell[] = Array.from({ length: 9 }, (_, i) => ({
      id: i,
      isRevealed: false,
      content: 'empty'
    }));
    setCells(newCells);
    setGameActive(false);
    setRevealedCount(0);
    setMessage('Купите ключ дешифрования для начала!');
    setWinAmount(null);
  };

  const startGame = () => {
    if (balance < TICKET_COST) {
      setMessage('Недостаточно крипто-кредитов!');
      playSound('error');
      return;
    }

    onUpdateBalance(-TICKET_COST);
    onAddXp(25);
    playSound('click');
    
    // Distribute 4 prizes (Crypto Coins) randomly
    const newCells: LotteryCell[] = Array.from({ length: 9 }, (_, i) => ({
      id: i,
      isRevealed: false,
      content: 'empty'
    }));

    let prizesPlaced = 0;
    while (prizesPlaced < 4) {
      const idx = Math.floor(Math.random() * 9);
      if (newCells[idx].content === 'empty') {
        newCells[idx].content = 'prize';
        prizesPlaced++;
      }
    }

    setCells(newCells);
    setGameActive(true);
    setRevealedCount(0);
    setMessage('Дешифруйте 3 сектора!');
    setWinAmount(null);
  };

  const handleCellClick = (id: number) => {
    if (!gameActive || revealedCount >= 3) return;

    const cell = cells.find(c => c.id === id);
    if (!cell || cell.isRevealed) return;

    playSound('pop');

    const newCells = cells.map(c => c.id === id ? { ...c, isRevealed: true } : c);
    setCells(newCells);
    
    const newRevealedCount = revealedCount + 1;
    setRevealedCount(newRevealedCount);

    if (newRevealedCount === 3) {
      finishGame(newCells);
    }
  };

  const finishGame = (currentCells: LotteryCell[]) => {
    setGameActive(false);
    
    const revealedPrizes = currentCells.filter(c => c.isRevealed && c.content === 'prize').length;
    
    let prize = 0;
    if (revealedPrizes === 3) {
      prize = 5000;
      setMessage('УСПЕХ! Блок найден! Награда 5000₽');
      onAddXp(100);
      playSound('success');
    } else if (revealedPrizes === 2) {
      prize = 500;
      setMessage('Частичный успех. Награда 500₽');
      onAddXp(25);
      playSound('coin');
    } else {
      prize = 5;
      setMessage('Ошибка хеширования. Утешительный приз 5₽');
      onAddXp(5);
      playSound('error');
    }

    setWinAmount(prize);
    onUpdateBalance(prize);
    
    setTimeout(() => {
        setCells(prev => prev.map(c => ({ ...c, isRevealed: true })));
    }, 500);
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-800/80 rounded-2xl border border-slate-700 shadow-xl max-w-2xl mx-auto w-full backdrop-blur-sm animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500 mb-2 flex items-center justify-center gap-3">
          <Database /> Hash Decryptor
        </h2>
        <p className="text-slate-400 font-mono text-sm">Взломай блокчейн. Найди 3 монеты.</p>
        <div className="mt-4 flex gap-4 text-xs font-mono text-slate-300 justify-center bg-slate-900/50 p-2 rounded-lg border border-slate-700">
            <span className="flex items-center gap-1"><Bitcoin size={14} className="text-yellow-500"/> x3 = 5000₽</span>
            <span className="flex items-center gap-1"><Bitcoin size={14} className="text-yellow-500"/> x2 = 500₽</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8 p-4 bg-slate-950 rounded-xl border border-slate-700 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
        {cells.map((cell) => (
          <button
            key={cell.id}
            onClick={() => handleCellClick(cell.id)}
            disabled={!gameActive && !cell.isRevealed}
            className={`
              w-24 h-24 rounded-lg flex items-center justify-center text-4xl transition-all duration-300 transform relative overflow-hidden
              ${cell.isRevealed 
                ? (cell.content === 'prize' ? 'bg-indigo-900/50 border-2 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-slate-900 border border-slate-800') 
                : 'bg-slate-800 hover:bg-slate-700 border border-slate-600 cursor-pointer'}
              ${!gameActive && !cell.isRevealed ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {cell.isRevealed ? (
              cell.content === 'prize' ? (
                <Bitcoin className="text-yellow-400 w-12 h-12 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)] animate-bounce" />
              ) : (
                <Cpu className="text-slate-700 w-10 h-10" />
              )
            ) : (
              <Lock className="text-slate-500/30 w-8 h-8" />
            )}
          </button>
        ))}
      </div>

      <div className="text-center h-16 mb-4 w-full">
         {winAmount !== null && (
             <div className="animate-pulse text-2xl font-bold text-green-400 flex items-center justify-center gap-2 font-mono border border-green-500/30 bg-green-500/10 py-2 rounded-lg">
                 +{winAmount} CR
             </div>
         )}
         <p className={`text-lg font-mono ${winAmount !== null ? 'hidden' : 'text-cyan-400'}`}>{message}</p>
      </div>

      {!gameActive && (
        <Button onClick={startGame} size="lg" className="w-full max-w-xs animate-pulse font-mono border border-indigo-500/50">
          <Unlock size={18} className="mr-2" /> Купить ключ (1000₽)
        </Button>
      )}
      
      {gameActive && (
         <div className="text-cyan-400 font-bold border border-cyan-500/30 px-4 py-2 rounded-full bg-cyan-900/20 font-mono flex items-center gap-2">
             <Cpu size={16} /> Осталось попыток: {3 - revealedCount}
         </div>
      )}
    </div>
  );
};
