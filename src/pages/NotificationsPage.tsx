import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Bell } from 'lucide-react';

const MOCK_NOTIFICATIONS = [
  { id: '1', title: 'Welcome to Pulse Play!', desc: 'Find and join games near you', time: 'Just now', read: false },
  { id: '2', title: 'Complete your profile', desc: 'Add your sports preferences for better matches', time: '1h ago', read: false },
  { id: '3', title: 'New games nearby', desc: 'Check out 3 new games in your area', time: '3h ago', read: true },
];

export default function NotificationsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh bg-background pb-28">
      <div className="px-5 pt-14 pb-4 relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-muted-foreground active:scale-90 transition-transform"><ChevronLeft className="w-5 h-5" /></button>
          <h1 className="text-xl font-bold text-foreground">Notifications</h1>
        </div>
      </div>
      <div className="px-5 relative z-10 flex flex-col gap-2">
        {MOCK_NOTIFICATIONS.map((notif, i) => (
          <motion.div key={notif.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className={`p-4 rounded-2xl border flex items-start gap-3 ${notif.read ? 'bg-card border-border' : 'bg-neon-blue/5 border-neon-blue/15'}`}>
            <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${notif.read ? 'bg-secondary' : 'bg-neon-blue/15'}`}>
              <Bell className={`w-4 h-4 ${notif.read ? 'text-muted-foreground' : 'text-neon-blue'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground text-sm">{notif.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{notif.desc}</p>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground shrink-0">{notif.time}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
