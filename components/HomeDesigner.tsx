
import React, { useState } from 'react';
import { FurnitureItem, PlacedItem } from '../types';
import { Button } from './Button';
import { Sofa, Tv, Lamp, Bed, ShoppingCart, Home as HomeIcon, Monitor, Flower, MousePointer2, Box, Armchair, Library } from 'lucide-react';
import { playSound } from '../utils/sound';

interface HomeDesignerProps {
  balance: number;
  inventory: string[];
  placements: PlacedItem[];
  onPurchase: (item: FurnitureItem) => void;
  onPlace: (item: PlacedItem) => void;
  onRemove: (x: number, y: number) => void;
}

// Updated Catalog with Width and Height
const FURNITURE_CATALOG: FurnitureItem[] = [
  { id: 'chair_basic', name: 'Офисное Кресло', price: 2500, category: 'living', icon: 'chair', width: 1, height: 1 },
  { id: 'desk_wood', name: 'Деревянный Стол', price: 5000, category: 'living', icon: 'sofa', width: 2, height: 1 },
  { id: 'plant_pot', name: 'Комнатный Цветок', price: 1500, category: 'decoration', icon: 'plant', width: 1, height: 1 },
  { id: 'bookshelf', name: 'Книжная Полка', price: 4000, category: 'decoration', icon: 'shelf', width: 1, height: 2 },
  { id: 'tv_4k', name: '4K Телевизор 55"', price: 45000, category: 'electronics', icon: 'tv', width: 2, height: 1 },
  { id: 'gaming_pc', name: 'Игровой ПК (RTX 4080)', price: 250000, category: 'electronics', icon: 'pc', width: 1, height: 1 },
  { id: 'sofa_leather', name: 'Кожаный Диван', price: 60000, category: 'living', icon: 'sofa', width: 2, height: 1 },
  { id: 'bed_king', name: 'Кровать King Size', price: 80000, category: 'living', icon: 'bed', width: 2, height: 2 },
  { id: 'server_rack', name: 'Домашний Сервер', price: 150000, category: 'electronics', icon: 'server', width: 1, height: 2 },
  { id: 'lamp_floor', name: 'Торшер Лофт', price: 8000, category: 'decoration', icon: 'lamp', width: 1, height: 1 },
];

const IconMap: Record<string, React.ReactNode> = {
  sofa: <Sofa size={24} />,
  server: <Box size={24} />,
  lamp: <Lamp size={24} />,
  bed: <Bed size={24} />,
  pc: <Monitor size={24} />,
  plant: <Flower size={24} />,
  chair: <Armchair size={24} />,
  shelf: <Library size={24} />,
  tv: <Tv size={24} />,
};

const GRID_SIZE = 6;

