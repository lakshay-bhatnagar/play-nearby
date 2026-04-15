import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Bell, Shield, HelpCircle, Info } from 'lucide-react';

export default function SettingsPage() {
  const navigate = useNavigate();

  const items = [
    { label: 'Notifications', icon: Bell, desc: 'Manage push notifications' },
    { label: 'Privacy', icon: Shield, desc: 'Control your data' },
    { label: 'Help & Support', icon: HelpCircle, desc: 'FAQs and contact' },
    { label: 'About', icon: Info, desc: 'App version and info' },
  ];

  return (
    <div className="min-h-dvh bg-background pb-28">
      <div className="px-5 pt-14 pb-4 relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-muted-foreground active:scale-90 transition-transform"><ChevronLeft className="w-5 h-5" /></button>
          <h1 className="text-xl font-bold text-foreground">Settings</h1>
        </div>
      </div>
      <div className="px-5 relative z-10 flex flex-col gap-2">
        {items.map((item, i) => (
          <motion.button key={item.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="p-4 rounded-2xl bg-card border border-border flex items-center gap-4 active:bg-surface-elevated transition-colors w-full text-left">
            <item.icon className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
