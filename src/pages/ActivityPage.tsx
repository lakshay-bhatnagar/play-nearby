import { motion } from 'framer-motion';
import { Trophy, Calendar, MapPin } from 'lucide-react';

const MOCK_ACTIVITY = [
  { id: '1', type: 'joined', sport: '🏀', title: 'Downtown 5v5 Run', location: 'Central Sports Complex', time: '2h ago' },
  { id: '2', type: 'created', sport: '🎾', title: 'Singles Match', location: 'Riverside Tennis Club', time: 'Yesterday' },
  { id: '3', type: 'completed', sport: '🏃', title: 'Night Trail Run', location: 'Lakeside Trail', time: '2 days ago' },
];

export default function ActivityPage() {
  return (
    <div className="min-h-dvh bg-background pb-28">
      <div className="absolute top-0 left-0 w-[400px] h-[300px] bg-neon-orange/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="px-5 pt-14 pb-4 relative z-10">
        <p className="text-xs font-mono text-muted-foreground tracking-wider uppercase">Your</p>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Activity</h1>
      </div>

      {/* Stats Row */}
      <div className="px-5 mb-6 relative z-10">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Games', value: '12', color: 'text-neon-blue' },
            { label: 'Wins', value: '8', color: 'text-neon-green' },
            { label: 'Streak', value: '3🔥', color: 'text-neon-orange' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-4 rounded-2xl bg-card border border-border text-center"
            >
              <div className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="px-5 relative z-10">
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-neon-orange" />
          Recent Activity
        </h2>
        <div className="flex flex-col gap-3">
          {MOCK_ACTIVITY.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 + 0.2 }}
              className="p-4 rounded-2xl bg-card border border-border flex items-center gap-4"
            >
              <span className="text-2xl">{item.sport}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground text-sm truncate">{item.title}</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{item.location}</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground font-mono shrink-0">{item.time}</div>
            </motion.div>
          ))}
        </div>

        {/* Upcoming */}
        <h2 className="text-sm font-semibold text-foreground mb-3 mt-8 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-neon-blue" />
          Upcoming
        </h2>
        <div className="p-8 rounded-2xl bg-card border border-border border-dashed text-center">
          <p className="text-muted-foreground text-sm">No upcoming games</p>
          <p className="text-xs text-muted-foreground mt-1">Join or create a game to get started</p>
        </div>
      </div>
    </div>
  );
}
