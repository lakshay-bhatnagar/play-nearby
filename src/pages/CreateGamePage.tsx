import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, MapPin, Calendar, Users, Zap, Check } from 'lucide-react';
import { SPORTS, SPORT_ICONS } from '@/types';
import { useToast } from '@/hooks/use-toast';

export default function CreateGamePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sport, setSport] = useState('');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [skillLevel, setSkillLevel] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleCreate = () => {
    if (!sport || !title || !location || !date || !time || !skillLevel) {
      toast({ title: 'Missing fields', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({ title: 'Game Created! 🎉', description: 'Your game is now visible to nearby players' });
      navigate('/');
    }, 1000);
  };

  return (
    <div className="min-h-dvh bg-background pb-28">
      <div className="absolute top-0 right-0 w-[400px] h-[300px] bg-neon-green/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="px-5 pt-14 pb-4 relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-muted-foreground">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Create Game</h1>
        </div>
      </div>

      <div className="px-5 relative z-10 flex flex-col gap-6 max-w-lg">
        {/* Sport selection */}
        <div>
          <label className="text-xs font-mono text-muted-foreground tracking-wider uppercase mb-3 block">Sport</label>
          <div className="flex flex-wrap gap-2">
            {SPORTS.slice(0, 10).map(s => (
              <motion.button
                key={s}
                whileTap={{ scale: 0.93 }}
                onClick={() => setSport(s)}
                className={`px-3.5 py-2.5 rounded-2xl text-sm font-medium flex items-center gap-2 transition-all ${
                  sport === s
                    ? 'bg-neon-blue/15 border-neon-blue/40 text-neon-blue border'
                    : 'bg-secondary border border-border text-secondary-foreground'
                }`}
              >
                <span>{SPORT_ICONS[s]}</span>
                {s}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="text-xs font-mono text-muted-foreground tracking-wider uppercase mb-2 block">Game Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-4 py-3.5 rounded-2xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-neon-blue/50 transition-all"
            placeholder="e.g. Evening pickup game"
          />
        </div>

        {/* Location */}
        <div>
          <label className="text-xs font-mono text-muted-foreground tracking-wider uppercase mb-2 block flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5" /> Location
          </label>
          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            className="w-full px-4 py-3.5 rounded-2xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-neon-blue/50 transition-all"
            placeholder="Venue or address"
          />
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-mono text-muted-foreground tracking-wider uppercase mb-2 block flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" /> Date
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-neon-blue/50 transition-all [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="text-xs font-mono text-muted-foreground tracking-wider uppercase mb-2 block">Time</label>
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-neon-blue/50 transition-all [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Max Players */}
        <div>
          <label className="text-xs font-mono text-muted-foreground tracking-wider uppercase mb-2 block flex items-center gap-2">
            <Users className="w-3.5 h-3.5" /> Max Players
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={2}
              max={30}
              value={maxPlayers}
              onChange={e => setMaxPlayers(Number(e.target.value))}
              className="flex-1 h-2 rounded-full appearance-none bg-secondary cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neon-blue [&::-webkit-slider-thumb]:shadow-[0_0_12px_hsl(187,100%,50%,0.5)]"
            />
            <span className="font-mono text-lg font-bold text-foreground w-8 text-center">{maxPlayers}</span>
          </div>
        </div>

        {/* Skill Level */}
        <div>
          <label className="text-xs font-mono text-muted-foreground tracking-wider uppercase mb-3 block flex items-center gap-2">
            <Zap className="w-3.5 h-3.5" /> Skill Level
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['beginner', 'intermediate', 'advanced'].map(level => (
              <motion.button
                key={level}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSkillLevel(level)}
                className={`py-3 rounded-2xl text-sm font-medium capitalize transition-all relative ${
                  skillLevel === level
                    ? level === 'beginner'
                      ? 'bg-neon-green/15 text-neon-green border border-neon-green/30'
                      : level === 'intermediate'
                      ? 'bg-neon-blue/15 text-neon-blue border border-neon-blue/30'
                      : 'bg-neon-orange/15 text-neon-orange border border-neon-orange/30'
                    : 'bg-secondary border border-border text-muted-foreground'
                }`}
              >
                {skillLevel === level && <Check className="w-3 h-3 absolute top-2 right-2" />}
                {level}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleCreate}
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-neon-green text-accent-foreground font-semibold text-base neon-glow-green disabled:opacity-50 transition-all mt-4"
        >
          {loading ? 'Creating...' : 'Create Game'}
        </motion.button>
      </div>
    </div>
  );
}
