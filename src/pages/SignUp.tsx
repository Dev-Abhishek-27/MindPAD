import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, Chrome, ArrowRight, Brain, CheckCircle2, User as UserIcon } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { toast } from 'sonner';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function SignUp() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });
      if (error) throw error;
      
      if (data.session) {
        toast.success('Signed up and signed in successfully!');
        // The AuthContext will handle the redirect automatically
      } else if (data.user) {
        setIsSuccess(true);
        toast.success('Please check your email for verification.');
      }
    } catch (err: any) {
      console.error('Sign up error:', err);
      let friendlyMessage = err.message || 'Sign up failed';
      
      if (err.message?.includes('rate limit')) {
        friendlyMessage = 'Too many sign-up attempts. Please wait a few minutes or disable "Confirm Email" in your Supabase Dashboard settings.';
      }
      
      setError(friendlyMessage);
      toast.error(friendlyMessage);
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
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              {isSuccess ? 'Check Your Email' : 'Create Account'}
            </h2>
            <p className="text-slate-600 text-sm max-w-[280px]">
              {isSuccess 
                ? 'We\'ve sent a verification link to your email. Please confirm your account before logging in.' 
                : 'Join MindPad today and start organizing your thoughts with AI.'}
            </p>
          </div>

          {isSuccess ? (
            <div className="space-y-6">
              <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                <p className="text-slate-700 font-medium">Verification link sent!</p>
                <p className="text-slate-500 text-sm mt-2">Check your inbox and follow the instructions to activate your account.</p>
              </div>
              <Link 
                to="/signin" 
                className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
              >
                Go to Sign In
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-5">
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
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider ml-1">Full Name</label>
              <div className="relative group">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 transition-colors group-focus-within:text-emerald-500" />
                <input 
                  type="text" 
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-white/60 border border-white/50 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

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
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider ml-1">Password</label>
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

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </form>
          )}

          {!isSuccess && (
            <>
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
                Already have an account?{' '}
                <Link to="/signin" className="text-emerald-600 font-bold hover:underline underline-offset-4">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
