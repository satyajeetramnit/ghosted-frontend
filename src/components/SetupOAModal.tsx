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
    <div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-50 flex flex-col p-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-accent" />
          Setup OA Round
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-background rounded text-foreground/40 hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground/50 uppercase">Platform</label>
          <input 
            required 
            value={platform} 
            onChange={e => setPlatform(e.target.value)}
            placeholder="HackerRank, CodeSignal, etc." 
            className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground/50 uppercase">Deadline</label>
          <input 
            type="datetime-local" 
            value={deadline} 
            onChange={e => setDeadline(e.target.value)}
            className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
           {(['PENDING', 'SUBMITTED', 'PASSED', 'FAILED'] as OAStatus[]).map(s => (
             <button 
               key={s} 
               type="button" 
               onClick={() => setStatus(s)}
               className={`px-3 py-2 rounded-lg text-[10px] font-bold border transition-all ${status === s ? 'bg-accent/10 border-accent text-accent' : 'bg-background border-border/50 text-foreground/40'}`}
             >
               {s}
             </button>
           ))}
        </div>

        <div className="pt-4 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-sm font-bold text-foreground/50 hover:text-foreground transition-colors">Cancel</button>
          <button 
            type="submit" 
            disabled={isPending || !platform} 
            className="flex-1 bg-accent text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-accent/20 flex items-center justify-center gap-2"
          >
            {isPending && <Loader2 className="w-3 h-3 animate-spin" />}
            Save OA
          </button>
        </div>
      </form>
    </div>
  );
}
