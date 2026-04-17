import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Home, Clock, Copy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function PaymentConfirmationPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    supabase.from('orders').select('*').eq('id', orderId).single().then(({ data }) => {
      setOrder(data);
      setLoading(false);
    });
  }, [orderId]);

  const copyId = () => {
    if (order?.friction_id) {
      navigator.clipboard.writeText(order.friction_id);
      toast({ title: 'Booking ID copied!' });
    }
  };

  if (loading) {
    return <div className="min-h-dvh bg-background flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-neon-green border-t-transparent animate-spin" /></div>;
  }

  if (!order) {
    return <div className="min-h-dvh bg-background flex items-center justify-center text-muted-foreground">Order not found</div>;
  }

  const dt = new Date(order.created_at);

  return (
    <div className="min-h-dvh bg-background relative overflow-hidden flex flex-col">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-neon-green/8 blur-[120px] rounded-full pointer-events-none" />

      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 pt-8 pb-32">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-24 h-24 rounded-full bg-neon-green flex items-center justify-center neon-glow-green mb-6"
        >
          <Check className="w-12 h-12 text-accent-foreground" strokeWidth={3} />
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-3xl font-bold text-foreground mb-2">Payment Successful!</motion.h1>
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-muted-foreground text-sm mb-8">Your booking is confirmed</motion.p>

        {/* Booking ID card */}
        <motion.button
          onClick={copyId}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="w-full max-w-sm p-5 rounded-3xl bg-card border-2 border-neon-green/30 mb-4 active:scale-[0.98] transition-transform"
        >
          <p className="text-[10px] font-mono text-muted-foreground tracking-[0.2em] uppercase mb-2">Booking ID</p>
          <div className="flex items-center justify-center gap-2">
            <p className="text-3xl font-bold font-mono text-neon-green">{order.friction_id}</p>
            <Copy className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">Share this ID with the venue partner for verification</p>
        </motion.button>

        {/* Details */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="w-full max-w-sm rounded-3xl bg-card border border-border p-5 flex flex-col gap-3">
          <Row label="Name" value={profile?.name || '—'} />
          <Row label="Date" value={dt.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} />
          <Row label="Time" value={dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
          <Row label="Payment" value={(order.payment_method || 'upi').toUpperCase()} />
          <div className="h-px bg-border my-1" />
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Paid</span>
            <span className="text-xl font-bold font-mono text-neon-green">₹{Number(order.total_amount).toFixed(2)}</span>
          </div>
        </motion.div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-5 z-20 flex flex-col gap-2 max-w-sm mx-auto w-full">
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate('/')}
          className="w-full py-4 rounded-2xl bg-neon-blue text-primary-foreground font-semibold neon-glow-blue flex items-center justify-center gap-2">
          <Home className="w-5 h-5" /> Go to Home
        </motion.button>
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate('/activity-history')}
          className="w-full py-4 rounded-2xl bg-secondary border border-border text-foreground font-semibold flex items-center justify-center gap-2">
          <Clock className="w-5 h-5" /> View Booking History
        </motion.button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs font-mono text-muted-foreground tracking-wider uppercase">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}
