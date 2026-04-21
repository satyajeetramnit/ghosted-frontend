"use client";

import { X, Mic2, Loader2, Calendar, Link } from 'lucide-react';
import { useState } from 'react';
import { InterviewType, InterviewStatus } from '../types';
import { useAddInterview } from '../hooks/useApplications';

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
    
    addInterview({ 
      applicationId, 
      data: { type, scheduledAt, meetingLink: meetingLink || undefined, status } 
    }, {
      onSuccess: () => onClose()
    });
  };

  return (
    <div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-50 flex flex-col p-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          <Mic2 className="w-5 h-5 text-accent" />
          Add Interview Round
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-background rounded text-foreground/40 hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground/50 uppercase">Round Type</label>
          <div className="grid grid-cols-2 gap-2">
            {(['TECHNICAL', 'HR', 'BEHAVIORAL', 'SYSTEM_DESIGN', 'MIXED'] as InterviewType[]).map(t => (
              <button 
                key={t} 
                type="button" 
                onClick={() => setType(t)}
                className={`px-3 py-2 rounded-lg text-[10px] font-bold border transition-all ${type === t ? 'bg-accent/10 border-accent text-accent' : 'bg-background border-border/50 text-foreground/40'}`}
              >
                {t.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground/50 uppercase">Scheduled At</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <input 
              required
              type="datetime-local" 
              value={scheduledAt} 
              onChange={e => setScheduledAt(e.target.value)}
              className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground/50 uppercase">Meeting Link</label>
          <div className="relative">
            <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <input 
              type="url" 
              value={meetingLink} 
              onChange={e => setMeetingLink(e.target.value)}
              placeholder="https://zoom.us/j/..." 
              className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>

        <div className="pt-4 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-sm font-bold text-foreground/50 hover:text-foreground transition-colors">Cancel</button>
          <button 
            type="submit" 
            disabled={isPending || !scheduledAt} 
            className="flex-1 bg-accent text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-accent/20 flex items-center justify-center gap-2"
          >
            {isPending && <Loader2 className="w-3 h-3 animate-spin" />}
            Add Round
          </button>
        </div>
      </form>
    </div>
  );
}
