"use client";

import { X, ClipboardList, Loader2, Calendar, Layout, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { OAStatus } from '../types';
import { useUpdateOA } from '../hooks/useApplications';
import { motion, AnimatePresence } from 'framer-motion';

interface SetupOAModalProps {
  applicationId: string;
  onClose: () => void;
}

export default function SetupOAModal({ applicationId, onClose }: SetupOAModalProps) {
  const { mutate: updateOA, isPending } = useUpdateOA();
  
  const [platform, setPlatform] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState<OAStatus>('PENDING');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateOA({ 
      applicationId, 
      data: { platform, deadline: deadline || undefined, status } 
    }, {
      onSuccess: () => onClose()
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/60 backdrop-blur-[12px]" 
          onClick={onClose} 
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-background border border-border shadow-[0_20px_80px_rgba(0,0,0,0.2)] rounded-[2rem] overflow-hidden flex flex-col"
        >
          {/* Subtle Grain Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.02] mix-blend-overlay z-0" 
               style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3%3Cfilter id='noiseFilter'%3%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3%3C/filter%3%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3%3C/svg%3")` }} 
          />

          <div className="relative z-10 p-8 border-b border-border-muted flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-foreground text-background flex items-center justify-center">
                <ClipboardList className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-foreground font-outfit">Setup Assessment</h3>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface text-muted-foreground transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="relative z-10 p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">Platform</label>
              <div className="relative">
                <Layout className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30" />
                <input 
                  required 
                  value={platform} 
                  onChange={e => setPlatform(e.target.value)}
                  placeholder="HackerRank, CodeSignal..." 
                  className="w-full bg-surface border border-border-muted rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-foreground/10 transition-all placeholder:text-muted-foreground/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">Submission Deadline</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30" />
                <input 
                  type="datetime-local" 
                  value={deadline} 
                  onChange={e => setDeadline(e.target.value)}
                  className="w-full bg-surface border border-border-muted rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-foreground/10 transition-all dark:[color-scheme:dark]"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">State</label>
              <div className="flex flex-wrap gap-2">
                 {(['PENDING', 'SUBMITTED', 'PASSED', 'FAILED'] as OAStatus[]).map(s => (
                   <button 
                     key={s} 
                     type="button" 
                     onClick={() => setStatus(s)}
                     className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-wider border transition-all ${status === s ? 'bg-foreground text-background border-foreground shadow-lg' : 'bg-surface border-border-muted text-muted-foreground/40 hover:border-border hover:text-foreground'}`}
                   >
                     {s}
                   </button>
                 ))}
              </div>
            </div>

            <div className="pt-6 flex items-center justify-between border-t border-border-muted mt-4">
              <button type="button" onClick={onClose} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 hover:text-foreground transition-colors">Abort</button>
              <button 
                type="submit" 
                disabled={isPending || !platform} 
                className="bg-foreground text-background px-8 py-3 rounded-full font-black uppercase tracking-widest text-[11px] shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Initialize Round</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
