import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings, ChevronRight, MapPin, Award, LogOut, Edit3, Save, X, Clock, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SPORT_ICONS } from '@/types';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { profile, signOut, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editAge, setEditAge] = useState('');
  const [saving, setSaving] = useState(false);

  const startEdit = () => { setEditName(profile?.name || ''); setEditLocation(profile?.location || ''); setEditAge(String(profile?.age || '')); setEditing(true); };

  const saveEdit = async () => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({ name: editName, location: editLocation, age: Number(editAge) || null }).eq('user_id', profile.user_id);
    setSaving(false);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    await refreshProfile(); setEditing(false); toast({ title: 'Profile updated!' });
  };

  const handleSignOut = async () => { await signOut(); navigate('/login'); };

  const getFitnessLabel = (val: number) => { if (val < 25) return 'Sedentary'; if (val < 50) return 'Moderate'; if (val < 75) return 'Active'; return 'Vigorous'; };

  const sports = profile?.sports || [];
  const experiences = (profile?.sport_experiences as any[]) || [];

  return (
    <div className="min-h-dvh bg-background pb-28">
      <div className="absolute top-0 right-0 w-[400px] h-[300px] bg-neon-blue/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="px-5 pt-14 pb-2 relative z-10 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Profile</h1>
        <button onClick={() => navigate('/settings')} className="p-2 text-muted-foreground active:scale-90 transition-transform"><Settings className="w-5 h-5" /></button>
      </div>

      <div className="px-5 relative z-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-8 mt-4">
          <div className="w-20 h-20 rounded-3xl bg-secondary border border-border flex items-center justify-center text-3xl">🏅</div>
          <div className="flex-1">
            {editing ? (
              <div className="flex flex-col gap-2">
                <input value={editName} onChange={e => setEditName(e.target.value)} className="px-3 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-neon-blue/50" placeholder="Name" />
                <input value={editLocation} onChange={e => setEditLocation(e.target.value)} className="px-3 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-neon-blue/50" placeholder="Location" />
                <input value={editAge} onChange={e => setEditAge(e.target.value)} type="number" className="px-3 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-neon-blue/50" placeholder="Age" />
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-foreground">{profile?.name || 'User'}</h2>
                {(profile as any)?.username && (
                  <p className="text-xs text-muted-foreground/70 font-mono mt-0.5">@{(profile as any).username}</p>
                )}
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1"><MapPin className="w-3.5 h-3.5" />{profile?.location || 'No location set'}</div>
              </>
            )}
          </div>
          {editing ? (
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="p-2.5 rounded-2xl bg-secondary border border-border"><X className="w-4 h-4 text-muted-foreground" /></button>
              <button onClick={saveEdit} disabled={saving} className="p-2.5 rounded-2xl bg-neon-blue/15 border border-neon-blue/30"><Save className="w-4 h-4 text-neon-blue" /></button>
            </div>
          ) : (
            <button onClick={startEdit} className="p-2.5 rounded-2xl bg-secondary border border-border active:scale-90 transition-transform"><Edit3 className="w-4 h-4 text-muted-foreground" /></button>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-5 rounded-2xl bg-card border border-border mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-muted-foreground tracking-wider uppercase">Fitness Level</span>
            <span className="text-sm font-bold text-neon-blue">{getFitnessLabel(profile?.fitness_level || 50)}</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-neon-blue to-neon-green" initial={{ width: 0 }} animate={{ width: `${profile?.fitness_level || 50}%` }} transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }} />
          </div>
        </motion.div>

        {sports.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Award className="w-4 h-4 text-neon-green" />My Sports</h3>
            <div className="flex flex-col gap-2">
              {sports.map(sport => {
                const exp = experiences.find((e: any) => e.sport === sport);
                return (
                  <div key={sport} className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between">
                    <div className="flex items-center gap-3"><span className="text-xl">{SPORT_ICONS[sport] || '🏅'}</span><span className="font-medium text-foreground text-sm">{sport}</span></div>
                    <span className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${exp?.level === 'advanced' ? 'bg-neon-orange/15 text-neon-orange' : exp?.level === 'intermediate' ? 'bg-neon-blue/15 text-neon-blue' : 'bg-neon-green/15 text-neon-green'}`}>{exp?.level || 'beginner'}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        <div className="flex flex-col gap-2">
          {[
            { label: 'Edit Preferences', icon: Settings, path: '/edit-preferences' },
            { label: 'Activity History', icon: Clock, path: '/activity-history' },
            { label: 'Equip History', icon: ShoppingBag, path: '/equip-history' },
          ].map(item => (
            <button key={item.label} onClick={() => navigate(item.path)} className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between active:bg-surface-elevated transition-colors">
              <div className="flex items-center gap-3"><item.icon className="w-4 h-4 text-muted-foreground" /><span className="text-sm text-foreground">{item.label}</span></div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
          <button onClick={handleSignOut} className="p-4 rounded-2xl bg-card border border-destructive/20 flex items-center gap-3 mt-2 active:bg-destructive/10 transition-colors">
            <LogOut className="w-4 h-4 text-destructive" /><span className="text-sm text-destructive">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
