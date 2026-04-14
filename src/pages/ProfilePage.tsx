import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings, ChevronRight, MapPin, Award, LogOut, Edit3 } from 'lucide-react';

const MOCK_PROFILE = {
  name: 'Alex Rivera',
  location: 'Downtown, NYC',
  fitnessLevel: 72,
  sports: [
    { sport: 'Basketball', level: 'Advanced', icon: '🏀' },
    { sport: 'Running', level: 'Intermediate', icon: '🏃' },
    { sport: 'Tennis', level: 'Beginner', icon: '🎾' },
  ],
  stats: { gamesPlayed: 47, wins: 32, hoursActive: 128 },
};

export default function ProfilePage() {
  const navigate = useNavigate();

  const getFitnessLabel = (val: number) => {
    if (val < 25) return 'Sedentary';
    if (val < 50) return 'Moderate';
    if (val < 75) return 'Active';
    return 'Vigorous';
  };

  return (
    <div className="min-h-dvh bg-background pb-28">
      <div className="absolute top-0 right-0 w-[400px] h-[300px] bg-neon-blue/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="px-5 pt-14 pb-2 relative z-10 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Profile</h1>
        <button className="p-2 text-muted-foreground">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <div className="px-5 relative z-10">
        {/* Avatar + Name */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8 mt-4"
        >
          <div className="w-20 h-20 rounded-3xl bg-secondary border border-border flex items-center justify-center text-3xl">
            🏅
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground">{MOCK_PROFILE.name}</h2>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
              <MapPin className="w-3.5 h-3.5" />
              {MOCK_PROFILE.location}
            </div>
          </div>
          <button className="p-2.5 rounded-2xl bg-secondary border border-border">
            <Edit3 className="w-4 h-4 text-muted-foreground" />
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3 mb-8"
        >
          {[
            { label: 'Games', value: MOCK_PROFILE.stats.gamesPlayed, color: 'text-neon-blue' },
            { label: 'Wins', value: MOCK_PROFILE.stats.wins, color: 'text-neon-green' },
            { label: 'Hours', value: MOCK_PROFILE.stats.hoursActive, color: 'text-neon-orange' },
          ].map(stat => (
            <div key={stat.label} className="p-4 rounded-2xl bg-card border border-border text-center">
              <div className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Fitness Level */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-5 rounded-2xl bg-card border border-border mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-muted-foreground tracking-wider uppercase">Fitness Level</span>
            <span className="text-sm font-bold text-neon-blue">{getFitnessLabel(MOCK_PROFILE.fitnessLevel)}</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-neon-blue to-neon-green"
              initial={{ width: 0 }}
              animate={{ width: `${MOCK_PROFILE.fitnessLevel}%` }}
              transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </motion.div>

        {/* Sports */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-neon-green" />
            My Sports
          </h3>
          <div className="flex flex-col gap-2">
            {MOCK_PROFILE.sports.map(sport => (
              <div
                key={sport.sport}
                className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{sport.icon}</span>
                  <span className="font-medium text-foreground text-sm">{sport.sport}</span>
                </div>
                <span
                  className={`text-xs font-medium px-3 py-1 rounded-full ${
                    sport.level === 'Advanced'
                      ? 'bg-neon-orange/15 text-neon-orange'
                      : sport.level === 'Intermediate'
                      ? 'bg-neon-blue/15 text-neon-blue'
                      : 'bg-neon-green/15 text-neon-green'
                  }`}
                >
                  {sport.level}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Menu Items */}
        <div className="flex flex-col gap-2">
          {[
            { label: 'Edit Preferences', icon: Settings },
            { label: 'Booking History', icon: Award },
          ].map(item => (
            <button
              key={item.label}
              className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between active:bg-surface-elevated transition-colors"
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{item.label}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}

          <button
            onClick={() => navigate('/login')}
            className="p-4 rounded-2xl bg-card border border-destructive/20 flex items-center gap-3 mt-2 active:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-4 h-4 text-destructive" />
            <span className="text-sm text-destructive">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
