
import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, Activity } from 'lucide-react';
import { Button } from './Button';
import { StockPoint } from '../types';
import { playSound } from '../utils/sound';

interface TradingGameProps {
  balance: number;
  onUpdateBalance: (amount: number) => void;
  onAddXp: (amount: number) => void;
}

export const TradingGame: React.FC<TradingGameProps> = ({ balance, onUpdateBalance, onAddXp }) => {
  const [data, setData] = useState<StockPoint[]>([]);
  const [currentPrice, setCurrentPrice] = useState(100);
  const [ownedShares, setOwnedShares] = useState(0);
  const [trend, setTrend] = useState<'up' | 'down'>('up');
  const priceRef = useRef(100);
  
  // Market Simulation Config
  const maxPoints = 60;
  
  const generateNextPrice = (current: number) => {
    const volatility = 0.02; 
    const changePercent = (Math.random() - 0.5) * 2 * volatility;
    const bias = 0.001; 
    let newPrice = current * (1 + changePercent + bias);
    if (newPrice < 10) newPrice = 10 + Math.random(); 
    if (newPrice > 10000) newPrice = 10000 - Math.random() * 100;

    return parseFloat(newPrice.toFixed(2));
  };

  useEffect(() => {
    const initialData: StockPoint[] = [];
    let price = 100;
    for (let i = 0; i < 60; i++) {
        price = generateNextPrice(price);
        initialData.push({ 
            time: '', 
            price: price
        });
    }
    setData(initialData);
    setCurrentPrice(price);
    priceRef.current = price;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const newPrice = generateNextPrice(priceRef.current);
      priceRef.current = newPrice;
      
      const newPoint = {
        time: new Date().toLocaleTimeString('ru-RU', { second: '2-digit', minute: '2-digit' }),
        price: newPrice
      };

      setData(prevData => {
        const newData = [...prevData, newPoint];
        if (newData.length > maxPoints) newData.shift();
        
        const recent = newData.slice(-10);
        const avgStart = recent[0].price;
        const avgEnd = recent[recent.length-1].price;
        setTrend(avgEnd >= avgStart ? 'up' : 'down');
        
        return newData;
      });
      setCurrentPrice(newPrice);

    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleBuy = (amount: number) => {
      const cost = amount * currentPrice;
      if (balance >= cost) {
          onUpdateBalance(-cost);
          setOwnedShares(prev => prev + amount);
          playSound('click');
      } else {
          playSound('error');
      }
  };

  const handleSell = (amount: number) => {
      if (ownedShares >= amount) {
          const profit = amount * currentPrice;
          onUpdateBalance(profit);
          setOwnedShares(prev => prev - amount);
          
          const xpGain = Math.min(50, Math.ceil(amount / 5));
          onAddXp(xpGain); 
          playSound('coin');
      } else {
          playSound('error');
      }
  };

  const handleBuyAll = () => {
      const maxCanBuy = Math.floor(balance / currentPrice);
      if (maxCanBuy > 0) handleBuy(maxCanBuy);
      else playSound('error');
  }

  const handleSellAll = () => {
      if (ownedShares > 0) handleSell(ownedShares);
      else playSound('error');
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-6xl mx-auto animate-fade-in">
      {/* Chart Section */}
      <div className="lg:col-span-2 bg-slate-800/80 p-6 rounded-2xl border border-slate-700 shadow-xl backdrop-blur-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
             <div className={`p-2 rounded-full ${trend === 'up' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                 <Activity size={24} />
             </div>
             <div>
                 <h2 className="text-2xl font-bold text-white font-mono">BTC/RUB</h2>
                 <p className="text-slate-400 text-xs font-mono">БИРЖА V2.0 (REAL-TIME)</p>
             </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 font-mono mb-1">ТЕКУЩИЙ КУРС</p>
            <p className={`text-4xl font-mono font-bold ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
              {currentPrice.toFixed(2)} ₽
            </p>
          </div>
        </div>

        <div className="h-[400px] w-full bg-slate-900/50 rounded-xl border border-slate-700 p-2 relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(30,41,59,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.5)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
            
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={trend === 'up' ? '#34d399' : '#f87171'} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={trend === 'up' ? '#34d399' : '#f87171'} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <YAxis domain={['auto', 'auto']} orientation="right" tick={{fill: '#64748b', fontSize: 12, fontFamily: 'monospace'}} stroke="#334155" />
              <XAxis dataKey="time" hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '4px' }}
                itemStyle={{ color: '#fff', fontFamily: 'monospace' }}
                labelStyle={{ display: 'none' }}
                formatter={(value: number) => [`${value.toFixed(2)} ₽`, '']}
              />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke={trend === 'up' ? '#34d399' : '#f87171'} 
                fillOpacity={1} 
                fill="url(#colorPrice)" 
                strokeWidth={2}
                animationDuration={300}
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trading Terminal */}
      <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 shadow-xl flex flex-col justify-between backdrop-blur-sm">
        <div>
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 font-mono">
              <Wallet className="text-indigo-400"/>
              ТЕРМИНАЛ
          </h3>
          
          <div className="space-y-4 mb-8">
            <div className="bg-slate-900 p-4 rounded-xl flex justify-between items-center border border-slate-700">
              <span className="text-slate-400 font-mono text-sm">В КОШЕЛЬКЕ</span>
              <span className="text-2xl font-bold text-white font-mono">{ownedShares.toFixed(2)} BTC</span>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl flex justify-between items-center border border-slate-700">
              <span className="text-slate-400 font-mono text-sm">СТОИМОСТЬ</span>
              <span className="text-xl font-mono text-indigo-300">≈ {(ownedShares * currentPrice).toFixed(0)} ₽</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <Button 
                    onClick={() => handleBuy(1)} 
                    variant="success" 
                    className="w-full font-mono"
                    disabled={balance < currentPrice}
                >
                    КУПИТЬ 1
                </Button>
                <Button 
                    onClick={() => handleSell(1)} 
                    variant="danger" 
                    className="w-full font-mono"
                    disabled={ownedShares < 1}
                >
                    ПРОДАТЬ 1
                </Button>
            </div>
             <div className="grid grid-cols-2 gap-3">
                <Button 
                    onClick={handleBuyAll} 
                    variant="outline" 
                    className="w-full text-xs font-mono"
                    disabled={balance < currentPrice}
                >
                    НА ВСЕ
                </Button>
                <Button 
                    onClick={handleSellAll} 
                    variant="outline" 
                    className="w-full text-xs font-mono"
                    disabled={ownedShares <= 0}
                >
                    ПРОДАТЬ ВСЕ
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
};
