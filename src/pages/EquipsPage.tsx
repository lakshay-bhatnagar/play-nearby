import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Tag, Plus, Minus } from 'lucide-react';
import { SPORT_ICONS } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string; name: string; sport: string; price: number; rent_price_per_day: number; description: string | null; can_buy: boolean; can_rent: boolean;
}

export default function EquipsPage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const userSports = profile?.sports || [];
  const [filter, setFilter] = useState('All');
  const [mode, setMode] = useState<Record<string, 'buy' | 'rent'>>({});
  const [cart, setCart] = useState<Record<string, number>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    supabase.from('products').select('*').eq('in_stock', true)
      .then(({ data }) => { setProducts((data as any[]) || []); setLoading(false); });
  }, []);

  const sports = ['All', ...Array.from(new Set(products.map(p => p.sport)))];
  const filtered = filter === 'All' ? products : products.filter(p => p.sport === filter);
  const sorted = [...filtered].sort((a, b) => {
    const aMatch = userSports.includes(a.sport) ? 0 : 1;
    const bMatch = userSports.includes(b.sport) ? 0 : 1;
    return aMatch - bMatch;
  });

  const getMode = (id: string) => mode[id] || 'buy';
  const getQty = (id: string) => cart[id] || 0;

  const totalCost = Object.entries(cart).reduce((sum, [id, qty]) => {
    const p = products.find(pr => pr.id === id);
    if (!p || qty <= 0) return sum;
    return sum + (getMode(id) === 'buy' ? p.price : p.rent_price_per_day) * qty;
  }, 0);

  const cartCount = Object.values(cart).reduce((s, q) => s + q, 0);

  const handleCheckout = async () => {
    if (!user || cartCount === 0) return;
    setCheckingOut(true);
    const equipCost = totalCost;
    const cgst = Math.round(equipCost * 0.09 * 100) / 100;
    const sgst = Math.round(equipCost * 0.09 * 100) / 100;
    const total = equipCost + cgst + sgst;

    const { data: order, error } = await supabase.from('orders').insert({
      user_id: user.id, venue_cost: 0, equipment_cost: equipCost, cgst, sgst, total_amount: total, payment_method: 'upi', status: 'completed',
    }).select().single();

    if (error || !order) { toast({ title: 'Error', description: error?.message, variant: 'destructive' }); setCheckingOut(false); return; }

    const items = Object.entries(cart).filter(([, qty]) => qty > 0).map(([id, qty]) => {
      const p = products.find(pr => pr.id === id)!;
      const m = getMode(id);
      return { order_id: order.id, product_id: id, quantity: qty, mode: m, unit_price: m === 'buy' ? p.price : p.rent_price_per_day, return_date: m === 'rent' ? new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0] : null };
    });
    await supabase.from('order_items').insert(items);
    await supabase.from('payments').insert({ order_id: order.id, user_id: user.id, payment_type: 'equipment', amount: total, payment_method: 'upi', status: 'completed' });

    setCart({}); setCheckingOut(false);
    toast({ title: 'Order placed! 🛒', description: `Total: ₹${total.toFixed(2)}` });
  };

  return (
    <div className="min-h-dvh bg-background pb-28">
      <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-neon-green/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="px-5 pt-14 pb-4 relative z-10">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-xs font-mono text-muted-foreground tracking-wider uppercase">Sports</p>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Equips</h1>
          </div>
          <div className="relative">
            <button className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center">
              <ShoppingBag className="w-4.5 h-4.5 text-muted-foreground" />
            </button>
            {cartCount > 0 && <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-neon-orange text-[10px] font-bold text-accent-foreground flex items-center justify-center">{cartCount}</div>}
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
          <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1"><Tag className="w-3 h-3" /> Showing your sports first</p>
        )}

        {loading ? (
          <div className="grid grid-cols-2 gap-3">{[1, 2, 3, 4].map(i => <div key={i} className="h-56 rounded-3xl bg-card border border-border animate-pulse" />)}</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {sorted.map((product, i) => {
              const currentMode = getMode(product.id);
              const qty = getQty(product.id);
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
                    {qty > 0 ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => setCart(prev => ({ ...prev, [product.id]: Math.max(0, qty - 1) }))} className="w-7 h-7 rounded-full bg-secondary border border-border flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                        <span className="font-mono text-xs w-4 text-center">{qty}</span>
                        <button onClick={() => setCart(prev => ({ ...prev, [product.id]: qty + 1 }))} className="w-7 h-7 rounded-full bg-secondary border border-border flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                      </div>
                    ) : (
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => setCart(prev => ({ ...prev, [product.id]: 1 }))}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium ${currentMode === 'buy' ? 'bg-neon-blue/15 text-neon-blue border border-neon-blue/30' : 'bg-neon-green/15 text-neon-green border border-neon-green/30'}`}>
                        Add
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Checkout bar */}
      {cartCount > 0 && (
        <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed bottom-20 left-0 right-0 z-40 px-5">
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleCheckout} disabled={checkingOut}
            className="w-full py-4 rounded-2xl bg-neon-green text-accent-foreground font-semibold neon-glow-green flex items-center justify-center gap-3 disabled:opacity-50">
            <ShoppingBag className="w-5 h-5" />
            {checkingOut ? 'Processing...' : `Checkout · ₹${totalCost.toFixed(0)} (${cartCount} items)`}
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