export const HomeDesigner: React.FC<HomeDesignerProps> = ({ 
    balance, inventory, placements, onPurchase, onPlace, onRemove 
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const isPurchased = (id: string) => inventory.includes(id);

  const getPlacedItemAt = (x: number, y: number) => {
    // Check if any item covers this cell
    return placements.find(p => {
        const itemDef = FURNITURE_CATALOG.find(i => i.id === p.itemId);
        if (!itemDef) return false;
        return x >= p.x && x < p.x + itemDef.width && y >= p.y && y < p.y + itemDef.height;
    });
  };

  const checkCollision = (item: FurnitureItem, x: number, y: number) => {
      // Bounds check
      if (x + item.width > GRID_SIZE || y + item.height > GRID_SIZE) return true;

      // Overlap check
      for (let i = 0; i < item.width; i++) {
          for (let j = 0; j < item.height; j++) {
              if (getPlacedItemAt(x + i, y + j)) return true;
          }
      }
      return false;
  };

  const handleGridClick = (x: number, y: number) => {
      const existing = getPlacedItemAt(x, y);
      
      if (existing) {
          onRemove(existing.x, existing.y); // Remove by its origin
          playSound('click');
      } else if (selectedItemId) {
          const itemDef = FURNITURE_CATALOG.find(i => i.id === selectedItemId);
          if (itemDef) {
              if (!checkCollision(itemDef, x, y)) {
                onPlace({ itemId: selectedItemId, x, y });
                setSelectedItemId(null);
                playSound('success');
              } else {
                playSound('error');
              }
          }
      }
  };

  const handlePurchaseClick = (item: FurnitureItem) => {
      if (balance >= item.price) {
          onPurchase(item);
          playSound('coin');
      } else {
          playSound('error');
      }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-6xl mx-auto animate-fade-in">
      
      {/* Interactive Room Grid */}
      <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 shadow-xl flex flex-col h-[600px] backdrop-blur-sm">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2 font-mono">
                <HomeIcon className="text-indigo-400" /> ПЛАН КВАРТИРЫ
            </h3>
            <div className="text-xs text-slate-400">
                {selectedItemId ? 'Выберите клетку для установки' : 'Нажмите на предмет, чтобы убрать'}
            </div>
        </div>
        
        <div className="flex-1 bg-slate-900 rounded-xl relative border-2 border-slate-700 p-4 flex items-center justify-center overflow-hidden">
             {/* 3D Grid Effect Background */}
             <div className="absolute inset-0 bg-[linear-gradient(rgba(71,85,105,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(71,85,105,0.2)_1px,transparent_1px)] bg-[size:16.66%_16.66%] pointer-events-none transform perspective-1000 rotate-x-10 scale-110"></div>

             <div className="grid grid-cols-6 grid-rows-6 gap-2 relative z-10 p-2 bg-slate-800/30 rounded-lg border border-slate-700/50 aspect-square h-full w-full max-w-[500px] max-h-[500px]">
                {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                    const x = i % GRID_SIZE;
                    const y = Math.floor(i / GRID_SIZE);
                    
                    // We only render the item if this cell is its ORIGIN (x, y)
                    // If this cell is covered by an item but not the origin, we render nothing (invisible filler)
                    const placedItem = placements.find(p => p.x === x && p.y === y);
                    const isCovered = getPlacedItemAt(x, y);

                    // If it is covered by an item but not the origin, don't render a click target for the grid underneath, 
                    // but we do need the visual space. Actually, the grid cells are fixed.
                    // We will render the item ON TOP of the cells using absolute positioning relative to the grid container?
                    // No, CSS Grid allows col-span.
                    
                    if (placedItem) {
                         const itemDef = FURNITURE_CATALOG.find(it => it.id === placedItem.itemId);
                         if (!itemDef) return null;
                         
                         return (
                            <div 
                                key={i}
                                onClick={() => handleGridClick(x, y)}
                                style={{ 
                                    gridColumn: `span ${itemDef.width}`, 
                                    gridRow: `span ${itemDef.height}` 
                                }}
                                className={`
                                    rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer border relative group
                                    bg-indigo-600/20 border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.3)] hover:bg-red-500/20 hover:border-red-500
                                `}
                            >
                                <div className="text-indigo-300 scale-150">{IconMap[itemDef.icon] || <Box size={24}/>}</div>
                                {itemDef.width > 1 || itemDef.height > 1 ? (
                                    <div className="absolute bottom-1 right-1 text-[10px] text-indigo-200 bg-indigo-900/50 px-1 rounded">
                                        {itemDef.width}x{itemDef.height}
                                    </div>
                                ) : null}
                            </div>
                         );
                    }
                    
                    // If this cell is part of an item but not the origin, do not render a cell div at all 
                    // (since the origin cell spans across this one).
                    // BUT: We need to check if ANY item covers this.
                    // If an item covers this cell but is not the origin, we must output NOTHING so the grid layout flows correctly.
                    if (isCovered && !placedItem) {
                        return null; 
                    }

                    // Empty cell
                    return (
                        <div 
                            key={i}
                            onClick={() => handleGridClick(x, y)}
                            className={`
                                rounded-lg flex items-center justify-center transition-all cursor-pointer border
                                ${selectedItemId ? 'bg-slate-700/50 border-slate-600 hover:bg-green-500/20 hover:border-green-500 animate-pulse' : 'bg-slate-800/50 border-slate-700 hover:bg-slate-700'}
                            `}
                        >
                            <div className="w-1 h-1 bg-slate-600 rounded-full" />
                        </div>
                    );
                })}
             </div>
        </div>
      </div>

      {/* Inventory & Shop */}
      <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 shadow-xl overflow-hidden flex flex-col h-[600px] backdrop-blur-sm">
         <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 font-mono">
            <ShoppingCart className="text-green-400" /> МАГАЗИН МЕБЕЛИ
        </h3>
        
        <div className="overflow-y-auto pr-2 space-y-3 flex-1">
            {FURNITURE_CATALOG.map((item) => {
                const purchased = isPurchased(item.id);
                const canAfford = balance >= item.price;
                const isSelected = selectedItemId === item.id;

                return (
                    <div key={item.id} className={`flex items-center justify-between bg-slate-900/50 p-3 rounded-xl border transition-colors ${isSelected ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-700'}`}>
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-slate-800 rounded-lg text-slate-300 shadow-inner">
                                {IconMap[item.icon] || <Box size={24}/>}
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-sm">{item.name}</h4>
                                <div className="flex gap-2 text-xs">
                                     <span className="text-slate-400 font-mono">{item.price.toLocaleString()} CR</span>
                                     <span className="text-slate-500 bg-slate-800 px-1 rounded">{item.width}x{item.height}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                            {purchased ? (
                                <div className="flex gap-2">
                                     <Button 
                                        size="sm" 
                                        variant={isSelected ? 'success' : 'outline'}
                                        onClick={() => {
                                            setSelectedItemId(isSelected ? null : item.id);
                                            playSound('click');
                                        }}
                                        className="text-xs px-2 py-1 h-8"
                                    >
                                        {isSelected ? <MousePointer2 size={14} className="animate-bounce" /> : <Box size={14}/>}
                                        {isSelected ? ' Ставим...' : ' Поставить'}
                                    </Button>
                                </div>
                            ) : (
                                <Button 
                                    size="sm" 
                                    variant={canAfford ? 'primary' : 'outline'}
                                    disabled={!canAfford}
                                    onClick={() => handlePurchaseClick(item)}
                                    className="text-xs"
                                >
                                    Купить
                                </Button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
};
