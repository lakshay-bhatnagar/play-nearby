import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ShoppingBag, RotateCcw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export default function EquipHistoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data: orders } = await supabase.from('orders').select('id').eq('user_id', user.id);
      if (!orders || orders.length === 0) { setLoading(false); return; }
      const orderIds = orders.map(o => o.id);
      const { data } = await supabase.from('order_items').select('*, products(name, sport)').in('order_id', orderIds).order('created_at', { ascending: false });
      setItems(data || []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  return (
    <div className="min-h-dvh bg-background pb-28">
      <div className="px-5 pt-14 pb-4 relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-muted-foreground active:scale-90 transition-transform"><ChevronLeft className="w-5 h-5" /></button>
          <h1 className="text-xl font-bold text-foreground">Equip History</h1>
        </div>
      </div>
      <div className="px-5 relative z-10 flex flex-col gap-3">
        {loading ? (
          [1, 2].map(i => <div key={i} className="h-20 rounded-2xl bg-card border border-border animate-pulse" />)
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingBag className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-sm">No equipment purchases yet</p>
          </div>
        ) : (
          items.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="p-4 rounded-2xl bg-card border border-border flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground text-sm">{(item.products as any)?.name || 'Item'}</h3>
                <p className="text-xs text-muted-foreground">{(item.products as any)?.sport} · Qty: {item.quantity}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.mode === 'rent' ? 'bg-neon-green/15 text-neon-green' : 'bg-neon-blue/15 text-neon-blue'}`}>{item.mode === 'rent' ? 'Rented' : 'Bought'}</span>
                  <span className="text-xs font-mono text-muted-foreground">₹{Number(item.unit_price).toFixed(0)} × {item.quantity}</span>
                </div>
              </div>
              {item.mode === 'rent' && item.return_date && (
                <div className="text-right shrink-0">
                  <RotateCcw className="w-3.5 h-3.5 text-neon-orange mx-auto mb-1" />
                  <span className="text-[10px] text-neon-orange font-mono">Return by<br />{new Date(item.return_date).toLocaleDateString('en-IN')}</span>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
