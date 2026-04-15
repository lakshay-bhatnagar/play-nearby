import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, MapPin, Zap } from 'lucide-react';
import { SPORTS, SPORT_ICONS, type SportExperience } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const FITNESS_LABELS = ['Sedentary', 'Light', 'Moderate', 'Active', 'Vigorous'];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [location, setLocation] = useState('');
  const [fitnessLevel, setFitnessLevel] = useState(50);
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [sportExperiences, setSportExperiences] = useState<SportExperience[]>([]);
  const [saving, setSaving] = useState(false);

  const totalSteps = 6;
  const progress = ((step + 1) / totalSteps) * 100;

  const getFitnessLabel = (val: number) => {
    const idx = Math.min(Math.floor(val / 25), 4);
    return FITNESS_LABELS[idx];
  };

  const getFitnessColor = (val: number) => {
    if (val < 25) return 'text-muted-foreground';
    if (val < 50) return 'text-neon-blue';
    if (val < 75) return 'text-neon-green';
    return 'text-neon-orange';
  };

  const toggleSport = (sport: string) => {
    setSelectedSports(prev =>
      prev.includes(sport) ? prev.filter(s => s !== sport) : [...prev, sport]
    );
  };

  const setExperience = (sport: string, level: SportExperience['level']) => {
    setSportExperiences(prev => {
      const existing = prev.filter(s => s.sport !== sport);
      return [...existing, { sport, level }];
    });
  };

  const canProceed = () => {
    switch (step) {
      case 0: return name.trim().length > 0;
      case 1: return age.trim().length > 0 && Number(age) > 0;
      case 2: return location.trim().length > 0;
      case 3: return true;
      case 4: return selectedSports.length > 0;
      case 5: return sportExperiences.length === selectedSports.length;
      default: return false;
    }
  };

  const handleNext = async () => {
    if (step === totalSteps - 1) {
      if (!user) return;
      setSaving(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          name,
          age: Number(age),
          location,
          fitness_level: fitnessLevel,
          sports: selectedSports,
          sport_experiences: sportExperiences as any,
          onboarding_completed: true,
        })
        .eq('user_id', user.id);
      setSaving(false);
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        return;
      }
      await refreshProfile();
      navigate('/');
    } else {
      setStep(s => s + 1);
    }
  };

  const slideVariants = {
    enter: { x: 60, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -60, opacity: 0 },
  };

  return (
    <div className="min-h-dvh bg-background flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-neon-blue/6 blur-[120px] rounded-full pointer-events-none" />

      <div className="px-6 pt-6 relative z-10">
        <div className="flex items-center justify-between mb-6">
          {step > 0 ? (
            <button onClick={() => setStep(s => s - 1)} className="p-2 -ml-2 text-muted-foreground">
              <ChevronLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-9" />
          )}
          <span className="text-xs font-mono text-muted-foreground tracking-wider">{step + 1} / {totalSteps}</span>
          <div className="w-9" />
        </div>
        <div className="h-1 bg-secondary rounded-full overflow-hidden">
          <motion.div className="h-full bg-neon-blue rounded-full" animate={{ width: `${progress}%` }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
        </div>
      </div>

      <div className="flex-1 px-6 pt-10 pb-32 relative z-10 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div key={step} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: 'easeInOut' }} className="max-w-sm mx-auto w-full">
            {step === 0 && (
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">What's your name?</h2>
                <p className="text-muted-foreground mb-8">Let others know who they're playing with</p>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-4 rounded-2xl bg-secondary border border-border text-foreground text-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-neon-blue/50 transition-all" placeholder="Your name" autoFocus />
              </div>
            )}
            {step === 1 && (
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">How old are you?</h2>
                <p className="text-muted-foreground mb-8">Helps us match you with the right group</p>
                <input type="number" value={age} onChange={e => setAge(e.target.value)} className="w-full px-4 py-4 rounded-2xl bg-secondary border border-border text-foreground text-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-neon-blue/50 transition-all" placeholder="25" min={1} max={120} autoFocus />
              </div>
            )}
            {step === 2 && (
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Where are you?</h2>
                <p className="text-muted-foreground mb-8">We'll find games and venues near you</p>
                <div className="relative">
                  <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="w-full px-4 py-4 rounded-2xl bg-secondary border border-border text-foreground text-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-neon-blue/50 transition-all pr-12" placeholder="City or area" autoFocus />
                  <button onClick={() => setLocation('Downtown, NYC')} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-neon-blue">
                    <MapPin className="w-5 h-5" />
                  </button>
                </div>
                <button onClick={() => setLocation('Downtown, NYC')} className="mt-3 flex items-center gap-2 text-sm text-neon-blue">
                  <MapPin className="w-4 h-4" />Use current location
                </button>
              </div>
            )}
            {step === 3 && (
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Fitness level</h2>
                <p className="text-muted-foreground mb-10">How active are you currently?</p>
                <div className="flex flex-col items-center gap-8">
                  <motion.div key={getFitnessLabel(fitnessLevel)} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`text-4xl font-bold ${getFitnessColor(fitnessLevel)}`}>
                    {getFitnessLabel(fitnessLevel)}
                  </motion.div>
                  <div className="w-full">
                    <input type="range" min={0} max={100} value={fitnessLevel} onChange={e => setFitnessLevel(Number(e.target.value))} className="w-full h-2 rounded-full appearance-none bg-secondary cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neon-blue [&::-webkit-slider-thumb]:shadow-[0_0_12px_hsl(187,100%,50%,0.5)]" />
                    <div className="flex justify-between mt-2">
                      <span className="text-xs text-muted-foreground">Sedentary</span>
                      <span className="text-xs text-muted-foreground">Vigorous</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {step === 4 && (
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Pick your sports</h2>
                <p className="text-muted-foreground mb-8">Select all that you enjoy</p>
                <div className="flex flex-wrap gap-3">
                  {SPORTS.map(sport => {
                    const isSelected = selectedSports.includes(sport);
                    return (
                      <motion.button key={sport} whileTap={{ scale: 0.92 }} onClick={() => toggleSport(sport)} className={`px-4 py-3 rounded-2xl text-sm font-medium flex items-center gap-2 transition-all ${isSelected ? 'bg-neon-blue/15 border-neon-blue/40 text-neon-blue border' : 'bg-secondary border border-border text-secondary-foreground'}`}>
                        <span>{SPORT_ICONS[sport]}</span>{sport}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}
            {step === 5 && (
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Experience level</h2>
                <p className="text-muted-foreground mb-8">Rate your skill in each sport</p>
                <div className="flex flex-col gap-4">
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
                            <button key={level} onClick={() => setExperience(sport, level)} className={`flex-1 py-2.5 rounded-xl text-xs font-medium capitalize transition-all ${current === level ? level === 'beginner' ? 'bg-neon-green/15 text-neon-green border border-neon-green/30' : level === 'intermediate' ? 'bg-neon-blue/15 text-neon-blue border border-neon-blue/30' : 'bg-neon-orange/15 text-neon-orange border border-neon-orange/30' : 'bg-card border border-border text-muted-foreground'}`}>
                              {level}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 z-10">
        <motion.button whileTap={{ scale: 0.97 }} disabled={!canProceed() || saving} onClick={handleNext} className="w-full max-w-sm mx-auto flex items-center justify-center gap-2 py-4 rounded-2xl bg-neon-blue text-primary-foreground font-semibold text-base neon-glow-blue disabled:opacity-30 disabled:shadow-none transition-all">
          {step === totalSteps - 1 ? (
            saving ? <>Saving...</> : <><Zap className="w-4 h-4" />Let's Go</>
          ) : (
            <>Continue<ChevronRight className="w-4 h-4" /></>
          )}
        </motion.button>
      </div>
    </div>
  );
}
