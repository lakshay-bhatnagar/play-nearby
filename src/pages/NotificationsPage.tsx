import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Bell, CheckCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Notification {
  id: string; title: string; message: string; is_read: boolean; link: string | null; created_at: string;
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { setNotifications((data as any[]) || []); setLoading(false); });
  }, [user]);

  const markAllRead = async () => {
    if (!user) return;
    const unread = notifications.filter(n => !n.is_read);
    for (const n of unread) {
      await supabase.from('notifications').update({ is_read: true }).eq('id', n.id);
    }
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const timeAgo = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="min-h-dvh bg-background pb-28">
      <div className="px-5 pt-14 pb-4 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-muted-foreground active:scale-90 transition-transform"><ChevronLeft className="w-5 h-5" /></button>
            <h1 className="text-xl font-bold text-foreground">Notifications</h1>
          </div>
          {notifications.some(n => !n.is_read) && (
            <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-neon-blue"><CheckCheck className="w-3.5 h-3.5" />Mark all read</button>
          )}
        </div>
      </div>
      <div className="px-5 relative z-10 flex flex-col gap-2">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-16 rounded-2xl bg-card border border-border animate-pulse" />)
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-sm">No notifications yet</p>
          </div>
        ) : (
          notifications.map((notif, i) => (
            <motion.div key={notif.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              onClick={() => notif.link && navigate(notif.link)}
              className={`p-4 rounded-2xl border flex items-start gap-3 cursor-pointer active:scale-[0.98] transition-transform ${notif.is_read ? 'bg-card border-border' : 'bg-neon-blue/5 border-neon-blue/15'}`}>
              <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${notif.is_read ? 'bg-secondary' : 'bg-neon-blue/15'}`}>
                <Bell className={`w-4 h-4 ${notif.is_read ? 'text-muted-foreground' : 'text-neon-blue'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground text-sm">{notif.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{notif.message}</p>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground shrink-0">{timeAgo(notif.created_at)}</span>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
