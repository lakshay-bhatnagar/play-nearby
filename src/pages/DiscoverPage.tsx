import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Zap, Bell, MapPin, Building2, X } from 'lucide-react';
import { GameCard } from '@/components/GameCard';
import { SPORT_ICONS } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const FILTER_SPORTS = ['All', 'Basketball', 'Football', 'Tennis', 'Padel', 'Running', 'Badminton'];
const SKILL_LEVELS = ['all', 'beginner', 'intermediate', 'advanced'];
const INTENSITIES = ['all', 'low', 'medium', 'high'];

interface GameRow {
  id: string; sport: string; title: string; location: string; distance: string | null; date_time: string;
  max_players: number; current_players: number; skill_level: string; intensity: string; is_live: boolean | null; host_id: string;
  venue_id: string | null;
}

interface Venue {
  id: string; name: string; location: string; address?: string | null; supported_sports: string[]; description: string | null;
}

export default function DiscoverPage() {
  const [activeSport, setActiveSport] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState('all');
  const [intensityFilter, setIntensityFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [games, setGames] = useState<GameRow[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [joinedGameIds, setJoinedGameIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { fetchGames(); fetchVenues(); }, []);
  useEffect(() => { if (user) fetchJoined(); }, [user]);

  const fetchGames = async () => {
    // Only games in the future
    const nowIso = new Date().toISOString();
    const { data } = await supabase.from('games').select('*').gte('date_time', nowIso).order('date_time', { ascending: true });
    if (data) setGames(data);
    setLoading(false);
  };

  const fetchVenues = async () => {
    const { data } = await supabase.from('venues').select('*');
    if (data) setVenues(data as any[]);
  };

  const fetchJoined = async () => {
    if (!user) return;
    const { data } = await supabase.from('game_participants').select('game_id').eq('user_id', user.id);
    if (data) setJoinedGameIds(new Set(data.map((d: any) => d.game_id)));
  };

  const venueById = useMemo(() => {
    const m = new Map<string, Venue>();
    venues.forEach(v => m.set(v.id, v));
    return m;
  }, [venues]);

  const filteredGames = useMemo(() => {
    let result = games;
    if (activeSport !== 'All') result = result.filter(g => g.sport === activeSport);
    if (skillFilter !== 'all') result = result.filter(g => g.skill_level === skillFilter);
    if (intensityFilter !== 'all') result = result.filter(g => g.intensity === intensityFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(g => {
        const venueName = g.venue_id ? venueById.get(g.venue_id)?.name || '' : '';
        return g.title.toLowerCase().includes(q) || g.sport.toLowerCase().includes(q) ||
          g.location.toLowerCase().includes(q) || venueName.toLowerCase().includes(q);
      });
    }
    return result;
  }, [games, activeSport, searchQuery, skillFilter, intensityFilter, venueById]);

  const filteredVenues = useMemo(() => {
    let result = venues;
    if (activeSport !== 'All') result = result.filter(v => v.supported_sports.includes(activeSport));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(v => v.name.toLowerCase().includes(q) || v.location.toLowerCase().includes(q));
    }
    return result;
  }, [venues, activeSport, searchQuery]);

  const handleJoin = async (game: GameRow) => {
    if (!user) return;
    if (game.current_players >= game.max_players) { toast({ title: 'Game is full', variant: 'destructive' }); return; }
    const { error } = await supabase.from('game_participants').insert({ game_id: game.id, user_id: user.id });
    if (error) {
      if (error.code === '23505') toast({ title: 'Already joined' });
      else toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: "You're in! 🎉" });
    fetchGames();
    fetchJoined();
  };

  const toGameCardFormat = (g: GameRow) => {
    const v = g.venue_id ? venueById.get(g.venue_id) : undefined;
    return {
      id: g.id, sport: g.sport, title: g.title, location: g.location, distance: g.distance || '',
      dateTime: g.date_time, maxPlayers: g.max_players, currentPlayers: g.current_players,
      skillLevel: g.skill_level as any, hostName: '', hostAvatar: '', isLive: g.is_live || false, intensity: g.intensity as any,
      venueName: v?.name,
    };
  };

  const activeFilterCount = (skillFilter !== 'all' ? 1 : 0) + (intensityFilter !== 'all' ? 1 : 0);

  return (
    <div className="min-h-dvh bg-background pb-28 overflow-x-hidden relative">
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
            <button onClick={() => navigate('/notifications')} className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center relative active:scale-90 transition-transform">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-neon-orange" />
            </button>
          </div>
        </div>

        <div className="relative mt-4 mb-4 flex items-center h-13 group">
          {/* Search Icon - Increased size slightly and adjusted positioning */}
          <div className="absolute left-4 z-20 pointer-events-none">
            <Search className="w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-neon-blue" />
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search games, venues, sports..."
            className="
      w-full h-full 
      pl-12 pr-14 py-4 
      rounded-2xl bg-secondary/50 border border-border 
      text-foreground placeholder:text-muted-foreground/60 
      text-base /* Prevents iOS Zoom */
      focus:outline-none focus:ring-2 focus:ring-neon-blue/30 focus:bg-secondary 
      transition-all
    "
          />

          {/* Filter Button - Adjusted size and simplified border logic */}
          <div className="absolute right-2 z-20 flex items-center">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`
        p-2.5 rounded-xl border transition-all active:scale-90
        ${showFilters || activeFilterCount > 0
                  ? 'bg-neon-blue/15 border-neon-blue/40 shadow-[0_0_15px_rgba(0,229,255,0.1)]'
                  : 'bg-card border-border shadow-sm'}
      `}
            >
              <SlidersHorizontal className={`w-4.5 h-4.5 ${showFilters || activeFilterCount > 0 ? 'text-neon-blue' : 'text-muted-foreground'}`} />

              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-neon-orange text-[10px] font-bold text-accent-foreground flex items-center justify-center border-2 border-background shadow-lg">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-3 p-4 rounded-2xl bg-card border border-border space-y-3">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">Skill Level</p>
              <div className="flex gap-1.5 flex-wrap">
                {SKILL_LEVELS.map(s => (
                  <button key={s} onClick={() => setSkillFilter(s)} className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all ${skillFilter === s ? 'bg-neon-blue/15 text-neon-blue border border-neon-blue/30' : 'bg-secondary border border-border text-muted-foreground'}`}>{s}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">Intensity</p>
              <div className="flex gap-1.5 flex-wrap">
                {INTENSITIES.map(s => (
                  <button key={s} onClick={() => setIntensityFilter(s)} className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all ${intensityFilter === s ? 'bg-neon-orange/15 text-neon-orange border border-neon-orange/30' : 'bg-secondary border border-border text-muted-foreground'}`}>{s}</button>
                ))}
              </div>
            </div>
            {activeFilterCount > 0 && (
              <button onClick={() => { setSkillFilter('all'); setIntensityFilter('all'); }} className="text-[11px] text-muted-foreground flex items-center gap-1"><X className="w-3 h-3" />Clear filters</button>
            )}
          </motion.div>
        )}

        <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5">
          {FILTER_SPORTS.map(sport => (
            <motion.button key={sport} whileTap={{ scale: 0.93 }} onClick={() => setActiveSport(sport)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${activeSport === sport ? 'bg-neon-blue text-primary-foreground neon-glow-blue' : 'bg-secondary border border-border text-secondary-foreground'}`}>
              {sport !== 'All' && <span className="mr-1.5">{SPORT_ICONS[sport]}</span>}{sport}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Venues section */}
      {filteredVenues.length > 0 && (
        <div className="px-5 mb-6 relative z-10">
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-neon-green" />Nearby Venues
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5">
            {filteredVenues.map((venue, i) => (
              <motion.div key={venue.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/venue/${venue.id}`)}
                className="shrink-0 w-[220px] p-4 rounded-2xl bg-card border border-border cursor-pointer active:scale-[0.97] transition-transform">
                <h3 className="font-semibold text-foreground text-sm mb-1">{venue.name}</h3>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2"><MapPin className="w-3 h-3" />{venue.location}</div>
                <div className="flex flex-wrap gap-1">
                  {venue.supported_sports.slice(0, 3).map(s => (
                    <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{SPORT_ICONS[s] || ''} {s}</span>
                  ))}
                  {venue.supported_sports.length > 3 && <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">+{venue.supported_sports.length - 3}</span>}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {filteredGames.some(g => g.is_live) && (
        <div className="px-5 mb-6 relative z-10">
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Zap className="w-4 h-4 text-neon-orange" />Happening Now</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-5 px-5">
            {filteredGames.filter(g => g.is_live).map((game, i) => (
              <div key={game.id} className="w-[280px] shrink-0">
                <GameCard
                  game={toGameCardFormat(game)} index={i}
                  onJoin={() => handleJoin(game)}
                  alreadyJoined={joinedGameIds.has(game.id)}
                  isHost={user?.id === game.host_id}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="px-5 relative z-10">
        <h2 className="text-sm font-semibold text-foreground mb-3">Upcoming Games</h2>
        {loading ? (
          <div className="flex flex-col gap-4">{[1, 2, 3].map(i => <div key={i} className="h-48 rounded-3xl bg-card border border-border animate-pulse" />)}</div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredGames.filter(g => !g.is_live).map((game, i) => (
              <GameCard
                key={game.id} game={toGameCardFormat(game)} index={i}
                onJoin={() => handleJoin(game)}
                alreadyJoined={joinedGameIds.has(game.id)}
                isHost={user?.id === game.host_id}
              />
            ))}
          </div>
        )}
        {!loading && filteredGames.length === 0 && (
          <div className="text-center py-20"><p className="text-muted-foreground">No games found</p><p className="text-xs text-muted-foreground mt-1">Create one to get started!</p></div>
        )}
      </div>
    </div>
  );
}
