import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Tag, Plus, Minus } from 'lucide-react';
import { SPORT_ICONS } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cartStore, type CartItem } from './CartPage';

interface Product {
  id: string; name: string; sport: string; price: number; rent_price_per_day: number;
  description: string | null; can_buy: boolean; can_rent: boolean; image_url: string | null;
}

// Stock placeholder images by sport — used when product has no image_url
const SPORT_IMAGES: Record<string, string> = {
  Basketball: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=400&fit=crop',
  Football: 'https://images.unsplash.com/photo-1614632537190-23e4146777db?w=400&h=400&fit=crop',
  Tennis: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=400&h=400&fit=crop',
  Badminton: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&h=400&fit=crop',
  Cricket: 'https://images.unsplash.com/photo-1587280501635-068e22f2e10b?w=400&h=400&fit=crop',
  Padel: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&h=400&fit=crop',
  Running: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
  Volleyball: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400&h=400&fit=crop',
  'Table Tennis': 'https://images.unsplash.com/photo-1611251135345-18c56206b863?w=400&h=400&fit=crop',
  Cycling: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&h=400&fit=crop',
  Boxing: 'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=400&h=400&fit=crop',
  Yoga: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400&h=400&fit=crop',
};

export default function EquipsPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const userSports = profile?.sports || [];
  const [filter, setFilter] = useState('All');
  const [mode, setMode] = useState<Record<string, 'buy' | 'rent'>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    supabase.from('products').select('*').eq('in_stock', true)
      .then(({ data }) => { setProducts((data as any[]) || []); setLoading(false); });
    setCart(cartStore.get());
    const onCart = () => setCart(cartStore.get());
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

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const getMode = (id: string) => mode[id] || 'buy';
  const getQty = (id: string, m: 'buy' | 'rent') =>
    cart.find(c => c.id === id && c.mode === m)?.qty || 0;

  const handleAdd = (p: Product) => {
    cartStore.add(p.id, getMode(p.id));
    toast({ title: 'Added to cart', description: p.name });
  };

  const handleQty = (p: Product, m: 'buy' | 'rent', delta: number) => {
    const current = getQty(p.id, m);
    cartStore.update(p.id, m, current + delta);
  };

  const productImage = (p: Product) => p.image_url || SPORT_IMAGES[p.sport] || SPORT_IMAGES.Basketball;

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
            <ShoppingBag className="w-4 h-4 text-muted-foreground" />
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
          <div className="grid grid-cols-2 gap-3">{[1, 2, 3, 4].map(i => <div key={i} className="h-72 rounded-3xl bg-card border border-border animate-pulse" />)}</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {sorted.map((product, i) => {
              const currentMode = getMode(product.id);
              const qty = getQty(product.id, currentMode);
              return (
                <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-3xl bg-card border border-border overflow-hidden flex flex-col">
                  <div className="relative aspect-square overflow-hidden bg-secondary">
                    <img
                      src={productImage(product)}
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = SPORT_IMAGES.Basketball; }}
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-background/70 backdrop-blur-md text-[10px] font-medium text-foreground border border-border">
                      {SPORT_ICONS[product.sport] || '🏅'} {product.sport}
                    </div>
                  </div>

                  <div className="p-3 flex flex-col gap-2 flex-1">
                    <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-2">{product.name}</h3>

                    <div className="flex rounded-xl bg-secondary p-0.5">
                      <button onClick={() => setMode(prev => ({ ...prev, [product.id]: 'buy' }))} className={`flex-1 py-1 rounded-lg text-[11px] font-medium transition-all ${currentMode === 'buy' ? 'bg-neon-blue/15 text-neon-blue' : 'text-muted-foreground'}`}>Buy</button>
                      <button onClick={() => setMode(prev => ({ ...prev, [product.id]: 'rent' }))} className={`flex-1 py-1 rounded-lg text-[11px] font-medium transition-all ${currentMode === 'rent' ? 'bg-neon-green/15 text-neon-green' : 'text-muted-foreground'}`}>Rent</button>
                    </div>

                    <div className="flex items-center justify-between mt-auto gap-2">
                      <span className={`font-bold font-mono text-sm ${currentMode === 'buy' ? 'text-neon-blue' : 'text-neon-green'}`}>
                        ₹{currentMode === 'buy' ? product.price : product.rent_price_per_day}
                        {currentMode === 'rent' && <span className="text-[9px] text-muted-foreground font-normal">/d</span>}
                      </span>
                      <AnimatePresence mode="wait" initial={false}>
                        {qty > 0 ? (
                          <motion.div key="qty" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                            className={`flex items-center gap-1 rounded-xl border ${currentMode === 'buy' ? 'border-neon-blue/30 bg-neon-blue/10' : 'border-neon-green/30 bg-neon-green/10'}`}>
                            <button onClick={() => handleQty(product, currentMode, -1)} className="w-7 h-7 flex items-center justify-center active:scale-90 transition-transform">
                              <Minus className={`w-3 h-3 ${currentMode === 'buy' ? 'text-neon-blue' : 'text-neon-green'}`} />
                            </button>
                            <span className={`text-xs font-mono font-bold w-4 text-center ${currentMode === 'buy' ? 'text-neon-blue' : 'text-neon-green'}`}>{qty}</span>
                            <button onClick={() => handleQty(product, currentMode, 1)} className="w-7 h-7 flex items-center justify-center active:scale-90 transition-transform">
                              <Plus className={`w-3 h-3 ${currentMode === 'buy' ? 'text-neon-blue' : 'text-neon-green'}`} />
                            </button>
                          </motion.div>
                        ) : (
                          <motion.button key="add" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                            whileTap={{ scale: 0.9 }} onClick={() => handleAdd(product)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium ${currentMode === 'buy' ? 'bg-neon-blue/15 text-neon-blue border border-neon-blue/30' : 'bg-neon-green/15 text-neon-green border border-neon-green/30'}`}>
                            Add
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
