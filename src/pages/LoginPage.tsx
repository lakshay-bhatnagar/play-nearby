import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) setError(error.message);
  };

  return (
    <div className="min-h-dvh bg-background flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-neon-blue/8 blur-[120px] rounded-full pointer-events-none" />
      <div className="flex-1 flex flex-col justify-center px-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-sm mx-auto w-full">
          <div className="flex items-center gap-3 mb-12">
            <img
                src="/logo.png" 
                alt="Logo"
                width={100}
                height={100}
                className="w-6 h-6 object-contain"
              />
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Friction</h1>
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Welcome back</h2>
          <p className="text-muted-foreground mb-8">Sign in to find your next game</p>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-mono text-muted-foreground tracking-wider uppercase mb-2 block">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3.5 rounded-2xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-neon-blue/50 focus:border-neon-blue/50 transition-all" placeholder="you@example.com" />
            </div>
            <div>
              <label className="text-xs font-mono text-muted-foreground tracking-wider uppercase mb-2 block">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3.5 rounded-2xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-neon-blue/50 focus:border-neon-blue/50 transition-all pr-12" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }} className="w-full py-4 rounded-2xl bg-neon-blue text-primary-foreground font-semibold text-base mt-2 neon-glow-blue disabled:opacity-50 transition-all active:scale-95">
              {loading ? 'Signing in...' : 'Sign In'}
            </motion.button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-8">
            Don't have an account?{' '}<Link to="/signup" className="text-neon-blue font-medium">Sign up</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
