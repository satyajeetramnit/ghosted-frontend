"use client";

import { useApplicationStore } from '../store/useApplicationStore';
import { useCreateApplication } from '../hooks/useApplications';
import { useContacts } from '../hooks/useContacts';
import { X, Search, Check, Calendar, Plus } from 'lucide-react';
import { useState, useMemo } from 'react';
import { ApplicationStatus, Contact } from '../types';

/** Format Date as "YYYY-MM-DD" in local timezone (for the date input and backend payload) */
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

  // Core Form State
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [status, setStatus] = useState<ApplicationStatus>('APPLIED');
  const [appliedDate, setAppliedDate] = useState(toLocalDateString(new Date()));

  // Linked contacts (multi-select from existing)
  const [linkedIds, setLinkedIds] = useState<string[]>([]);
  const [contactSearch, setContactSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Inline new contact
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

  if (!isAddModalOpen) return null;

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
    <>
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity" onClick={() => setIsAddModalOpen(false)} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-border/30 shrink-0">
            <h2 className="text-xl font-bold text-foreground">Add Application</h2>
            <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-background rounded-lg text-foreground/50 hover:text-foreground transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
            {/* Company + Role */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground/80">Company</label>
                <input required value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Google, Stripe..." className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground/80">Role</label>
                <input required value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="Software Engineer" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all" />
              </div>
            </div>

            {/* Applied Date */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-accent" />
                Date Applied
              </label>
              <input
                type="date"
                required
                value={appliedDate}
                onChange={e => setAppliedDate(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
              />
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">Status</label>
              <div className="flex flex-wrap gap-2">
                {(['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED'] as ApplicationStatus[]).map(s => (
                  <button key={s} type="button" onClick={() => setStatus(s)} className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${status === s ? 'bg-accent/20 border-accent text-accent' : 'bg-background border-border text-foreground/40 hover:border-foreground/20'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Contacts */}
            <div className="space-y-3 pt-2 border-t border-border/30">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground/80">Contact Persons</label>
                <button
                  type="button"
                  onClick={() => setShowSearch(s => !s)}
                  className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-background border border-border text-accent hover:bg-accent/5 transition-colors"
                >
                  <Plus className="w-3 h-3" /> Link Existing
                </button>
              </div>

              {/* Linked contacts chips */}
              {linkedContacts.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {linkedContacts.map(c => (
                    <div key={c.id} className="flex items-center gap-1.5 bg-accent/10 border border-accent/20 rounded-full px-3 py-1">
                      <span className="text-xs font-medium text-accent">{c.name}</span>
                      {c.companyName && <span className="text-[10px] text-accent/60">· {c.companyName}</span>}
                      <button type="button" onClick={() => setLinkedIds(ids => ids.filter(id => id !== c.id))} className="ml-0.5 text-accent/50 hover:text-red-400 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Search dropdown */}
              {showSearch && (
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                    <input
                      type="text"
                      placeholder="Search contacts by name or company..."
                      value={contactSearch}
                      onChange={e => setContactSearch(e.target.value)}
                      autoFocus
                      className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                    />
                  </div>
                  {contactSearch && (
                    <div className="absolute top-full mt-1 w-full bg-card border border-border rounded-xl shadow-xl z-10 max-h-44 overflow-y-auto p-1 space-y-0.5">
                      {filteredContacts.length > 0 ? filteredContacts.slice(0, 8).map(c => (
                        <button key={c.id} type="button" onClick={() => toggleContact(c)}
                          className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between hover:bg-background text-foreground/70 hover:text-foreground"
                        >
                          <div>
                            <div className="font-medium text-foreground text-xs">{c.name}</div>
                            <div className="text-[10px] text-foreground/40">{c.companyName} · {c.category}</div>
                          </div>
                          <Check className="w-3.5 h-3.5 text-accent opacity-0 group-hover:opacity-100" />
                        </button>
                      )) : <div className="p-3 text-xs text-center text-foreground/40">No contacts found</div>}
                    </div>
                  )}
                </div>
              )}

              {/* Inline new contact (only when no linked contacts) */}
              {linkedIds.length === 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">Or add inline</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] text-foreground/40 ml-1">Name</span>
                      <input value={newContactName} onChange={e => setNewContactName(e.target.value)} placeholder="Jane Doe" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-accent/50" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-foreground/40 ml-1">Email</span>
                      <input type="email" value={newContactEmail} onChange={e => setNewContactEmail(e.target.value)} placeholder="jane@company.com" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-accent/50" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-border/30">
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-5 py-2.5 rounded-xl font-medium text-foreground hover:bg-background transition-colors">Cancel</button>
              <button type="submit" disabled={isPending} className="bg-accent hover:bg-accent/90 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-accent/20 transition-all disabled:opacity-70">{isPending ? 'Creating...' : 'Create'}</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
