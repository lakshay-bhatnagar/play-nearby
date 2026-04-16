import { useLocation, useNavigate } from 'react-router-dom';
import { Compass, Plus, User, Trophy, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { path: '/', icon: Compass, label: 'Discover' },
  { path: '/activity', icon: Trophy, label: 'Activity' },
  { path: '/create', icon: Plus, label: 'Create', isAction: true }, // The FAB
  { path: '/equips', icon: ShoppingBag, label: 'Equips' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const hiddenPaths = ['/login', '/signup', '/onboarding', '/create'];
  if (hiddenPaths.some(p => location.pathname.startsWith(p))) return null;

  return (
    <div className="fixed bottom-8 left-0 right-0 z-50 flex justify-center px-6 pointer-events-none">
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="
          relative pointer-events-auto
          flex items-center justify-around gap-2 p-2 px-4
          min-w-[320px] max-w-fit
          bg-black/60 backdrop-blur-2xl 
          border border-white/10 
          rounded-[32px]
          shadow-[0_20px_50px_rgba(0,0,0,0.5)]
        "
      >
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          if (item.isAction) {
            return (
              /* THE FAB STRATEGY */
              <div key={item.path} className="relative w-14 h-12 flex justify-center">
                <button
                  onClick={() => navigate(item.path)}
                  className="
                    absolute -top-10 /* Lifts it above the bar */
                    w-14 h-14 rounded-full 
                    bg-blue-500 
                    flex items-center justify-center 
                    shadow-[0_8px_20px_rgba(59,130,246,0.4)]
                    border-4 border-[#121212] /* Mimics the 'cutout' look */
                    active:scale-90 transition-transform
                  "
                >
                  <Icon className="w-7 h-7 text-white" strokeWidth={3} />
                </button>
                {/* Optional: Tiny label under the gap if you want it to match Apple Fitness */}
                <span className="absolute bottom-1 text-[10px] text-gray-500 font-medium">
                  {item.label}
                </span>
              </div>
            );
          }

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="relative flex flex-col items-center justify-center min-w-[56px] py-1 group"
            >
              <Icon
                className={`w-6 h-6 transition-all ${
                  isActive ? 'text-blue-400' : 'text-gray-400'
                }`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={`text-[10px] mt-1 font-medium ${
                isActive ? 'text-blue-400' : 'text-gray-500'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </motion.nav>
    </div>
  );
}