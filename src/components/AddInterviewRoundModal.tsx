"use client";

import { X, Mic2, Loader2, Calendar, Link as LinkIcon, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { InterviewType, InterviewStatus } from '../types';
import { useAddInterview } from '../hooks/useApplications';
import { motion, AnimatePresence } from 'framer-motion';

interface AddInterviewRoundModalProps {
  applicationId: string;
  onClose: () => void;
}

export default function AddInterviewRoundModal({ applicationId, onClose }: AddInterviewRoundModalProps) {
  const { mutate: addInterview, isPending } = useAddInterview();
  
  const [type, setType] = useState<InterviewType>('TECHNICAL');
  const [scheduledAt, setScheduledAt] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [status, setStatus] = useState<InterviewStatus>('SCHEDULED');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledAt) return;
    
    const formattedDate = scheduledAt.length === 16 ? `${scheduledAt}:00` : scheduledAt;
    
    addInterview({ 
      applicationId, 
      data: { type, scheduledAt: formattedDate, meetingLink: meetingLink || undefined, status } 
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
          className="fixed inset-0 bg-background/90 backdrop-blur-[12px]" 
          onClick={onClose} 
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-background border border-border shadow-[0_20px_80px_rgba(0,0,0,0.2)] rounded-[2rem] overflow-hidden flex flex-col"
        >
          {/* Subtle Grain Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.05] mix-blend-overlay z-0" 
               style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3%3Cfilter id='noiseFilter'%3%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3%3C/filter%3%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3%3C/svg%3")` }} 
          />

          <div className="relative z-10 p-8 border-b border-border-muted flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-foreground text-background flex items-center justify-center">
                <Mic2 className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-foreground font-outfit">Add Interview</h3>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface text-muted-foreground transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="relative z-10 p-8 space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-muted-foreground/90 uppercase tracking-widest ml-1">Round Type</label>
              <div className="flex flex-wrap gap-2">
                {(['TECHNICAL', 'HR', 'BEHAVIORAL', 'SYSTEM_DESIGN', 'MIXED'] as InterviewType[]).map(t => (
                  <button 
                    key={t} 
                    type="button" 
                    onClick={() => setType(t)}
                    className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider border transition-all ${type === t ? 'bg-foreground text-background border-foreground shadow-lg' : 'bg-surface border-border-muted text-muted-foreground/80 hover:border-border hover:text-foreground'}`}
                  >
                    {t.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground/90 uppercase tracking-widest ml-1">Scheduled Time</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
                <input 
                  required
                  type="datetime-local" 
                  value={scheduledAt} 
                  onChange={e => setScheduledAt(e.target.value)}
                  className="w-full bg-surface border border-border-muted rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-foreground/10 transition-all dark:[color-scheme:dark]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground/90 uppercase tracking-widest ml-1">Meeting Access Channel</label>
              <div className="relative">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
                <input 
                  type="url" 
                  value={meetingLink} 
                  onChange={e => setMeetingLink(e.target.value)}
                  placeholder="Zoom, Google Meet, Teams link..." 
                  className="w-full bg-surface border border-border-muted rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-foreground/10 transition-all placeholder:text-muted-foreground/90"
                />
              </div>
            </div>

            <div className="pt-6 flex items-center justify-between border-t border-border-muted mt-4">
              <button type="button" onClick={onClose} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 hover:text-foreground transition-colors">Cancel</button>
              <button 
                type="submit" 
                disabled={isPending || !scheduledAt} 
                className="bg-foreground text-background px-8 py-3 rounded-full font-black uppercase tracking-widest text-[11px] shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Commit Round</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
