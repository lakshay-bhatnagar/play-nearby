import { useLocation, useNavigate } from 'react-router-dom';
import { Compass, Plus, User, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { path: '/', icon: Compass, label: 'Discover' },
  { path: '/activity', icon: Trophy, label: 'Activity' },
  { path: '/create', icon: Plus, label: 'Create', isAction: true },
  { path: '/profile', icon: User, label: 'Profile' },
] as const;

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  // Hide on auth/onboarding pages
  const hiddenPaths = ['/login', '/signup', '/onboarding'];
  if (hiddenPaths.some(p => location.pathname.startsWith(p))) return null;

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 safe-bottom"
    >
      <div className="flex items-center gap-2 px-4 py-3 rounded-full glass-heavy shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          if (item.isAction) {
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="mx-1 flex items-center justify-center w-12 h-12 rounded-full bg-neon-blue neon-glow-blue active:scale-90 transition-transform"
              >
                <Icon className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
              </button>
            );
          }

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`relative flex flex-col items-center justify-center px-5 py-2 rounded-full transition-all active:scale-90 ${
                isActive ? 'bg-secondary' : ''
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-colors ${
                  isActive ? 'text-neon-blue' : 'text-muted-foreground'
                }`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={`text-[10px] font-mono tracking-wider mt-1 transition-colors ${
                  isActive ? 'text-neon-blue' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -bottom-1 w-1 h-1 rounded-full bg-neon-blue neon-glow-blue"
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
