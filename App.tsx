
import React, { useState, useEffect } from 'react';
import { Wallet, Ticket, TrendingUp, Home, Menu, Coins, Award, Settings as SettingsIcon, Cpu, Palette, Gift, Briefcase } from 'lucide-react';
import { LotteryGame } from './components/LotteryGame';
import { TradingGame } from './components/TradingGame';
import { HomeDesigner } from './components/HomeDesigner';
import { BattlePass } from './components/BattlePass';
import { MiningGame } from './components/MiningGame';
import { Settings } from './components/Settings';
import { Onboarding } from './components/Onboarding';
import { WorkGame } from './components/WorkGame';
import { FurnitureItem, Tab, Theme, BattlePassReward, PlacedItem, MiningUpgrade } from './types';
import { playSound } from './utils/sound';

const generateRewards = (): BattlePassReward[] => {
    const rewards: BattlePassReward[] = [];
    for (let i = 1; i <= 30; i++) {
        const xpRequired = Math.floor(500 * Math.pow(i, 1.4));
        let type: 'currency' | 'theme' = 'currency';
        let value: number | string = i * 2000;
        let desc = `${(value as number).toLocaleString()} CR`;
        if (i === 10) { type = 'theme'; value = 'matrix'; desc = 'Тема: Matrix'; } 
        else if (i === 30) { type = 'theme'; value = 'gold'; desc = 'Тема: Gold Tycoon'; } 
        else if (i % 5 === 0) { value = i * 5000; desc = `BIG BONUS ${(value as number).toLocaleString()} CR`; }
        rewards.push({ level: i, xpRequired, type, value, description: desc, claimed: false });
    }
    return rewards;
};

const INITIAL_REWARDS = generateRewards();

const INITIAL_MINING_UPGRADES: MiningUpgrade[] = [
  { id: 'gpu_1', name: 'GTX 1060 Mining', type: 'auto', baseCost: 500, basePower: 5, level: 0, costMultiplier: 1.5 },
  { id: 'click_1', name: 'Новая мышка', type: 'click', baseCost: 200, basePower: 1, level: 0, costMultiplier: 1.8 },
  { id: 'gpu_2', name: 'RTX 4090 Rig', type: 'auto', baseCost: 5000, basePower: 45, level: 0, costMultiplier: 1.6 },
  { id: 'click_2', name: 'Механич. клавиатура', type: 'click', baseCost: 1500, basePower: 10, level: 0, costMultiplier: 2.0 },
  { id: 'farm_1', name: 'Antminer S19 Pro', type: 'auto', baseCost: 25000, basePower: 250, level: 0, costMultiplier: 1.7 },
];

