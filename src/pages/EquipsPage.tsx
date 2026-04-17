import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Tag, Plus, Minus } from 'lucide-react';
import { SPORT_ICONS } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cartStore } from './CartPage';

interface Product {
  id: string; name: string; sport: string; price: number; rent_price_per_day: number; description: string | null; can_buy: boolean; can_rent: boolean;
}

export default function EquipsPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const userSports = profile?.sports || [];
  const [filter, setFilter] = useState('All');
  const [mode, setMode] = useState<Record<string, 'buy' | 'rent'>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    supabase.from('products').select('*').eq('in_stock', true)
      .then(({ data }) => { setProducts((data as any[]) || []); setLoading(false); });
    setCartCount(cartStore.count());
    const onCart = () => setCartCount(cartStore.count());
    window.addEventListener('cart-updated', onCart);
    return () => window.removeEventListener('cart-updated', onCart);
  }, []);

  const sports = ['All', ...Array.from(new Set(products.map(p => p.sport)))];
  const filtered = filter === 'All' ? products : products.filter(p => p.sport === filter);
  const sorted = [...filtered].sort((a, b) => {
    const aMatch = userSports.includes(a.sport) ? 0 : 1;
    const bMatch = userSports.includes(b.sport) ? 0 : 1;
    return aMatch - bMatch;
  });

  const getMode = (id: string) => mode[id] || 'buy';

  const handleAdd = (p: Product) => {
    cartStore.add(p.id, getMode(p.id));
    toast({ title: 'Added to cart', description: p.name });
  };

  return (
    <div className="min-h-dvh bg-background pb-28 overflow-x-hidden relative">
      <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-neon-green/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="px-5 pt-14 pb-4 relative z-10">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-xs font-mono text-muted-foreground tracking-wider uppercase">Sports</p>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Equips</h1>
          </div>
          <button onClick={() => navigate('/cart')} className="relative w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center active:scale-90 transition-transform">
            <ShoppingBag className="w-4.5 h-4.5 text-muted-foreground" />
            {cartCount > 0 && <div className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-neon-orange text-[10px] font-bold text-accent-foreground flex items-center justify-center">{cartCount}</div>}
          </button>
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
          <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1"><Tag className="w-3 h-3" /> Showing your sports first</p>
        )}

        {loading ? (
          <div className="grid grid-cols-2 gap-3">{[1, 2, 3, 4].map(i => <div key={i} className="h-56 rounded-3xl bg-card border border-border animate-pulse" />)}</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {sorted.map((product, i) => {
              const currentMode = getMode(product.id);
              return (
                <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-3xl bg-card border border-border p-4 flex flex-col">
                  <div className="text-4xl mb-3 text-center py-4">{SPORT_ICONS[product.sport] || '🏅'}</div>
                  <h3 className="font-semibold text-foreground text-sm leading-tight mb-1">{product.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{product.sport}</p>

                  <div className="flex rounded-xl bg-secondary p-0.5 mb-3">
                    <button onClick={() => setMode(prev => ({ ...prev, [product.id]: 'buy' }))} className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${currentMode === 'buy' ? 'bg-neon-blue/15 text-neon-blue' : 'text-muted-foreground'}`}>Buy</button>
                    <button onClick={() => setMode(prev => ({ ...prev, [product.id]: 'rent' }))} className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${currentMode === 'rent' ? 'bg-neon-green/15 text-neon-green' : 'text-muted-foreground'}`}>Rent</button>
                  </div>

                  <div className="flex items-center justify-between mt-auto">
                    <span className={`font-bold font-mono text-sm ${currentMode === 'buy' ? 'text-neon-blue' : 'text-neon-green'}`}>
                      ₹{currentMode === 'buy' ? product.price : product.rent_price_per_day}
                      {currentMode === 'rent' && <span className="text-[10px] text-muted-foreground font-normal">/day</span>}
                    </span>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleAdd(product)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium ${currentMode === 'buy' ? 'bg-neon-blue/15 text-neon-blue border border-neon-blue/30' : 'bg-neon-green/15 text-neon-green border border-neon-green/30'}`}>
                      Add
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* View cart bar */}
      {cartCount > 0 && (
        <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed bottom-20 left-0 right-0 z-40 px-5">
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate('/cart')}
            className="w-full py-4 rounded-2xl bg-neon-green text-accent-foreground font-semibold neon-glow-green flex items-center justify-center gap-3">
            <ShoppingBag className="w-5 h-5" />
            View Cart · {cartCount} {cartCount === 1 ? 'item' : 'items'}
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
