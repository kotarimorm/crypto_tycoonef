
import React, { useState, useEffect } from 'react';
import { Briefcase, Clock, CheckCircle, Code, PenTool, Search } from 'lucide-react';
import { Button } from './Button';
import { Job } from '../types';
import { playSound } from '../utils/sound';

interface WorkGameProps {
  level: number;
  onUpdateBalance: (amount: number) => void;
  onAddXp: (amount: number) => void;
}

const JOBS: Job[] = [
  { id: 'ad_click', title: 'Клик по рекламе', description: 'Просмотр рекламы для буксов', duration: 3, reward: 50, xpReward: 5, levelRequired: 1 },
  { id: 'captcha', title: 'Ввод капчи', description: 'Разгадывание простого текста', duration: 5, reward: 100, xpReward: 10, levelRequired: 1 },
  { id: 'copywriting', title: 'Написание отзыва', description: 'Положительный отзыв на товар', duration: 10, reward: 300, xpReward: 25, levelRequired: 2 },
  { id: 'design_logo', title: 'Дизайн логотипа', description: 'Простой логотип в векторе', duration: 20, reward: 1500, xpReward: 100, levelRequired: 5 },
  { id: 'bug_fix', title: 'Исправление бага', description: 'Фикс CSS на сайте клиента', duration: 45, reward: 3000, xpReward: 250, levelRequired: 8 },
  { id: 'frontend', title: 'Верстка лендинга', description: 'React + Tailwind CSS', duration: 90, reward: 8000, xpReward: 500, levelRequired: 12 },
  { id: 'smart_contract', title: 'Смарт-контракт', description: 'Разработка токена ERC-20', duration: 180, reward: 20000, xpReward: 1500, levelRequired: 20 },
];

export const WorkGame: React.FC<WorkGameProps> = ({ level, onUpdateBalance, onAddXp }) => {
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: number;
    if (activeJob) {
      const tickRate = 100; // update every 100ms
      const step = 100 / (activeJob.duration * 10); // percent per tick

      interval = window.setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + step;
        });
      }, tickRate);
    }
    return () => clearInterval(interval);
  }, [activeJob]);

  useEffect(() => {
    if (progress >= 100 && activeJob) {
       handleJobComplete();
    }
  }, [progress]);

  const handleStartJob = (job: Job) => {
    if (activeJob) return;
    setActiveJob(job);
    setProgress(0);
    playSound('click');
  };

  const handleJobComplete = () => {
    if (!activeJob) return;
    
    onUpdateBalance(activeJob.reward);
    onAddXp(activeJob.xpReward);
    playSound('success');
    
    // Tiny delay before resetting to show 100%
    setTimeout(() => {
        setActiveJob(null);
        setProgress(0);
    }, 500);
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds} сек`;
    return `${Math.floor(seconds / 60)} мин`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl mx-auto animate-fade-in">
       {/* Active Job Panel */}
       <div className="md:col-span-2 bg-slate-800/80 p-8 rounded-2xl border border-slate-700 shadow-xl backdrop-blur-sm flex flex-col items-center justify-center min-h-[200px]">
          {activeJob ? (
              <div className="w-full max-w-xl text-center">
                  <div className="animate-bounce mb-4 inline-block p-4 rounded-full bg-indigo-600/20 text-indigo-400">
                     <Briefcase size={40} />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Выполняется: {activeJob.title}</h2>
                  <p className="text-slate-400 mb-6">{activeJob.description}</p>
                  
                  <div className="w-full h-6 bg-slate-900 rounded-full overflow-hidden border border-slate-700 relative">
                      <div 
                        className="h-full bg-indigo-500 transition-all duration-100 ease-linear flex items-center justify-center"
                        style={{ width: `${progress}%` }}
                      >
                         {progress > 5 && <span className="text-[10px] font-bold text-white whitespace-nowrap">{Math.floor(progress)}%</span>}
                      </div>
                  </div>
              </div>
          ) : (
              <div className="text-center text-slate-500">
                  <Briefcase size={60} className="mx-auto mb-4 opacity-50" />
                  <p className="text-xl">Выберите заказ из списка ниже</p>
                  <p className="text-sm mt-2">Чем выше уровень, тем дороже заказы</p>
              </div>
          )}
       </div>

       {/* Job List */}
       <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {JOBS.map((job) => {
             const isLocked = level < job.levelRequired;
             const isActive = activeJob?.id === job.id;
             const isWorking = activeJob !== null;

             return (
                 <div 
                    key={job.id}
                    className={`
                        p-6 rounded-xl border flex flex-col justify-between transition-all
                        ${isActive ? 'bg-indigo-900/30 border-indigo-500 shadow-lg' : 'bg-slate-800/50 border-slate-700'}
                        ${isLocked ? 'opacity-50 grayscale' : 'hover:bg-slate-800'}
                    `}
                 >
                     <div>
                         <div className="flex justify-between items-start mb-4">
                             <h3 className="font-bold text-white text-lg">{job.title}</h3>
                             {isLocked && <span className="text-xs bg-red-900/50 text-red-400 px-2 py-1 rounded">LVL {job.levelRequired}</span>}
                         </div>
                         <p className="text-sm text-slate-400 mb-4">{job.description}</p>
                         
                         <div className="flex gap-3 text-xs font-mono text-slate-300 mb-6">
                             <span className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded"><Clock size={12}/> {formatTime(job.duration)}</span>
                             <span className="flex items-center gap-1 bg-green-900/30 text-green-400 px-2 py-1 rounded">+{job.reward} CR</span>
                         </div>
                     </div>

                     <Button 
                        onClick={() => handleStartJob(job)}
                        disabled={isLocked || isWorking}
                        variant={isActive ? 'outline' : 'primary'}
                        className="w-full"
                     >
                         {isActive ? 'В процессе...' : isLocked ? 'Недоступно' : 'Взять заказ'}
                     </Button>
                 </div>
             );
          })}
       </div>
    </div>
  );
};
