"use client";

import { X, ClipboardList, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { OAStatus } from '../types';
import { useUpdateOA } from '../hooks/useApplications';

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
    <>
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60] transition-opacity" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-[70] p-4 pointer-events-none">
        <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 pointer-events-auto flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-border/30">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-accent" />
              Setup OA Round
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-background rounded-lg text-foreground/50 hover:text-foreground transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">Platform</label>
              <input 
                required 
                value={platform} 
                onChange={e => setPlatform(e.target.value)}
                placeholder="HackerRank, CodeSignal, etc." 
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">Deadline</label>
              <input 
                type="datetime-local" 
                value={deadline} 
                onChange={e => setDeadline(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all dark:[color-scheme:dark]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">Assessment Status</label>
              <div className="flex flex-wrap gap-2">
                 {(['PENDING', 'SUBMITTED', 'PASSED', 'FAILED'] as OAStatus[]).map(s => (
                   <button 
                     key={s} 
                     type="button" 
                     onClick={() => setStatus(s)}
                     className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${status === s ? 'bg-accent/20 border-accent text-accent' : 'bg-background border-border text-foreground/40 hover:border-foreground/20'}`}
                   >
                     {s}
                   </button>
                 ))}
              </div>
            </div>

            <div className="pt-6 flex justify-end gap-3 border-t border-border/30 mt-6">
              <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-medium text-foreground hover:bg-background transition-colors">Cancel</button>
              <button 
                type="submit" 
                disabled={isPending || !platform} 
                className="bg-accent hover:bg-accent/90 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-accent/20 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Save OA
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
