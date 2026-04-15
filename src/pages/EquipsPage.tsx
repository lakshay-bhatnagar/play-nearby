import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Tag } from 'lucide-react';
import { SPORT_ICONS } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

const MOCK_PRODUCTS = [
  { id: '1', name: 'Pro Basketball', sport: 'Basketball', price: 49.99, rentPrice: 5.99, image: '🏀' },
  { id: '2', name: 'Tennis Racket Pro', sport: 'Tennis', price: 129.99, rentPrice: 12.99, image: '🎾' },
  { id: '3', name: 'Running Shoes Elite', sport: 'Running', price: 179.99, rentPrice: 15.99, image: '👟' },
  { id: '4', name: 'Padel Racket Carbon', sport: 'Padel', price: 89.99, rentPrice: 8.99, image: '🏸' },
  { id: '5', name: 'Football Official', sport: 'Football', price: 39.99, rentPrice: 3.99, image: '⚽' },
  { id: '6', name: 'Badminton Shuttle Pack', sport: 'Badminton', price: 14.99, rentPrice: 2.99, image: '🏸' },
  { id: '7', name: 'Yoga Mat Premium', sport: 'Yoga', price: 59.99, rentPrice: 4.99, image: '🧘' },
  { id: '8', name: 'Boxing Gloves Pro', sport: 'Boxing', price: 69.99, rentPrice: 7.99, image: '🥊' },
];

export default function EquipsPage() {
  const { profile } = useAuth();
  const userSports = profile?.sports || [];
  const [filter, setFilter] = useState('All');
  const [mode, setMode] = useState<Record<string, 'buy' | 'rent'>>({});

  const sports = ['All', ...Array.from(new Set(MOCK_PRODUCTS.map(p => p.sport)))];

  const filtered = filter === 'All'
    ? MOCK_PRODUCTS
    : MOCK_PRODUCTS.filter(p => p.sport === filter);

  // Prioritize user's sports
  const sorted = [...filtered].sort((a, b) => {
    const aMatch = userSports.includes(a.sport) ? 0 : 1;
    const bMatch = userSports.includes(b.sport) ? 0 : 1;
    return aMatch - bMatch;
  });

  const getMode = (id: string) => mode[id] || 'buy';
  const toggleMode = (id: string) => setMode(prev => ({ ...prev, [id]: prev[id] === 'rent' ? 'buy' : 'rent' }));

  return (
    <div className="min-h-dvh bg-background pb-28">
      <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-neon-green/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="px-5 pt-14 pb-4 relative z-10">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-xs font-mono text-muted-foreground tracking-wider uppercase">Sports</p>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Equips</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center">
              <ShoppingBag className="w-4.5 h-4.5 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mt-4 -mx-5 px-5">
          {sports.map(sport => (
            <motion.button key={sport} whileTap={{ scale: 0.93 }} onClick={() => setFilter(sport)} className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${filter === sport ? 'bg-neon-green text-accent-foreground neon-glow-green' : 'bg-secondary border border-border text-secondary-foreground'}`}>
              {sport !== 'All' && <span className="mr-1.5">{SPORT_ICONS[sport] || '🏅'}</span>}{sport}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="px-5 relative z-10">
        {userSports.length > 0 && filter === 'All' && (
          <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
            <Tag className="w-3 h-3" /> Showing your sports first
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          {sorted.map((product, i) => {
            const currentMode = getMode(product.id);
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-3xl bg-card border border-border p-4 flex flex-col"
              >
                <div className="text-4xl mb-3 text-center py-4">{product.image}</div>
                <h3 className="font-semibold text-foreground text-sm leading-tight mb-1">{product.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{product.sport}</p>

                {/* Buy/Rent toggle */}
                <div className="flex rounded-xl bg-secondary p-0.5 mb-3">
                  <button onClick={() => setMode(prev => ({ ...prev, [product.id]: 'buy' }))} className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${currentMode === 'buy' ? 'bg-neon-blue/15 text-neon-blue' : 'text-muted-foreground'}`}>Buy</button>
                  <button onClick={() => setMode(prev => ({ ...prev, [product.id]: 'rent' }))} className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${currentMode === 'rent' ? 'bg-neon-green/15 text-neon-green' : 'text-muted-foreground'}`}>Rent</button>
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <span className={`font-bold font-mono text-sm ${currentMode === 'buy' ? 'text-neon-blue' : 'text-neon-green'}`}>
                    ${currentMode === 'buy' ? product.price : product.rentPrice}
                    {currentMode === 'rent' && <span className="text-[10px] text-muted-foreground font-normal">/day</span>}
                  </span>
                  <motion.button whileTap={{ scale: 0.9 }} className={`px-3 py-1.5 rounded-xl text-xs font-medium ${currentMode === 'buy' ? 'bg-neon-blue/15 text-neon-blue border border-neon-blue/30' : 'bg-neon-green/15 text-neon-green border border-neon-green/30'}`}>
                    {currentMode === 'buy' ? 'Add' : 'Rent'}
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
