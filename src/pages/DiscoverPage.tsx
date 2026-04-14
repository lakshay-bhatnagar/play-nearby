import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Zap } from 'lucide-react';
import { GameCard } from '@/components/GameCard';
import { MOCK_GAMES } from '@/data/mock';
import { SPORT_ICONS } from '@/types';
import { useToast } from '@/hooks/use-toast';

const FILTER_SPORTS = ['All', 'Basketball', 'Football', 'Tennis', 'Padel', 'Running', 'Badminton'];

export default function DiscoverPage() {
  const [activeSport, setActiveSport] = useState('All');
  const { toast } = useToast();

  const filteredGames =
    activeSport === 'All'
      ? MOCK_GAMES
      : MOCK_GAMES.filter(g => g.sport === activeSport);

  const handleJoin = (gameTitle: string) => {
    toast({
      title: "You're in! 🎉",
      description: `Successfully joined ${gameTitle}`,
    });
  };

  return (
    <div className="min-h-dvh bg-background pb-28">
      {/* Ambient */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-neon-blue/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="px-5 pt-14 pb-4 relative z-10">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-xs font-mono text-muted-foreground tracking-wider uppercase">Nearby</p>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Discover</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neon-blue/10 border border-neon-blue/20">
              <div className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-pulse-glow" />
              <span className="text-[10px] font-mono text-neon-blue tracking-wider font-bold">LIVE</span>
            </div>
            <button className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-surface-elevated" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mt-4 mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search games, sports, venues..."
            className="w-full pl-11 pr-12 py-3 rounded-2xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-neon-blue/30 transition-all"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-xl bg-card border border-border">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Sport filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5">
          {FILTER_SPORTS.map(sport => (
            <motion.button
              key={sport}
              whileTap={{ scale: 0.93 }}
              onClick={() => setActiveSport(sport)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${
                activeSport === sport
                  ? 'bg-neon-blue text-primary-foreground neon-glow-blue'
                  : 'bg-secondary border border-border text-secondary-foreground'
              }`}
            >
              {sport !== 'All' && <span className="mr-1.5">{SPORT_ICONS[sport]}</span>}
              {sport}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Featured */}
      {filteredGames.some(g => g.isLive) && (
        <div className="px-5 mb-6 relative z-10">
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-neon-orange" />
            Happening Now
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-5 px-5">
            {filteredGames
              .filter(g => g.isLive)
              .map((game, i) => (
                <div key={game.id} className="w-[280px] shrink-0">
                  <GameCard game={game} index={i} onJoin={() => handleJoin(game.title)} />
                </div>
              ))}
          </div>
        </div>
      )}

      {/* All Games */}
      <div className="px-5 relative z-10">
        <h2 className="text-sm font-semibold text-foreground mb-3">Upcoming Games</h2>
        <div className="flex flex-col gap-4">
          {filteredGames
            .filter(g => !g.isLive)
            .map((game, i) => (
              <GameCard key={game.id} game={game} index={i} onJoin={() => handleJoin(game.title)} />
            ))}
        </div>

        {filteredGames.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No games found for this sport</p>
          </div>
        )}
      </div>
    </div>
  );
}
