import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Zap, Check, X, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function SignupPage() {
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Real-time username availability check
  useEffect(() => {
    if (!username) { setUsernameStatus('idle'); return; }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) { setUsernameStatus('invalid'); return; }
    setUsernameStatus('checking');
    const t = setTimeout(async () => {
      const { data } = await supabase.from('profiles').select('username').ilike('username', username).maybeSingle();
      setUsernameStatus(data ? 'taken' : 'available');
    }, 400);
    return () => clearTimeout(t);
  }, [username]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password || !confirmPassword || !username) { setError('Please fill in all fields'); return; }
    if (usernameStatus !== 'available') { setError('Please choose a valid, available username'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    const { error } = await signUp(email, password, username);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      toast({ title: 'Account created!', description: 'Welcome to Pulse Play. Let\'s set up your profile.' });
    }
  };

  return (
    <div className="min-h-dvh bg-background flex flex-col relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-neon-green/6 blur-[120px] rounded-full pointer-events-none" />
      <div className="flex-1 flex flex-col justify-center px-6 relative z-10 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-sm mx-auto w-full">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-2xl bg-neon-green flex items-center justify-center neon-glow-green">
              <Zap className="w-5 h-5 text-accent-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Pulse Play</h1>
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Create account</h2>
          <p className="text-muted-foreground mb-8">Join the game, find your people</p>
          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-mono text-muted-foreground tracking-wider uppercase mb-2 block">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3.5 rounded-2xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-neon-green/50 focus:border-neon-green/50 transition-all" placeholder="you@example.com" />
            </div>
            <div>
              <label className="text-xs font-mono text-muted-foreground tracking-wider uppercase mb-2 block">Username</label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value.replace(/\s/g, ''))}
                  maxLength={20}
                  className="w-full px-4 py-3.5 rounded-2xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-neon-green/50 focus:border-neon-green/50 transition-all pr-11"
                  placeholder="your_unique_handle"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  {usernameStatus === 'checking' && <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />}
                  {usernameStatus === 'available' && <Check className="w-4 h-4 text-neon-green" />}
                  {usernameStatus === 'taken' && <X className="w-4 h-4 text-destructive" />}
                  {usernameStatus === 'invalid' && <X className="w-4 h-4 text-neon-orange" />}
                </div>
              </div>
              {usernameStatus === 'taken' && <p className="text-xs text-destructive mt-1.5">Username already taken</p>}
              {usernameStatus === 'invalid' && <p className="text-xs text-neon-orange mt-1.5">3-20 chars, letters, numbers, _ only</p>}
              {usernameStatus === 'available' && <p className="text-xs text-neon-green mt-1.5">Username available — this can't be changed later</p>}
            </div>
            <div>
              <label className="text-xs font-mono text-muted-foreground tracking-wider uppercase mb-2 block">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3.5 rounded-2xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-neon-green/50 focus:border-neon-green/50 transition-all pr-12" placeholder="Min 6 characters" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-mono text-muted-foreground tracking-wider uppercase mb-2 block">Confirm Password</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-4 py-3.5 rounded-2xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-neon-green/50 focus:border-neon-green/50 transition-all" placeholder="••••••••" />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <motion.button type="submit" disabled={loading || usernameStatus !== 'available'} whileTap={{ scale: 0.97 }} className="w-full py-4 rounded-2xl bg-neon-green text-accent-foreground font-semibold text-base mt-2 neon-glow-green disabled:opacity-50 transition-all active:scale-95">
              {loading ? 'Creating account...' : 'Get Started'}
            </motion.button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-8">
            Already have an account?{' '}<Link to="/login" className="text-neon-green font-medium">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
