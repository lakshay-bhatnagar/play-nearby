import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Calendar, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { SPORT_ICONS } from '@/types';

export default function ActivityPage() {
  const { user } = useAuth();
  const [joinedGames, setJoinedGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchActivity = async () => {
      const { data } = await supabase
        .from('game_participants')
        .select('*, games(*)')
        .eq('user_id', user.id)
        .order('joined_at', { ascending: false });
      setJoinedGames(data || []);
      setLoading(false);
    };
    fetchActivity();
  }, [user]);

  const upcoming = joinedGames.filter(p => p.games && new Date(p.games.date_time) > new Date());
  const past = joinedGames.filter(p => p.games && new Date(p.games.date_time) <= new Date());

  return (
    <div className="min-h-dvh bg-background pb-28">
      <div className="absolute top-0 left-0 w-[400px] h-[300px] bg-neon-orange/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="px-5 pt-14 pb-4 relative z-10">
        <p className="text-xs font-mono text-muted-foreground tracking-wider uppercase">Your</p>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Activity</h1>
      </div>

      <div className="px-5 mb-6 relative z-10">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Joined', value: String(joinedGames.length), color: 'text-neon-blue' },
            { label: 'Upcoming', value: String(upcoming.length), color: 'text-neon-green' },
            { label: 'Played', value: String(past.length), color: 'text-neon-orange' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="p-4 rounded-2xl bg-card border border-border text-center">
              <div className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="px-5 relative z-10">
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-neon-blue" />Upcoming
        </h2>
        {loading ? (
          <div className="h-20 rounded-2xl bg-card border border-border animate-pulse" />
        ) : upcoming.length > 0 ? (
          <div className="flex flex-col gap-3">
            {upcoming.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="p-4 rounded-2xl bg-card border border-border flex items-center gap-4">
                <span className="text-2xl">{SPORT_ICONS[item.games?.sport] || '🏅'}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground text-sm truncate">{item.games?.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <MapPin className="w-3 h-3" /><span className="truncate">{item.games?.location}</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground font-mono shrink-0">
                  {new Date(item.games?.date_time).toLocaleDateString()}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-card border border-border border-dashed text-center">
            <p className="text-muted-foreground text-sm">No upcoming games</p>
            <p className="text-xs text-muted-foreground mt-1">Join or create a game to get started</p>
          </div>
        )}

        <h2 className="text-sm font-semibold text-foreground mb-3 mt-8 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-neon-orange" />Past Games
        </h2>
        {past.length > 0 ? (
          <div className="flex flex-col gap-3">
            {past.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 + 0.2 }} className="p-4 rounded-2xl bg-card border border-border flex items-center gap-4 opacity-70">
                <span className="text-2xl">{SPORT_ICONS[item.games?.sport] || '🏅'}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground text-sm truncate">{item.games?.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <MapPin className="w-3 h-3" /><span className="truncate">{item.games?.location}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-card border border-border border-dashed text-center">
            <p className="text-muted-foreground text-sm">No past games yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
