import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, Chrome, ArrowRight, Brain, CheckCircle2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { toast } from 'sonner';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function SignIn() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      toast.success('Signed in successfully');
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign in');
      toast.error(err.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'An error occurred during Google sign in');
      toast.error('Google sign in failed');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#d1e8e2] to-white p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="relative overflow-hidden bg-white/40 backdrop-blur-xl border border-white/40 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] p-8 md:p-10">
          
          <div className="flex flex-col items-center text-center mb-8">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-4"
            >
              <Brain className="text-white w-10 h-10" />
            </motion.div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-1">MindPad</h1>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
            <p className="text-slate-600 text-sm max-w-[280px]">
              Sign in to access your MindPad workspace and manage your notes.
            </p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-5">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-50 border border-red-100 text-red-600 text-xs p-3 rounded-xl text-center"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 transition-colors group-focus-within:text-emerald-500" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-white/60 border border-white/50 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Password</label>
                <a href="#" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">Forgot password?</a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 transition-colors group-focus-within:text-emerald-500" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/60 border border-white/50 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center cursor-pointer group">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only" 
                  />
                  <div className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${rememberMe ? 'bg-emerald-500 border-emerald-500' : 'bg-white/60 border-slate-300'}`}>
                    {rememberMe && <CheckCircle2 className="text-white w-4 h-4" />}
                  </div>
                </div>
                <span className="ml-2 text-sm text-slate-600 group-hover:text-slate-900 transition-colors">Remember me</span>
              </label>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-transparent px-4 text-slate-500 font-semibold tracking-widest">OR</span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01, backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleSignIn}
            className="w-full bg-white/60 border border-slate-200 text-slate-700 font-semibold py-4 rounded-2xl flex items-center justify-center gap-3 hover:border-slate-300 transition-all shadow-sm"
          >
            <Chrome className="w-5 h-5 text-emerald-600" />
            Continue with Google
          </motion.button>

          <p className="text-center mt-8 text-sm text-slate-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-emerald-600 font-bold hover:underline underline-offset-4">Sign up</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
