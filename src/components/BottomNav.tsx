import { useLocation, useNavigate } from 'react-router-dom';
import { Compass, Plus, User, Trophy, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

const NAV_ITEMS: Array<{ path: string; icon: typeof Compass; label: string; isAction?: boolean }> = [
  { path: '/', icon: Compass, label: 'Discover' },
  { path: '/activity', icon: Trophy, label: 'Activity' },
  { path: '/create', icon: Plus, label: 'Create', isAction: true },
  { path: '/equips', icon: ShoppingBag, label: 'Equips' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const hiddenPaths = ['/login', '/signup', '/onboarding', '/create'];
  if (hiddenPaths.some(p => location.pathname.startsWith(p))) return null;

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-[env(safe-area-inset-bottom,8px)]"
    >
      <div className="flex items-center gap-1 px-3 py-2.5 mx-4 mb-2 rounded-full bg-[hsl(0_0%_6%/0.65)] backdrop-blur-2xl border border-[hsl(0_0%_100%/0.08)] shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          if (item.isAction) {
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="mx-1.5 flex items-center justify-center w-12 h-12 rounded-full bg-neon-blue neon-glow-blue active:scale-90 transition-transform"
              >
                <Icon className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
              </button>
            );
          }

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`relative flex flex-col items-center justify-center px-4 py-1.5 rounded-full transition-all active:scale-90 ${
                isActive ? 'bg-[hsl(0_0%_100%/0.08)]' : ''
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-colors ${
                  isActive ? 'text-neon-blue' : 'text-muted-foreground'
                }`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={`text-[10px] font-mono tracking-wider mt-0.5 transition-colors ${
                  isActive ? 'text-neon-blue' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-neon-blue neon-glow-blue"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </motion.nav>
  );
}
