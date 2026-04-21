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
    
    const formattedDate = scheduledAt.length === 16 ? `${scheduledAt}:00` : scheduledAt;
    
    addInterview({ 
      applicationId, 
      data: { type, scheduledAt: formattedDate, meetingLink: meetingLink || undefined, status } 
    }, {
      onSuccess: () => onClose()
    });
  };

  return (
    <>
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60] transition-opacity" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-[70] p-4 pointer-events-none">
        <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 pointer-events-auto flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-border/30">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Mic2 className="w-5 h-5 text-accent" />
              Add Interview Round
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-background rounded-lg text-foreground/50 hover:text-foreground transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">Round Type</label>
              <div className="flex flex-wrap gap-2">
                {(['TECHNICAL', 'HR', 'BEHAVIORAL', 'SYSTEM_DESIGN', 'MIXED'] as InterviewType[]).map(t => (
                  <button 
                    key={t} 
                    type="button" 
                    onClick={() => setType(t)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${type === t ? 'bg-accent/20 border-accent text-accent' : 'bg-background border-border text-foreground/40 hover:border-foreground/20'}`}
                  >
                    {t.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">Scheduled At</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                <input 
                  required
                  type="datetime-local" 
                  value={scheduledAt} 
                  onChange={e => setScheduledAt(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl pl-11 pr-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all dark:[color-scheme:dark]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">Meeting Link</label>
              <div className="relative">
                <Link className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                <input 
                  type="url" 
                  value={meetingLink} 
                  onChange={e => setMeetingLink(e.target.value)}
                  placeholder="https://zoom.us/j/..." 
                  className="w-full bg-background border border-border rounded-xl pl-11 pr-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                />
              </div>
            </div>

            <div className="pt-6 flex justify-end gap-3 border-t border-border/30 mt-6">
              <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-medium text-foreground hover:bg-background transition-colors">Cancel</button>
              <button 
                type="submit" 
                disabled={isPending || !scheduledAt} 
                className="bg-accent hover:bg-accent/90 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-accent/20 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Add Round
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
