import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, MapPin, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export default function ActivityHistoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { setOrders(data || []); setLoading(false); });
  }, [user]);

  return (
    <div className="min-h-dvh bg-background pb-28">
      <div className="px-5 pt-14 pb-4 relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-muted-foreground active:scale-90 transition-transform"><ChevronLeft className="w-5 h-5" /></button>
          <h1 className="text-xl font-bold text-foreground">Activity History</h1>
        </div>
      </div>
      <div className="px-5 relative z-10 flex flex-col gap-3">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-20 rounded-2xl bg-card border border-border animate-pulse" />)
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-sm">No activity history yet</p>
          </div>
        ) : (
          orders.map((order, i) => (
            <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="p-4 rounded-2xl bg-card border border-border">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${order.status === 'completed' ? 'bg-neon-green/15 text-neon-green' : 'bg-neon-orange/15 text-neon-orange'}`}>{order.status}</span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">{new Date(order.created_at).toLocaleDateString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Venue: ₹{Number(order.venue_cost).toFixed(0)}</span>
                <span>Equipment: ₹{Number(order.equipment_cost).toFixed(0)}</span>
                <span className="font-bold text-foreground">Total: ₹{Number(order.total_amount).toFixed(0)}</span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
