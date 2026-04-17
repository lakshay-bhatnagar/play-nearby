import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Plus, Minus, Trash2, ShoppingBag, CreditCard, Smartphone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { SPORT_ICONS } from '@/types';

export interface CartItem { id: string; qty: number; mode: 'buy' | 'rent'; }
export interface ProductInfo { id: string; name: string; sport: string; price: number; rent_price_per_day: number; }

const CART_KEY = 'pulseplay_cart';

export const cartStore = {
  get(): CartItem[] {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { return []; }
  },
  set(items: CartItem[]) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('cart-updated'));
  },
  add(id: string, mode: 'buy' | 'rent') {
    const items = cartStore.get();
    const existing = items.find(i => i.id === id && i.mode === mode);
    if (existing) existing.qty += 1;
    else items.push({ id, qty: 1, mode });
    cartStore.set(items);
  },
  update(id: string, mode: 'buy' | 'rent', qty: number) {
    let items = cartStore.get();
    if (qty <= 0) items = items.filter(i => !(i.id === id && i.mode === mode));
    else items = items.map(i => (i.id === id && i.mode === mode) ? { ...i, qty } : i);
    cartStore.set(items);
  },
  clear() { cartStore.set([]); },
  count(): number { return cartStore.get().reduce((s, i) => s + i.qty, 0); },
};

export default function CartPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<ProductInfo[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card'>('upi');
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    const loadCart = async () => {
      const cart = cartStore.get();
      setItems(cart);
      if (cart.length > 0) {
        const ids = [...new Set(cart.map(c => c.id))];
        const { data } = await supabase.from('products').select('*').in('id', ids);
        setProducts((data as any[]) || []);
      }
    };
    loadCart();
    const onUpdate = () => loadCart();
    window.addEventListener('cart-updated', onUpdate);
    return () => window.removeEventListener('cart-updated', onUpdate);
  }, []);

  const update = (id: string, mode: 'buy' | 'rent', qty: number) => {
    cartStore.update(id, mode, qty);
    setItems(cartStore.get());
  };

  const equipmentCost = items.reduce((sum, i) => {
    const p = products.find(pr => pr.id === i.id);
    if (!p) return sum;
    return sum + (i.mode === 'buy' ? Number(p.price) : Number(p.rent_price_per_day)) * i.qty;
  }, 0);
  const cgst = Math.round(equipmentCost * 0.09 * 100) / 100;
  const sgst = Math.round(equipmentCost * 0.09 * 100) / 100;
  const total = equipmentCost + cgst + sgst;

  const handleCheckout = async () => {
    if (!user || items.length === 0) return;
    setCheckingOut(true);
    const { data: order, error } = await supabase.from('orders').insert({
      user_id: user.id, venue_cost: 0, equipment_cost: equipmentCost, cgst, sgst, total_amount: total,
      payment_method: paymentMethod, status: 'completed',
    }).select().single();

    if (error || !order) {
      toast({ title: 'Error', description: error?.message, variant: 'destructive' });
      setCheckingOut(false); return;
    }

    const orderItems = items.map(i => {
      const p = products.find(pr => pr.id === i.id)!;
      return {
        order_id: order.id, product_id: i.id, quantity: i.qty, mode: i.mode,
        unit_price: i.mode === 'buy' ? p.price : p.rent_price_per_day,
        return_date: i.mode === 'rent' ? new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0] : null,
      };
    });
    await supabase.from('order_items').insert(orderItems);
    await supabase.from('payments').insert({ order_id: order.id, user_id: user.id, payment_type: 'equipment', amount: total, payment_method: paymentMethod, status: 'completed' });

    cartStore.clear();
    setCheckingOut(false);
    navigate(`/payment-confirmation/${order.id}`, { replace: true });
  };

  return (
    <div className="min-h-dvh bg-background pb-32 overflow-x-hidden relative">
      <div className="px-5 pt-12 relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-muted-foreground active:scale-90 transition-transform">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Cart</h1>
        </div>

        {items.length === 0 ? (
          <div className="p-12 text-center mt-10">
            <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-sm">Your cart is empty</p>
            <button onClick={() => navigate('/equips')} className="mt-4 px-5 py-2.5 rounded-xl bg-neon-blue text-primary-foreground text-sm font-semibold">Browse Equips</button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3">
              {items.map((item, i) => {
                const p = products.find(pr => pr.id === item.id);
                if (!p) return null;
                const unit = item.mode === 'buy' ? Number(p.price) : Number(p.rent_price_per_day);
                return (
                  <motion.div key={`${item.id}-${item.mode}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="p-4 rounded-2xl bg-card border border-border flex items-center gap-3">
                    <div className="text-3xl">{SPORT_ICONS[p.sport] || '🏅'}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground text-sm truncate">{p.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${item.mode === 'rent' ? 'bg-neon-green/15 text-neon-green' : 'bg-neon-blue/15 text-neon-blue'}`}>
                          {item.mode === 'rent' ? 'Rent' : 'Buy'}
                        </span>
                        <span className="text-xs font-mono text-muted-foreground">₹{unit}{item.mode === 'rent' && '/day'}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1">
                        <button onClick={() => update(item.id, item.mode, item.qty - 1)} className="w-7 h-7 rounded-full bg-secondary border border-border flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                        <span className="font-mono text-xs w-5 text-center">{item.qty}</span>
                        <button onClick={() => update(item.id, item.mode, item.qty + 1)} className="w-7 h-7 rounded-full bg-secondary border border-border flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                      </div>
                      <button onClick={() => update(item.id, item.mode, 0)} className="text-destructive">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Bill */}
            <div className="mt-6 p-5 rounded-2xl bg-card border border-border">
              <p className="text-xs font-mono text-muted-foreground tracking-wider uppercase mb-3">Bill Summary</p>
              <Row label="Equipment" value={equipmentCost} />
              <Row label="CGST (9%)" value={cgst} />
              <Row label="SGST (9%)" value={sgst} />
              <div className="h-px bg-border my-3" />
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-foreground">Total</span>
                <span className="text-xl font-bold font-mono text-neon-green">₹{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment method */}
            <div className="mt-5">
              <p className="text-xs font-mono text-muted-foreground tracking-wider uppercase mb-2">Payment Method</p>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setPaymentMethod('upi')}
                  className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${paymentMethod === 'upi' ? 'bg-neon-blue/10 border-neon-blue/30' : 'bg-card border-border'}`}>
                  <Smartphone className={`w-5 h-5 ${paymentMethod === 'upi' ? 'text-neon-blue' : 'text-muted-foreground'}`} />
                  <span className="text-xs font-medium">UPI</span>
                </button>
                <button onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${paymentMethod === 'card' ? 'bg-neon-blue/10 border-neon-blue/30' : 'bg-card border-border'}`}>
                  <CreditCard className={`w-5 h-5 ${paymentMethod === 'card' ? 'text-neon-blue' : 'text-muted-foreground'}`} />
                  <span className="text-xs font-medium">Card</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {items.length > 0 && (
        <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed bottom-6 left-0 right-0 z-40 px-5">
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleCheckout} disabled={checkingOut}
            className="w-full py-4 rounded-2xl bg-neon-green text-accent-foreground font-semibold neon-glow-green flex items-center justify-center gap-3 disabled:opacity-50">
            {checkingOut ? 'Processing...' : `Pay ₹${total.toFixed(0)} & Checkout`}
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-mono text-foreground">₹{value.toFixed(2)}</span>
    </div>
  );
}
