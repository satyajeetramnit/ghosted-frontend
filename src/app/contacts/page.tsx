"use client";

import { useAuth } from '@/context/AuthContext';
import { useContacts, useCreateContact } from '@/hooks/useContacts';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Plus, Search, UserPlus, Mail, Building2, Tag, X } from 'lucide-react';
import { Contact, ContactCategory } from '@/types';

export default function ContactsPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const { data: contactPage, isLoading } = useContacts();
  const { mutate: createContact } = useCreateContact();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [category, setCategory] = useState<ContactCategory>('HR');

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  if (isAuthLoading || !user) return null;

  const contacts: Contact[] = contactPage?.content || [];
  const filteredContacts = contacts.filter((c: Contact) => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createContact({ name, email: email || undefined, companyName: company || undefined, category }, {
      onSuccess: () => {
        setIsModalOpen(false);
        setName('');
        setEmail('');
        setCompany('');
        setCategory('HR');
      }
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      <header className="h-[72px] border-b border-border/30 px-6 flex items-center justify-between shrink-0">
        <h1 className="text-xl font-bold text-foreground">Contacts</h1>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
            <input 
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent w-48 transition-all focus:w-64"
            />
          </div>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Contact
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-card/40 animate-pulse rounded-2xl border border-border/20" />
            ))}
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
             <UserPlus className="w-12 h-12 mb-4 text-accent" />
             <p className="text-lg font-medium">No contacts found</p>
             <p className="text-sm">Start building your network for better job opportunities.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContacts.map(contact => (
              <div key={contact.id} className="bg-card p-5 rounded-2xl border border-border/50 hover:border-accent/30 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
                
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-bold text-lg">
                    {contact.name.charAt(0)}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    contact.category === 'HR' ? 'bg-blue-400/10 text-blue-400 border-blue-400/20' : 'bg-purple-400/10 text-purple-400 border-purple-400/20'
                  }`}>
                    {contact.category}
                  </span>
                </div>

                <h3 className="font-bold text-foreground text-lg mb-1">{contact.name}</h3>
                
                <div className="space-y-2 mt-4">
                  {contact.companyName && (
                    <div className="flex items-center gap-2 text-sm text-foreground/60">
                      <Building2 className="w-4 h-4" />
                      {contact.companyName}
                    </div>
                  )}
                  {contact.email && (
                    <div className="flex items-center gap-2 text-sm text-foreground/60">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add Contact Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-border/30">
              <h2 className="text-xl font-bold text-foreground">New Contact</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-background rounded-lg text-foreground/50 hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground/80 ml-1">Full Name</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Jane Doe" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground/80 ml-1">Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value as ContactCategory)} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 appearance-none">
                    <option value="HR">HR / Recruiter</option>
                    <option value="POI">POI / Referral</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground/80 ml-1 text-foreground/40">Company (Optional)</label>
                  <input type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="Google" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground/80 ml-1 text-foreground/40">Email (Optional)</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@example.com" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all" />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-medium text-foreground hover:bg-background transition-colors">Cancel</button>
                <button type="submit" className="bg-accent hover:bg-accent/90 text-white px-5 py-2.5 rounded-xl font-medium transition-colors">Create Contact</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
