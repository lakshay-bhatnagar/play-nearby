import { motion } from 'framer-motion';
import { MapPin, Clock, Users, Zap } from 'lucide-react';
import type { Game } from '@/types';
import { SPORT_ICONS } from '@/types';

interface GameCardProps {
  game: Game;
  onJoin?: () => void;
  index?: number;
}

export function GameCard({ game, onJoin, index = 0 }: GameCardProps) {
  const intensityColor =
    game.intensity === 'high'
      ? 'text-neon-orange'
      : game.intensity === 'medium'
      ? 'text-neon-blue'
      : 'text-neon-green';

  const intensityGlow =
    game.intensity === 'high'
      ? 'bg-neon-orange'
      : game.intensity === 'medium'
      ? 'bg-neon-blue'
      : 'bg-neon-green';

  const slotsLeft = game.maxPlayers - game.currentPlayers;
  const fillPercent = (game.currentPlayers / game.maxPlayers) * 100;

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      whileTap={{ scale: 0.98 }}
      className="rounded-3xl bg-card border border-border p-4 relative overflow-hidden group active:bg-surface-elevated transition-colors"
    >
      {/* Left accent bar */}
      <div className={`absolute top-4 bottom-4 left-0 w-[2px] ${intensityGlow} rounded-full opacity-60`} />

      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{SPORT_ICONS[game.sport] || '🏅'}</span>
          <div>
            <h3 className="font-semibold text-foreground text-base leading-tight">{game.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{game.sport}</p>
          </div>
        </div>
        {game.isLive && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neon-green/10 border border-neon-green/20">
            <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse-glow" />
            <span className="text-[10px] font-mono font-bold text-neon-green tracking-wider uppercase">Live</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{game.location}</span>
          <span className="ml-auto text-xs font-mono shrink-0">{game.distance}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTime(game.dateTime)}</span>
          </div>
          <div className={`flex items-center gap-1.5 text-sm ${intensityColor}`}>
            <Zap className="w-3.5 h-3.5" />
            <span className="capitalize font-medium">{game.intensity}</span>
          </div>
        </div>
      </div>

      {/* Slots */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1.5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="w-3.5 h-3.5" />
            <span className="font-mono">{game.currentPlayers}/{game.maxPlayers}</span>
          </div>
          <span className={`text-xs font-medium ${slotsLeft <= 2 ? 'text-neon-orange' : 'text-muted-foreground'}`}>
            {slotsLeft} {slotsLeft === 1 ? 'slot' : 'slots'} left
          </span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${intensityGlow}`}
            initial={{ width: 0 }}
            animate={{ width: `${fillPercent}%` }}
            transition={{ delay: index * 0.08 + 0.3, duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Join button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onJoin}
        className="w-full py-3 rounded-2xl bg-secondary border border-border text-foreground font-medium text-sm hover:bg-surface-elevated transition-colors active:bg-surface-elevated"
      >
        {slotsLeft > 0 ? 'Join Game' : 'Full'}
      </motion.button>
    </motion.div>
  );
}
