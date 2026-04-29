"use client";

import { useApplicationStore } from '../store/useApplicationStore';
import { useCreateApplication } from '../hooks/useApplications';
import { useContacts } from '../hooks/useContacts';
import { X, Search, Check, Calendar, Plus, Building2, Briefcase, UserCircle2, Sparkles, Loader2 } from 'lucide-react';
import { useState, useMemo } from 'react';
import { ApplicationStatus, Contact } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

function toLocalDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function AddApplicationModal() {
  const { isAddModalOpen, setIsAddModalOpen } = useApplicationStore();
  const { mutate: createApplication, isPending } = useCreateApplication();
  const { data: contactPage } = useContacts();

  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [status, setStatus] = useState<ApplicationStatus>('APPLIED');
  const [appliedDate, setAppliedDate] = useState(toLocalDateString(new Date()));

  const [linkedIds, setLinkedIds] = useState<string[]>([]);
  const [contactSearch, setContactSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const [newContactName, setNewContactName] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');

  const contacts = useMemo(() => contactPage?.content || [], [contactPage]);
  const linkedContacts = useMemo(() => contacts.filter(c => linkedIds.includes(c.id)), [contacts, linkedIds]);
  const filteredContacts = useMemo(() => {
    const q = contactSearch.toLowerCase();
    return contacts.filter(c =>
      !linkedIds.includes(c.id) && (
        c.name.toLowerCase().includes(q) ||
        (c.companyName?.toLowerCase().includes(q))
      )
    );
  }, [contacts, contactSearch, linkedIds]);

  function toggleContact(c: Contact) {
    setLinkedIds(prev => prev.includes(c.id) ? prev.filter(id => id !== c.id) : [...prev, c.id]);
    setContactSearch('');
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !jobTitle) return;

    createApplication({
      companyName,
      jobTitle,
      status,
      appliedDate,
      contactIds: linkedIds.length > 0 ? linkedIds : undefined,
      contactName: linkedIds.length === 0 && newContactName ? newContactName : undefined,
    }, {
      onSuccess: () => {
        resetForm();
        setIsAddModalOpen(false);
      }
    });
  };

  const resetForm = () => {
    setCompanyName('');
    setJobTitle('');
    setStatus('APPLIED');
    setAppliedDate(toLocalDateString(new Date()));
    setLinkedIds([]);
    setContactSearch('');
    setShowSearch(false);
    setNewContactName('');
    setNewContactEmail('');
  };

  return (
    <AnimatePresence>
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/60 backdrop-blur-[12px]" 
            onClick={() => setIsAddModalOpen(false)} 
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-xl bg-background border border-border shadow-[0_20px_80px_rgba(0,0,0,0.2)] rounded-[2.5rem] overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Subtle Grain */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.02] mix-blend-overlay z-0" 
                 style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3%3Cfilter id='noiseFilter'%3%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3%3C/filter%3%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3%3C/svg%3")` }} 
            />

            <div className="relative z-10 px-10 pt-10 pb-6 flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-3xl font-bold tracking-tight text-foreground font-outfit">New Application</h2>
                <p className="text-muted-foreground text-sm font-medium italic">Establishing a new professional connection.</p>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)} 
                className="p-3 rounded-2xl bg-surface border border-border-muted text-muted-foreground hover:text-foreground transition-all active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="relative z-10 p-10 pt-0 space-y-8 overflow-y-auto custom-scrollbar flex-1">
              {/* Primary Details */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">Enterprise</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30" />
                      <input required value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Google, OpenAI..." className="w-full bg-surface border border-border-muted rounded-2xl pl-12 pr-5 py-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-foreground/10 transition-all placeholder:text-muted-foreground/20" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">Strategic Role</label>
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30" />
                      <input required value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="Staff Engineer" className="w-full bg-surface border border-border-muted rounded-2xl pl-12 pr-5 py-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-foreground/10 transition-all placeholder:text-muted-foreground/20" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">Inception Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30" />
                    <input type="date" required value={appliedDate} onChange={e => setAppliedDate(e.target.value)} className="w-full bg-surface border border-border-muted rounded-2xl pl-12 pr-5 py-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-foreground/10 transition-all" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">Initial Status</label>
                  <div className="flex flex-wrap gap-2">
                    {(['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED'] as ApplicationStatus[]).map(s => (
                      <button key={s} type="button" onClick={() => setStatus(s)} className={`px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${status === s ? 'bg-foreground text-background border-foreground shadow-lg' : 'bg-surface border-border-muted text-muted-foreground/50 hover:border-border hover:text-foreground'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stakeholders Section */}
              <div className="pt-8 border-t border-border-muted space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCircle2 className="w-4 h-4 text-muted-foreground/40" />
                    <h3 className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest">Key Stakeholders</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSearch(s => !s)}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:text-foreground transition-colors px-3 py-1.5 bg-surface border border-border-muted rounded-full"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Bind Existing</span>
                  </button>
                </div>

                {linkedContacts.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {linkedContacts.map(c => (
                      <div key={c.id} className="flex items-center gap-2 bg-foreground text-background rounded-full px-4 py-2">
                        <span className="text-[10px] font-black uppercase tracking-wider">{c.name}</span>
                        <button type="button" onClick={() => setLinkedIds(ids => ids.filter(id => id !== c.id))} className="hover:text-red-400 transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {showSearch && (
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30" />
                    <input
                      type="text"
                      placeholder="Search global talent database..."
                      value={contactSearch}
                      onChange={e => setContactSearch(e.target.value)}
                      className="w-full bg-surface border border-border rounded-2xl pl-12 pr-5 py-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-foreground/10 transition-all"
                    />
                    <AnimatePresence>
                      {contactSearch && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute top-full mt-2 w-full bg-background border border-border rounded-[1.5rem] shadow-[0_20px_40px_rgba(0,0,0,0.1)] z-20 max-h-48 overflow-y-auto p-2"
                        >
                          {filteredContacts.length > 0 ? filteredContacts.map(c => (
                            <button key={c.id} type="button" onClick={() => toggleContact(c)}
                              className="w-full text-left px-5 py-3 rounded-xl hover:bg-surface text-sm font-bold text-foreground/60 hover:text-foreground transition-all"
                            >
                              {c.name} <span className="text-[10px] font-medium text-muted-foreground/40 ml-2 uppercase tracking-widest">{c.companyName}</span>
                            </button>
                          )) : <div className="p-5 text-[10px] font-bold text-center text-muted-foreground/20 uppercase tracking-[0.2em]">No matches found</div>}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {linkedIds.length === 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-widest ml-1">New Stakeholder Name</label>
                      <input value={newContactName} onChange={e => setNewContactName(e.target.value)} placeholder="Jane Doe" className="w-full bg-surface/50 border border-border-muted rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-foreground/10" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-widest ml-1">Intelligence Channel</label>
                      <input type="email" value={newContactEmail} onChange={e => setNewContactEmail(e.target.value)} placeholder="jane@company.com" className="w-full bg-surface/50 border border-border-muted rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-foreground/10" />
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-10 flex items-center justify-between border-t border-border-muted">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/40 hover:text-foreground transition-colors">Abort</button>
                <button 
                  type="submit" 
                  disabled={isPending} 
                  className="bg-foreground text-background px-10 py-4 rounded-full font-black uppercase tracking-widest text-[11px] shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center gap-3"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>Commit Workspace</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