const App: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [balance, setBalance] = useState<number>(10000);
  const [xp, setXp] = useState<number>(0);
  const [inventory, setInventory] = useState<string[]>([]);
  const [placements, setPlacements] = useState<PlacedItem[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>('default');
  const [rewards, setRewards] = useState<BattlePassReward[]>(INITIAL_REWARDS);
  const [unlockedThemes, setUnlockedThemes] = useState<Theme[]>(['default']);
  const [miningUpgrades, setMiningUpgrades] = useState<MiningUpgrade[]>(INITIAL_MINING_UPGRADES);
  const [lastBonusClaim, setLastBonusClaim] = useState<number>(0);

  // Apply theme to body
  useEffect(() => {
      document.body.className = ''; 
      if (theme === 'matrix') {
          document.body.style.backgroundColor = '#020617';
          document.body.style.color = '#22c55e';
      } else if (theme === 'gold') {
           document.body.style.backgroundColor = '#1c1917';
           document.body.style.color = '#fbbf24';
      } else {
          document.body.style.backgroundColor = '#0f172a';
          document.body.style.color = '#f8fafc';
      }
  }, [theme]);

  const updateBalance = (amount: number) => setBalance(prev => prev + amount);
  const addXp = (amount: number) => setXp(prev => prev + amount);

  const handlePurchase = (item: FurnitureItem) => {
    if (balance >= item.price && !inventory.includes(item.id)) {
      updateBalance(-item.price);
      setInventory(prev => [...prev, item.id]);
    }
  };

  const handlePlaceItem = (item: PlacedItem) => {
      // Remove any existing item at this location first if handled by UI, 
      // but the UI logic usually handles standard replacements. 
      // For multi-cell items, clean up is complex, so we assume `HomeDesigner` sends clean data.
      setPlacements(prev => [...prev.filter(p => !(p.x === item.x && p.y === item.y)), item]);
  };

  const handleRemoveItem = (x: number, y: number) => {
      setPlacements(prev => prev.filter(p => !(p.x === x && p.y === y)));
  };

  const handleClaimReward = (level: number) => {
      const rewardIndex = rewards.findIndex(r => r.level === level);
      if (rewardIndex === -1) return;
      const reward = rewards[rewardIndex];
      if (reward.claimed || xp < reward.xpRequired) return;

      if (reward.type === 'currency') updateBalance(reward.value as number);
      else if (reward.type === 'theme') {
          const newTheme = reward.value as Theme;
          if (!unlockedThemes.includes(newTheme)) setUnlockedThemes(prev => [...prev, newTheme]);
          alert(`Новая тема "${newTheme}" разблокирована!`);
      }
      playSound('success');

      const newRewards = [...rewards];
      newRewards[rewardIndex] = { ...reward, claimed: true };
      setRewards(newRewards);
  };

  const handleMiningUpgrade = (id: string) => {
      setMiningUpgrades(prev => prev.map(u => {
        if (u.id !== id) return u;
        const cost = Math.floor(u.baseCost * Math.pow(u.costMultiplier, u.level));
        if (balance >= cost) {
          updateBalance(-cost);
          return { ...u, level: u.level + 1 };
        }
        return u;
      }));
  };

  const claimDailyBonus = () => {
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      if (now - lastBonusClaim > oneDay) {
          updateBalance(5000);
          addXp(100);
          setLastBonusClaim(now);
          alert('Ежедневный бонус 5000 CR получен!');
          playSound('success');
      } else {
          alert('Бонус уже получен сегодня. Приходите завтра!');
          playSound('error');
      }
  };

  const getThemeClasses = () => {
      if (theme === 'matrix') return "from-green-900 to-black text-green-400";
      if (theme === 'gold') return "from-yellow-900 to-stone-900 text-yellow-400";
      return "from-slate-900 to-slate-950 text-slate-100";
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'lottery': return <LotteryGame balance={balance} onUpdateBalance={updateBalance} onAddXp={addXp} />;
      case 'trading': return <TradingGame balance={balance} onUpdateBalance={updateBalance} onAddXp={addXp} />;
      case 'home': return <HomeDesigner balance={balance} inventory={inventory} placements={placements} onPurchase={handlePurchase} onPlace={handlePlaceItem} onRemove={handleRemoveItem}/>;
      case 'battlepass': return <BattlePass xp={xp} rewards={rewards} onClaim={handleClaimReward} currentTheme={theme} />;
      case 'mining': return <MiningGame balance={balance} upgrades={miningUpgrades} onUpdateBalance={updateBalance} onAddXp={addXp} onUpgrade={handleMiningUpgrade} />;
      case 'work': return <WorkGame level={Math.floor(xp/2000) + 1} onUpdateBalance={updateBalance} onAddXp={addXp} />;
      case 'settings': return <Settings currentTheme={theme} unlockedThemes={unlockedThemes} onSetTheme={setTheme} />;
      default:
        const canClaimBonus = Date.now() - lastBonusClaim > 24 * 60 * 60 * 1000;
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 animate-fade-in relative z-10">
             <div className={`p-8 rounded-full border mb-4 shadow-[0_0_50px_rgba(255,255,255,0.1)] transition-colors ${theme === 'matrix' ? 'bg-green-500/10 border-green-500/30' : theme === 'gold' ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-indigo-500/10 border-indigo-500/30'}`}>
                <Coins size={80} className={theme === 'matrix' ? 'text-green-500' : theme === 'gold' ? 'text-yellow-500' : 'text-indigo-400'} />
             </div>
             <div>
                <h1 className="text-5xl font-extrabold text-white mb-4 tracking-tight font-mono">
                    CRYPTO <span className={`text-transparent bg-clip-text bg-gradient-to-r ${theme === 'matrix' ? 'from-green-400 to-emerald-600' : theme === 'gold' ? 'from-yellow-400 to-amber-600' : 'from-indigo-400 to-purple-400'}`}>TYCOON</span>
                </h1>
                <p className="text-xl text-slate-400 max-w-lg mx-auto mb-2">
                    Привет, <span className="text-white font-bold">{username}</span>! Построй свою империю.
                </p>
                
                {canClaimBonus && (
                    <button onClick={claimDailyBonus} className="mt-4 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center gap-2 mx-auto animate-pulse">
                        <Gift size={20} /> ЗАБРАТЬ ЕЖЕДНЕВНЫЙ БОНУС
                    </button>
                )}
             </div>
             
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-5xl mt-12">
                <button onClick={() => setActiveTab('mining')} className="group p-6 bg-slate-800/80 rounded-2xl border border-slate-700 hover:border-blue-500/50 hover:bg-slate-700 transition-all duration-300">
                    <Cpu className="w-10 h-10 text-blue-500 mb-4 mx-auto group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-bold text-white">Майнинг</h3>
                    <p className="text-slate-400 text-sm mt-2">Добыча крипты</p>
                </button>
                <button onClick={() => setActiveTab('work')} className="group p-6 bg-slate-800/80 rounded-2xl border border-slate-700 hover:border-pink-500/50 hover:bg-slate-700 transition-all duration-300">
                    <Briefcase className="w-10 h-10 text-pink-500 mb-4 mx-auto group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-bold text-white">Фриланс</h3>
                    <p className="text-slate-400 text-sm mt-2">Задания</p>
                </button>
                <button onClick={() => setActiveTab('trading')} className="group p-6 bg-slate-800/80 rounded-2xl border border-slate-700 hover:border-green-500/50 hover:bg-slate-700 transition-all duration-300">
                    <TrendingUp className="w-10 h-10 text-green-500 mb-4 mx-auto group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-bold text-white">Биржа</h3>
                    <p className="text-slate-400 text-sm mt-2">Торговля</p>
                </button>
                <button onClick={() => setActiveTab('home')} className="group p-6 bg-slate-800/80 rounded-2xl border border-slate-700 hover:border-purple-500/50 hover:bg-slate-700 transition-all duration-300">
                    <Home className="w-10 h-10 text-purple-500 mb-4 mx-auto group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-bold text-white">Дом</h3>
                    <p className="text-slate-400 text-sm mt-2">Твоя база</p>
                </button>
             </div>
          </div>
        );
    }
  };

  const NavItem = ({ tab, icon: Icon, label }: { tab: Tab, icon: any, label: string }) => (
    <button
      onClick={() => { setActiveTab(tab); setMobileMenuOpen(false); playSound('click'); }}
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg w-full transition-all duration-200 font-mono
        ${activeTab === tab 
          ? `text-white shadow-lg ${theme === 'matrix' ? 'bg-green-900/50 shadow-green-500/20' : theme === 'gold' ? 'bg-yellow-900/50 shadow-yellow-500/20' : 'bg-indigo-600 shadow-indigo-600/30'}`
          : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  if (!username) {
      return (
          <div className={`flex min-h-screen ${getThemeClasses()}`}>
             <Onboarding onComplete={(n) => { setUsername(n); playSound('success'); }} />
          </div>
      );
  }

  return (
    <div className={`flex min-h-screen overflow-hidden bg-gradient-to-br ${getThemeClasses()} transition-colors duration-1000`}>
      {theme === 'matrix' && (
         <div className="fixed inset-0 opacity-10 pointer-events-none z-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/1/17/Matrix_digital_rain_animation_300px.gif')] bg-cover"></div>
      )}

      <aside className="hidden md:flex flex-col w-64 bg-slate-900/50 backdrop-blur-xl border-r border-white/10 p-6 fixed h-full z-20">
        <div className="flex items-center gap-3 mb-10 px-2 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${theme === 'matrix' ? 'bg-green-600' : theme === 'gold' ? 'bg-yellow-600' : 'bg-indigo-600'}`}>
            <Coins className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-wider font-mono">TYCOON</span>
        </div>
        
        <nav className="space-y-1 flex-1 overflow-y-auto">
          <NavItem tab="dashboard" icon={Menu} label="Главная" />
          <NavItem tab="mining" icon={Cpu} label="Майнинг" />
          <NavItem tab="work" icon={Briefcase} label="Фриланс" />
          <NavItem tab="trading" icon={TrendingUp} label="Биржа" />
          <NavItem tab="lottery" icon={Ticket} label="Лотерея" />
          <NavItem tab="home" icon={Home} label="Дом" />
          <NavItem tab="battlepass" icon={Award} label="Battle Pass" />
          <NavItem tab="settings" icon={SettingsIcon} label="Настройки" />
        </nav>

        <div className="bg-white/5 rounded-xl p-4 border border-white/10 mt-4">
          <p className="text-xs text-slate-400 mb-1 font-mono">БАЛАНС</p>
          <div className="flex items-center gap-2 text-green-400 font-mono text-xl font-bold">
            <Wallet size={20} />
            {balance.toLocaleString()} CR
          </div>
          <div className="mt-2 pt-2 border-t border-white/10">
             <div className="flex justify-between text-xs text-slate-400 mb-1">
                 <span>LVL {Math.floor(xp/2000) + 1}</span>
                 <span>{xp} XP</span>
             </div>
             <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                 <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, (xp % 2000 / 2000)*100)}%`}}></div>
             </div>
          </div>
        </div>
      </aside>

      <div className="md:hidden fixed top-0 w-full bg-slate-900/90 backdrop-blur-md border-b border-white/10 z-50 px-4 py-3 flex justify-between items-center">
         <span className="text-lg font-bold font-mono">TYCOON</span>
         <div className="flex items-center gap-4">
             <div className="text-green-400 font-mono font-bold text-sm">{balance.toLocaleString()} CR</div>
             <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-300">
                 <Menu />
             </button>
         </div>
      </div>

      {mobileMenuOpen && (
          <div className="fixed inset-0 bg-slate-900/95 z-40 flex flex-col p-6 pt-20 md:hidden space-y-4">
             <NavItem tab="dashboard" icon={Menu} label="Главная" />
             <NavItem tab="mining" icon={Cpu} label="Майнинг" />
             <NavItem tab="work" icon={Briefcase} label="Фриланс" />
             <NavItem tab="trading" icon={TrendingUp} label="Биржа" />
             <NavItem tab="lottery" icon={Ticket} label="Лотерея" />
             <NavItem tab="home" icon={Home} label="Дом" />
             <NavItem tab="battlepass" icon={Award} label="Battle Pass" />
             <NavItem tab="settings" icon={SettingsIcon} label="Настройки" />
          </div>
      )}

      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 min-h-screen overflow-y-auto relative z-10">
        <div className="max-w-7xl mx-auto">
            {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
