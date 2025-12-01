
export type Tab = 'dashboard' | 'lottery' | 'trading' | 'home' | 'battlepass' | 'mining' | 'settings' | 'work';
export type Theme = 'default' | 'matrix' | 'gold';

export interface FurnitureItem {
  id: string;
  name: string;
  price: number;
  icon: string; // Lucide icon name
  category: 'living' | 'electronics' | 'decoration';
  width: number; // grid cells
  height: number; // grid cells
}

export interface PlacedItem {
  itemId: string;
  x: number;
  y: number;
}

export interface StockPoint {
  time: string;
  price: number;
}

export interface LotteryCell {
  id: number;
  isRevealed: boolean;
  content: 'prize' | 'empty';
}

export interface BattlePassReward {
  level: number;
  xpRequired: number;
  type: 'currency' | 'theme';
  value: number | string; // amount or theme name
  description: string;
  claimed: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  balance: number;
  level: number;
  isUser?: boolean;
}

export interface MiningUpgrade {
  id: string;
  name: string;
  type: 'click' | 'auto';
  baseCost: number;
  basePower: number; // money per click or per second
  level: number;
  costMultiplier: number;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  duration: number; // seconds
  reward: number;
  xpReward: number;
  levelRequired: number;
}
