import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Zap, Bell } from 'lucide-react';
import { GameCard } from '@/components/GameCard';
import { SPORT_ICONS } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const FILTER_SPORTS = ['All', 'Basketball', 'Football', 'Tennis', 'Padel', 'Running', 'Badminton'];

interface GameRow {
  id: string;
  sport: string;
  title: string;
  location: string;
  distance: string | null;
  date_time: string;
  max_players: number;
  current_players: number;
  skill_level: string;
  intensity: string;
  is_live: boolean | null;
  host_id: string;
}

export default function DiscoverPage() {
  const [activeSport, setActiveSport] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [games, setGames] = useState<GameRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .order('date_time', { ascending: true });
    if (data) setGames(data);
    setLoading(false);
  };

  const filteredGames = useMemo(() => {
    let result = games;
    if (activeSport !== 'All') result = result.filter(g => g.sport === activeSport);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(g =>
        g.title.toLowerCase().includes(q) ||
        g.sport.toLowerCase().includes(q) ||
        g.location.toLowerCase().includes(q)
      );
    }
    return result;
  }, [games, activeSport, searchQuery]);

  const handleJoin = async (game: GameRow) => {
    if (!user) return;
    if (game.current_players >= game.max_players) {
      toast({ title: 'Game is full', variant: 'destructive' });
      return;
    }
    const { error } = await supabase
      .from('game_participants')
      .insert({ game_id: game.id, user_id: user.id });
    if (error) {
      if (error.code === '23505') {
        toast({ title: 'Already joined', description: 'You are already in this game' });
      } else {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
      return;
    }
    toast({ title: "You're in! 🎉", description: `Successfully joined ${game.title}` });
    fetchGames();
  };

  const toGameCardFormat = (g: GameRow) => ({
    id: g.id,
    sport: g.sport,
    title: g.title,
    location: g.location,
    distance: g.distance || '',
    dateTime: g.date_time,
    maxPlayers: g.max_players,
    currentPlayers: g.current_players,
    skillLevel: g.skill_level as any,
    hostName: '',
    hostAvatar: '',
    isLive: g.is_live || false,
    intensity: g.intensity as any,
  });

  return (
    <div className="min-h-dvh bg-background pb-28">
      <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-neon-blue/5 blur-[120px] rounded-full pointer-events-none" />

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
            <button
              onClick={() => navigate('/notifications')}
              className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center relative active:scale-90 transition-transform"
            >
              <Bell className="w-4.5 h-4.5 text-muted-foreground" />
              <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-neon-orange" />
            </button>
          </div>
        </div>

        <div className="relative mt-4 mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search games, sports, venues..."
            className="w-full pl-11 pr-12 py-3 rounded-2xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-neon-blue/30 transition-all"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-xl bg-card border border-border">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5">
          {FILTER_SPORTS.map(sport => (
            <motion.button key={sport} whileTap={{ scale: 0.93 }} onClick={() => setActiveSport(sport)} className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${activeSport === sport ? 'bg-neon-blue text-primary-foreground neon-glow-blue' : 'bg-secondary border border-border text-secondary-foreground'}`}>
              {sport !== 'All' && <span className="mr-1.5">{SPORT_ICONS[sport]}</span>}{sport}
            </motion.button>
          ))}
        </div>
      </div>

      {filteredGames.some(g => g.is_live) && (
        <div className="px-5 mb-6 relative z-10">
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-neon-orange" />Happening Now
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-5 px-5">
            {filteredGames.filter(g => g.is_live).map((game, i) => (
              <div key={game.id} className="w-[280px] shrink-0">
                <GameCard game={toGameCardFormat(game)} index={i} onJoin={() => handleJoin(game)} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="px-5 relative z-10">
        <h2 className="text-sm font-semibold text-foreground mb-3">Upcoming Games</h2>
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 rounded-3xl bg-card border border-border animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredGames.filter(g => !g.is_live).map((game, i) => (
              <GameCard key={game.id} game={toGameCardFormat(game)} index={i} onJoin={() => handleJoin(game)} />
            ))}
          </div>
        )}

        {!loading && filteredGames.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No games found</p>
            <p className="text-xs text-muted-foreground mt-1">Create one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}
