"use client";

import { useApplicationStore } from '../store/useApplicationStore';
import { useCreateApplication } from '../hooks/useApplications';
import { useContacts } from '../hooks/useContacts';
import { X, Search, UserPlus, Link as LinkIcon, ChevronsUpDown, Check } from 'lucide-react';
import { useState, useMemo } from 'react';
import { ApplicationStatus, ContactCategory, Contact } from '../types';

export default function AddApplicationModal() {
  const { isAddModalOpen, setIsAddModalOpen } = useApplicationStore();
  const { mutate: createApplication, isPending } = useCreateApplication();
  const { data: contactPage } = useContacts();

  // Core Form State
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [status, setStatus] = useState<ApplicationStatus>('APPLIED');
  
  // Contact State
  const [contactMode, setContactMode] = useState<'link' | 'new' | 'none'>('none');
  const [selectedContactId, setSelectedContactId] = useState<string>('');
  const [newContactName, setNewContactName] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactCategory, setNewContactCategory] = useState<ContactCategory>('HR');
  const [contactSearch, setContactSearch] = useState('');

  const contacts = useMemo(() => contactPage?.content || [], [contactPage]);
  const filteredContacts = useMemo(() => 
    contacts.filter(c => c.name.toLowerCase().includes(contactSearch.toLowerCase())),
    [contacts, contactSearch]
  );

  if (!isAddModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !jobTitle) return;

    const payload: any = {
      companyName,
      jobTitle,
      status,
    };

    if (contactMode === 'link' && selectedContactId) {
      payload.contactId = selectedContactId;
    } else if (contactMode === 'new' && newContactName) {
      payload.contactName = newContactName;
      payload.contactEmail = newContactEmail || undefined;
      // Note: Category handling depends on backend DTO. 
      // Current ApplicationRequestDTO doesn't have category, 
      // but ApplicationServiceImpl defaults it to HR.
    }

    createApplication(payload, {
      onSuccess: () => {
        setIsAddModalOpen(false);
        resetForm();
      }
    });
  };

  const resetForm = () => {
    setCompanyName('');
    setJobTitle('');
    setStatus('APPLIED');
    setContactMode('none');
    setSelectedContactId('');
    setNewContactName('');
    setNewContactEmail('');
    setNewContactCategory('HR');
  };

  return (
    <>
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity" onClick={() => setIsAddModalOpen(false)} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between p-6 border-b border-border/30">
            <h2 className="text-xl font-bold text-foreground">Add Application</h2>
            <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-background rounded-lg text-foreground/50 hover:text-foreground transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
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

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">Application Status</label>
              <div className="flex flex-wrap gap-2">
                {(['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED'] as ApplicationStatus[]).map(s => (
                  <button key={s} type="button" onClick={() => setStatus(s)} className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${status === s ? 'bg-accent/20 border-accent text-accent' : 'bg-background border-border text-foreground/40 hover:border-foreground/20'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-border/30">
              <label className="text-sm font-medium text-foreground/80 flex items-center justify-between">
                Contact Person
                <div className="flex gap-1">
                   <button type="button" onClick={() => setContactMode('link')} className={`text-[10px] px-2 py-0.5 rounded ${contactMode === 'link' ? 'bg-accent text-white' : 'bg-background border border-border text-foreground/40'}`}>Link Existing</button>
                   <button type="button" onClick={() => setContactMode('new')} className={`text-[10px] px-2 py-0.5 rounded ${contactMode === 'new' ? 'bg-accent text-white' : 'bg-background border border-border text-foreground/40'}`}>Create New</button>
                   <button type="button" onClick={() => setContactMode('none')} className={`text-[10px] px-2 py-0.5 rounded ${contactMode === 'none' ? 'bg-accent text-white' : 'bg-background border border-border text-foreground/40'}`}>None</button>
                </div>
              </label>

              {contactMode === 'link' && (
                <div className="relative">
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                    <input 
                      type="text" 
                      placeholder="Search saved contacts..." 
                      value={contactSearch}
                      onChange={e => setContactSearch(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                    />
                  </div>
                  {contactSearch && (
                    <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-xl shadow-xl z-10 max-h-48 overflow-y-auto p-1 space-y-1">
                       {filteredContacts.length > 0 ? filteredContacts.map(c => (
                         <button key={c.id} type="button" onClick={() => { setSelectedContactId(c.id); setContactSearch(''); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${selectedContactId === c.id ? 'bg-accent/10 text-accent' : 'hover:bg-background text-foreground/60'}`}>
                           <div>
                             <div className="font-medium text-foreground">{c.name}</div>
                             <div className="text-[10px]">{c.companyName}</div>
                           </div>
                           {selectedContactId === c.id && <Check className="w-4 h-4" />}
                         </button>
                       )) : <div className="p-3 text-xs text-center text-foreground/40">No contacts found</div>}
                    </div>
                  )}
                  {selectedContactId && !contactSearch && (
                    <div className="mt-2 flex items-center gap-2 text-xs bg-accent/5 border border-accent/20 rounded-lg p-2 text-accent">
                       <LinkIcon className="w-3 h-3" />
                       Linked: <span className="font-bold">{contacts.find(c => c.id === selectedContactId)?.name}</span>
                    </div>
                  )}
                </div>
              )}

              {contactMode === 'new' && (
                <div className="grid grid-cols-2 gap-3 items-end">
                   <div className="space-y-1">
                     <span className="text-[10px] font-bold text-foreground/40 ml-1">Name</span>
                     <input value={newContactName} onChange={e => setNewContactName(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs" />
                   </div>
                   <div className="space-y-1">
                     <span className="text-[10px] font-bold text-foreground/40 ml-1">Email (Optional)</span>
                     <input value={newContactEmail} onChange={e => setNewContactEmail(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs" />
                   </div>
                </div>
              )}
            </div>

            <div className="pt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-5 py-2.5 rounded-xl font-medium text-foreground hover:bg-background transition-colors">Cancel</button>
              <button type="submit" disabled={isPending} className="bg-accent hover:bg-accent/90 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-accent/20 transition-all disabled:opacity-70">{isPending ? 'Processing...' : 'Create'}</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
