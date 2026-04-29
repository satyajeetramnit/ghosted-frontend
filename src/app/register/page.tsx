'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { Ghost, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const { register } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await register({ email, password, firstName, lastName });
    } catch (error) {
      // toast is handled in api interceptor
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background Innovations */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay" 
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3%3Cfilter id='noiseFilter'%3%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3%3C/filter%3%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3%3C/svg%3")` }} 
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[480px] relative z-10 p-8"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-[2rem] bg-foreground text-background flex items-center justify-center mb-8 shadow-2xl relative overflow-hidden group">
            <Ghost className="w-8 h-8 relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3 font-outfit">Join the Elite.</h1>
          <p className="text-muted-foreground text-sm font-medium text-center max-w-[300px] leading-relaxed">
            Begin your journey towards professional mastery with Ghosted Intelligence.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">First Name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-surface border border-border-muted rounded-2xl px-5 py-3.5 text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/10 transition-all placeholder:text-muted-foreground/30 font-medium"
                placeholder="Avery"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-surface border border-border-muted rounded-2xl px-5 py-3.5 text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/10 transition-all placeholder:text-muted-foreground/30 font-medium"
                placeholder="Stone"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">Work Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface border border-border-muted rounded-2xl px-5 py-3.5 text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/10 transition-all placeholder:text-muted-foreground/30 font-medium"
              placeholder="name@company.com"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">Access Credential</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface border border-border-muted rounded-2xl px-5 py-3.5 text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/10 transition-all placeholder:text-muted-foreground/30 font-medium"
              placeholder="••••••••"
            />
            <p className="text-[10px] text-muted-foreground/40 ml-1 font-medium italic">Minimum 6 characters for optimal security.</p>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-foreground text-background font-bold py-4 rounded-[1.5rem] transition-all flex justify-center items-center gap-3 hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50 mt-4"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Establish Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
        
        <div className="mt-8 pt-8 border-t border-border-muted flex flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground font-medium">
            Already have credentials?
          </p>
          <Link href="/login" className="text-sm font-bold text-foreground hover:underline underline-offset-4 decoration-2 decoration-foreground/20 transition-all">
            Access Intelligence Terminal
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
