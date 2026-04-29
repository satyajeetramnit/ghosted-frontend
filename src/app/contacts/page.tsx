"use client";

import { useAuth } from '@/context/AuthContext';
import { useContacts, useCreateContact, useUpdateContact, useDeleteContact } from '@/hooks/useContacts';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Plus, Search, UserPlus, Mail, Building2, X, Phone, Pencil, Trash2, Globe, Sparkles, Loader2, UserCircle2, ShieldCheck, ExternalLink } from 'lucide-react';
import { Contact, ContactCategory } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

export default function ContactsPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const { data: contactPage, isLoading } = useContacts();
  const { mutate: createContact, isPending: isCreating } = useCreateContact();
  const { mutate: updateContact, isPending: isUpdating } = useUpdateContact();
  const { mutate: deleteContact, isPending: isDeleting } = useDeleteContact();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [linkedInUrl, setLinkedInUrl] = useState('');
  const [company, setCompany] = useState('');
  const [category, setCategory] = useState<ContactCategory>('HR');

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  useEffect(() => {
    if (editingContact) {
      setName(editingContact.name);
      setEmail(editingContact.email || '');
      setPhone(editingContact.phone || '');
      setLinkedInUrl(editingContact.linkedInUrl || '');
      setCompany(editingContact.companyName || '');
      setCategory(editingContact.category);
      setIsModalOpen(true);
    }
  }, [editingContact]);

  if (isAuthLoading || !user) return null;

  const contacts: Contact[] = contactPage?.content || [];
  const filteredContacts = contacts.filter((c: Contact) => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const contactData = { 
      name, 
      email: email || undefined, 
      phone: phone || undefined,
      linkedInUrl: linkedInUrl || undefined,
      companyName: company || undefined, 
      category 
    };

    if (editingContact) {
      updateContact({ id: editingContact.id, data: contactData }, {
        onSuccess: () => closeModal()
      });
    } else {
      createContact(contactData, {
        onSuccess: () => closeModal()
      });
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingContact(null);
    setName('');
    setEmail('');
    setPhone('');
    setLinkedInUrl('');
    setCompany('');
    setCategory('HR');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this stakeholder from your intelligence network?')) {
      deleteContact(id);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent relative">
      {/* Header Section */}
      <header className="pt-10 pb-8 px-10 flex flex-col gap-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
             <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] mb-2">
               <Globe className="w-3.5 h-3.5" />
               <span>Global Network</span>
             </div>
             <h1 className="text-4xl font-bold tracking-tight text-foreground font-outfit">Stakeholder Hub</h1>
             <p className="text-muted-foreground font-medium max-w-lg leading-relaxed">
               Manage key recruitment contacts, hiring managers, and professional referrals within your strategic workspace.
             </p>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="relative group">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within:text-foreground transition-colors" />
                <input 
                  type="text"
                  placeholder="Scan directory..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-11 pr-5 py-3.5 bg-surface border border-border-muted rounded-2xl text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/10 w-64 transition-all placeholder:text-muted-foreground/20"
                />
             </div>
             
             <button
               onClick={() => setIsModalOpen(true)}
               className="flex items-center gap-2.5 bg-foreground text-background px-6 py-3.5 rounded-full text-xs font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
             >
               <Plus className="w-4 h-4" />
               Establish Connection
             </button>
          </div>
        </div>

        {/* Quick Stats / Filters */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar">
           <button className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-foreground text-background border border-foreground shadow-lg">All Entities</button>
           <button className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-surface text-muted-foreground/60 border border-border-muted hover:border-border transition-all">Recruiters</button>
           <button className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-surface text-muted-foreground/60 border border-border-muted hover:border-border transition-all">Stakeholders</button>
           <button className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-surface text-muted-foreground/60 border border-border-muted hover:border-border transition-all">Referrals</button>
        </div>
      </header>

      <main className="flex-1 px-10 pb-20 relative z-10">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="h-64 bg-surface/30 animate-pulse rounded-[2rem] border border-border-muted/50" />
            ))}
          </div>
        ) : filteredContacts.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-[50vh] flex flex-col items-center justify-center text-center space-y-4"
          >
             <div className="w-20 h-20 rounded-[2rem] bg-surface border border-border-muted flex items-center justify-center text-muted-foreground/20">
               <UserPlus className="w-10 h-10" />
             </div>
             <div className="space-y-1">
                <p className="text-xl font-bold text-foreground">Silent Network</p>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">No stakeholders found matching your criteria. Establish new professional connections to expand your reach.</p>
             </div>
             <button 
                onClick={() => setIsModalOpen(true)}
                className="text-[10px] font-black uppercase tracking-widest text-foreground hover:underline underline-offset-8 transition-all"
             >
               Add First Contact
             </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredContacts.map((contact, idx) => (
                <motion.div 
                  key={contact.id} 
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group relative bg-surface/40 hover:bg-surface p-7 rounded-[2.5rem] border border-border-muted hover:border-border transition-all duration-500 flex flex-col gap-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]"
                >
                  <div className="flex justify-between items-start">
                    <div className="w-14 h-14 rounded-2xl bg-background border border-border-muted flex items-center justify-center text-foreground font-outfit font-bold text-xl group-hover:scale-110 transition-all duration-500 shadow-sm">
                      {contact.name.charAt(0)}
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button 
                        onClick={() => setEditingContact(contact)}
                        className="p-2 text-muted-foreground/40 hover:text-foreground hover:bg-background rounded-xl transition-all"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(contact.id)}
                        className="p-2 text-muted-foreground/20 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-foreground text-lg tracking-tight font-outfit truncate">{contact.name}</h3>
                      {contact.category === 'POI' && (
                        <span title="Point of Influence">
                          <ShieldCheck className="w-3.5 h-3.5 text-foreground/20" />
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                       <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest border shrink-0 transition-colors ${
                         contact.category === 'HR' ? 'bg-surface border-border-muted text-muted-foreground/60' : 'bg-foreground text-background border-foreground'
                       }`}>
                         {contact.category === 'HR' ? 'Recruiter' : 'Influencer'}
                       </span>
                       <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground/40 truncate">
                         <Building2 className="w-3 h-3" />
                         <span>{contact.companyName || "Independent"}</span>
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border-muted">
                    <ContactTrigger 
                      href={contact.email ? `mailto:${contact.email}` : undefined} 
                      icon={<Mail className="w-4 h-4" />}
                      active={!!contact.email}
                      label="Mail"
                    />
                    <ContactTrigger 
                      href={contact.phone ? `tel:${contact.phone}` : undefined} 
                      icon={<Phone className="w-4 h-4" />}
                      active={!!contact.phone}
                      label="Call"
                    />
                    <ContactTrigger 
                      href={contact.linkedInUrl || undefined} 
                      icon={<Globe className="w-4 h-4" />}
                      active={!!contact.linkedInUrl}
                      label="Link"
                    />
                  </div>
                  
                  {/* Subtle Gradient Glow on hover */}
                  <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Add/Edit Contact Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/60 backdrop-blur-[12px]" 
              onClick={closeModal} 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-background border border-border shadow-[0_20px_80px_rgba(0,0,0,0.2)] rounded-[2.5rem] overflow-hidden flex flex-col"
            >
              {/* Subtle Grain */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.02] mix-blend-overlay z-0" 
                   style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3%3Cfilter id='noiseFilter'%3%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3%3C/filter%3%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3%3C/svg%3")` }} 
              />

              <div className="relative z-10 px-10 pt-10 pb-6 flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-3xl font-bold tracking-tight text-foreground font-outfit">
                    {editingContact ? 'Refine Connection' : 'New Stakeholder'}
                  </h2>
                  <p className="text-muted-foreground text-sm font-medium italic">Establishing professional influence.</p>
                </div>
                <button onClick={closeModal} className="p-3 rounded-2xl bg-surface border border-border-muted text-muted-foreground hover:text-foreground transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="relative z-10 p-10 pt-0 space-y-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">Entity Name</label>
                    <div className="relative">
                      <UserCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30" />
                      <input required value={name} onChange={e => setName(e.target.value)} placeholder="Jane Doe" className="w-full bg-surface border border-border-muted rounded-2xl pl-12 pr-5 py-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-foreground/10 transition-all placeholder:text-muted-foreground/20" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">Classification</label>
                      <select value={category} onChange={e => setCategory(e.target.value as ContactCategory)} className="w-full bg-surface border border-border-muted rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-foreground/10 appearance-none cursor-pointer">
                        <option value="HR">HR / Recruiter</option>
                        <option value="POI">POI / Referral</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">Organization</label>
                      <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30" />
                        <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Stripe, Vercel..." className="w-full bg-surface border border-border-muted rounded-2xl pl-12 pr-5 py-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-foreground/10 transition-all placeholder:text-muted-foreground/20" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">Digital Identity (Email)</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30" />
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@enterprise.com" className="w-full bg-surface border border-border-muted rounded-2xl pl-12 pr-5 py-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-foreground/10 transition-all" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">Voice (Phone)</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30" />
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 234..." className="w-full bg-surface border border-border-muted rounded-2xl pl-12 pr-5 py-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-foreground/10 transition-all" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">Social Intel (LinkedIn)</label>
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30" />
                        <input type="url" value={linkedInUrl} onChange={e => setLinkedInUrl(e.target.value)} placeholder="linkedin.com/in/..." className="w-full bg-surface border border-border-muted rounded-2xl pl-12 pr-5 py-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-foreground/10 transition-all" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-8 flex items-center justify-between border-t border-border-muted">
                  <button type="button" onClick={closeModal} className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/40 hover:text-foreground transition-colors">Abort</button>
                  <button 
                    type="submit" 
                    disabled={isCreating || isUpdating}
                    className="bg-foreground text-background px-10 py-4 rounded-full font-black uppercase tracking-widest text-[11px] shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center gap-3"
                  >
                    {isCreating || isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    <span>{editingContact ? 'Commit Changes' : 'Establish Connection'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ContactTrigger({ href, icon, active, label }: { href?: string, icon: React.ReactNode, active: boolean, label: string }) {
  if (!active || !href) {
    return (
      <div className="flex flex-col items-center gap-2 py-3 rounded-[1.5rem] bg-background/20 text-muted-foreground/10 border border-transparent cursor-not-allowed">
        {icon}
        <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
      </div>
    );
  }

  return (
    <a 
      href={href} 
      target={href.startsWith('http') ? "_blank" : undefined}
      rel={href.startsWith('http') ? "noopener noreferrer" : undefined}
      className="flex flex-col items-center gap-2 py-3 rounded-[1.5rem] bg-background border border-border-muted text-muted-foreground/40 hover:text-foreground hover:border-border transition-all group/trigger"
    >
      <div className="group-hover:scale-110 transition-transform">{icon}</div>
      <span className="text-[9px] font-black uppercase tracking-widest group-hover:text-foreground">{label}</span>
    </a>
  );
}
