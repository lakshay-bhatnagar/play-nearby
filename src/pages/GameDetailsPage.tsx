import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, MapPin, Calendar, Users, Zap, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SPORT_ICONS } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { fetchGameParticipants, type GameParticipantView } from '@/lib/game-participants';

export default function GameDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [game, setGame] = useState<any>(null);
  const [host, setHost] = useState<any>(null);
  const [participants, setParticipants] = useState<GameParticipantView[]>([]);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  const [venue, setVenue] = useState<any>(null);

  const fetchAll = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const { data: g } = await supabase.from('games').select('*').eq('id', id).single();
    setGame(g);
    if (g) {
      const { data: hostP } = await supabase.from('profiles').select('name, username, avatar_url').eq('user_id', (g as any).host_id).maybeSingle();
      setHost(hostP);
      if ((g as any).venue_id) {
        const { data: v } = await supabase.from('venues').select('*').eq('id', (g as any).venue_id).maybeSingle();
        setVenue(v);
      }
      const parts = await fetchGameParticipants(id);
      setParticipants(parts);
      const { data: o } = await supabase.from('orders').select('total_amount, friction_id').eq('game_id', id).maybeSingle();
      setOrder(o);
    } else {
      setParticipants([]);
      setVenue(null);
      setHost(null);
      setOrder(null);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`game-details-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_participants', filter: `game_id=eq.${id}` }, () => {
        fetchAll();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${id}` }, () => {
        fetchAll();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, fetchAll]);

  const handleJoin = async () => {
    if (!user || !game) return;
    if (game.current_players >= game.max_players) {
      toast({ title: 'Game is full', variant: 'destructive' });
      return;
    }
    setJoining(true);
    const { error } = await supabase.from('game_participants').insert({ game_id: game.id, user_id: user.id });
    setJoining(false);
    if (error) {
      if (error.code === '23505') toast({ title: 'Already joined' });
      else toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    setParticipants((current) => {
      if (current.some((participant) => participant.user_id === user.id)) return current;
      return [...current, {
        user_id: user.id,
        joined_at: new Date().toISOString(),
        profile: {
          name: user.user_metadata?.name ?? null,
          username: user.user_metadata?.username ?? null,
          avatar_url: null,
        },
      }];
    });
    setGame((current: any) => current ? { ...current, current_players: Math.min(current.max_players, current.current_players + 1) } : current);
    toast({ title: "You're in! 🎉" });
    fetchAll();
  };

  const handleLeave = async () => {
    if (!user || !game) return;
    setJoining(true);
    const { error } = await supabase
      .from('game_participants')
      .delete()
      .eq('game_id', game.id)
      .eq('user_id', user.id);
    setJoining(false);

    if (error) {
      toast({ title: 'Could not leave game', description: error.message, variant: 'destructive' });
      return;
    }

    setParticipants((current) => current.filter((participant) => participant.user_id !== user.id));
    setGame((current: any) => current ? { ...current, current_players: Math.max(0, current.current_players - 1) } : current);
    toast({ title: 'You left the game' });
    fetchAll();
  };

  if (loading) {
    return <div className="min-h-dvh bg-background flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-neon-blue border-t-transparent animate-spin" /></div>;
  }

  if (!game) {
    return <div className="min-h-dvh bg-background flex items-center justify-center text-muted-foreground">Game not found</div>;
  }

  const isHost = user?.id === game.host_id;
  const alreadyJoined = participants.some(p => p.user_id === user?.id);
  const slotsLeft = game.max_players - game.current_players;
  const dt = new Date(game.date_time);

  return (
    <div className="min-h-dvh bg-background pb-32 overflow-x-hidden relative">
      <div className="absolute top-0 right-0 w-[400px] h-[300px] bg-neon-blue/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="px-5 pt-12 relative z-10">
        <button onClick={() => navigate(-1)} className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-muted-foreground active:scale-90 transition-transform">
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="mt-4 flex items-center gap-3">
          <span className="text-4xl">{SPORT_ICONS[game.sport] || '🏅'}</span>
          <div>
            <p className="text-xs font-mono text-muted-foreground tracking-wider uppercase">{game.sport}</p>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">{game.title}</h1>
          </div>
        </div>

        {/* Info grid */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-card border border-border">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
              <Calendar className="w-3.5 h-3.5" />Date
            </div>
            <p className="text-sm font-semibold text-foreground">{dt.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
            <p className="text-xs text-muted-foreground mt-0.5 font-mono">{dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <div className="p-4 rounded-2xl bg-card border border-border">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
              <Users className="w-3.5 h-3.5" />Players
            </div>
            <p className="text-sm font-semibold text-foreground font-mono">{game.current_players}/{game.max_players}</p>
            <p className={`text-xs mt-0.5 font-medium ${slotsLeft <= 2 ? 'text-neon-orange' : 'text-muted-foreground'}`}>{slotsLeft} slots left</p>
          </div>
        </div>

        <div className="mt-3 p-4 rounded-2xl bg-card border border-border">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
            <MapPin className="w-3.5 h-3.5" />Venue
          </div>
          <p className="text-sm font-semibold text-foreground">{venue?.name || game.location}</p>
          {venue && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {venue.address || venue.location}
            </p>
          )}
          {venue && (
            <button onClick={() => navigate(`/venue/${venue.id}`)} className="text-[11px] text-neon-blue mt-2 underline">View venue details →</button>
          )}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-card border border-border">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
              <Zap className="w-3.5 h-3.5" />Intensity
            </div>
            <p className="text-sm font-semibold text-foreground capitalize">{game.intensity}</p>
          </div>
          <div className="p-4 rounded-2xl bg-card border border-border">
            <div className="text-xs text-muted-foreground mb-1.5">Skill Level</div>
            <p className="text-sm font-semibold text-foreground capitalize">{game.skill_level}</p>
          </div>
        </div>

        {/* Organizer */}
        <div className="mt-5">
          <p className="text-xs font-mono text-muted-foreground tracking-wider uppercase mb-2">Organizer</p>
          <div className="p-4 rounded-2xl bg-card border border-border flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-neon-orange/10 border border-neon-orange/20 flex items-center justify-center">
              <Crown className="w-4.5 h-4.5 text-neon-orange" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{host?.name || 'Host'}</p>
              {host?.username && <p className="text-xs text-muted-foreground">@{host.username}</p>}
            </div>
            {order && (
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground font-mono uppercase">Paid</p>
                <p className="text-sm font-bold text-neon-green font-mono">₹{Number(order.total_amount).toFixed(0)}</p>
              </div>
            )}
          </div>
          {order?.friction_id && (
            <p className="text-[10px] font-mono text-muted-foreground mt-1.5 ml-1">Booking ID: {order.friction_id}</p>
          )}
        </div>

        {/* Joined users */}
        <div className="mt-5">
          <p className="text-xs font-mono text-muted-foreground tracking-wider uppercase mb-2">Joined Players ({participants.length})</p>
          <div className="flex flex-col gap-2">
            {participants.length === 0 && (
              <p className="text-sm text-muted-foreground p-4 bg-card rounded-2xl border border-border border-dashed text-center">No players yet</p>
            )}
            {participants.map((p, i) => (
              <motion.div key={p.user_id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="p-3 rounded-2xl bg-card border border-border flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-xs font-mono text-muted-foreground">
                  {(p.profile?.username || p.profile?.name || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{p.profile?.username ? `@${p.profile.username}` : p.profile?.name || 'Player'}</p>
                  {p.profile?.name && p.profile?.username && <p className="text-xs text-muted-foreground">{p.profile.name}</p>}
                </div>
                {p.user_id === game.host_id && (
                  <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-neon-orange/15 text-neon-orange font-medium">Host</span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky CTA */}
      {!isHost && !alreadyJoined && slotsLeft > 0 && (
        <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed bottom-6 left-0 right-0 z-40 px-5">
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleJoin} disabled={joining}
            className="w-full py-4 rounded-2xl bg-neon-blue text-primary-foreground font-semibold neon-glow-blue disabled:opacity-50">
            {joining ? 'Joining...' : 'Join Game'}
          </motion.button>
        </motion.div>
      )}
      {!isHost && alreadyJoined && (
        <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed bottom-6 left-0 right-0 z-40 px-5">
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleLeave} disabled={joining}
            className="w-full py-4 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive font-semibold disabled:opacity-50">
            {joining ? 'Leaving...' : 'Exit Game'}
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
