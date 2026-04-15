import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Save } from 'lucide-react';
import { SPORTS, SPORT_ICONS, type SportExperience } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function EditPreferencesPage() {
  const navigate = useNavigate();
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [selectedSports, setSelectedSports] = useState<string[]>(profile?.sports || []);
  const [sportExperiences, setSportExperiences] = useState<SportExperience[]>((profile?.sport_experiences as any[]) || []);
  const [fitnessLevel, setFitnessLevel] = useState(profile?.fitness_level || 50);
  const [saving, setSaving] = useState(false);

  const toggleSport = (sport: string) => {
    setSelectedSports(prev => prev.includes(sport) ? prev.filter(s => s !== sport) : [...prev, sport]);
  };

  const setExperience = (sport: string, level: SportExperience['level']) => {
    setSportExperiences(prev => [...prev.filter(s => s.sport !== sport), { sport, level }]);
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      sports: selectedSports,
      sport_experiences: sportExperiences as any,
      fitness_level: fitnessLevel,
    }).eq('user_id', profile.user_id);
    setSaving(false);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    await refreshProfile();
    toast({ title: 'Preferences updated!' });
    navigate(-1);
  };

  const FITNESS_LABELS = ['Sedentary', 'Light', 'Moderate', 'Active', 'Vigorous'];
  const getFitnessLabel = (val: number) => FITNESS_LABELS[Math.min(Math.floor(val / 25), 4)];

  return (
    <div className="min-h-dvh bg-background pb-28">
      <div className="px-5 pt-14 pb-4 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-muted-foreground"><ChevronLeft className="w-5 h-5" /></button>
          <h1 className="text-xl font-bold text-foreground">Edit Preferences</h1>
          <button onClick={handleSave} disabled={saving} className="p-2 text-neon-blue"><Save className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="px-5 relative z-10 flex flex-col gap-8">
        {/* Fitness */}
        <div>
          <label className="text-xs font-mono text-muted-foreground tracking-wider uppercase mb-3 block">Fitness Level — {getFitnessLabel(fitnessLevel)}</label>
          <input type="range" min={0} max={100} value={fitnessLevel} onChange={e => setFitnessLevel(Number(e.target.value))} className="w-full h-2 rounded-full appearance-none bg-secondary cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neon-blue" />
        </div>

        {/* Sports */}
        <div>
          <label className="text-xs font-mono text-muted-foreground tracking-wider uppercase mb-3 block">Sports</label>
          <div className="flex flex-wrap gap-3">
            {SPORTS.map(sport => (
              <motion.button key={sport} whileTap={{ scale: 0.92 }} onClick={() => toggleSport(sport)} className={`px-4 py-3 rounded-2xl text-sm font-medium flex items-center gap-2 transition-all ${selectedSports.includes(sport) ? 'bg-neon-blue/15 border-neon-blue/40 text-neon-blue border' : 'bg-secondary border border-border text-secondary-foreground'}`}>
                <span>{SPORT_ICONS[sport]}</span>{sport}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Experience */}
        {selectedSports.length > 0 && (
          <div>
            <label className="text-xs font-mono text-muted-foreground tracking-wider uppercase mb-3 block">Experience Levels</label>
            <div className="flex flex-col gap-3">
              {selectedSports.map(sport => {
                const current = sportExperiences.find(s => s.sport === sport)?.level;
                return (
                  <div key={sport} className="p-4 rounded-2xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <span>{SPORT_ICONS[sport]}</span>
                      <span className="font-medium text-foreground">{sport}</span>
                    </div>
                    <div className="flex gap-2">
                      {(['beginner', 'intermediate', 'advanced'] as const).map(level => (
                        <button key={level} onClick={() => setExperience(sport, level)} className={`flex-1 py-2.5 rounded-xl text-xs font-medium capitalize transition-all ${current === level ? level === 'beginner' ? 'bg-neon-green/15 text-neon-green border border-neon-green/30' : level === 'intermediate' ? 'bg-neon-blue/15 text-neon-blue border border-neon-blue/30' : 'bg-neon-orange/15 text-neon-orange border border-neon-orange/30' : 'bg-card border border-border text-muted-foreground'}`}>{level}</button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
