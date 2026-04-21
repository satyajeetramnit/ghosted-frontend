"use client";

import { useAuth } from '@/context/AuthContext';
import { useContacts, useCreateContact } from '@/hooks/useContacts';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Plus, Search, UserPlus, Mail, Building2, Tag, X, Phone, Link, ExternalLink } from 'lucide-react';
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
  const [phone, setPhone] = useState('');
  const [linkedInUrl, setLinkedInUrl] = useState('');
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
    createContact({ 
      name, 
      email: email || undefined, 
      phone: phone || undefined,
      linkedInUrl: linkedInUrl || undefined,
      companyName: company || undefined, 
      category 
    }, {
      onSuccess: () => {
        setIsModalOpen(false);
        setName('');
        setEmail('');
        setPhone('');
        setLinkedInUrl('');
        setCompany('');
        setCategory('HR');
      }
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      <header className="min-h-[72px] h-auto py-4 md:py-0 border-b border-border/30 px-6 flex flex-col sm:flex-row sm:items-center justify-between shrink-0 gap-4 sm:gap-0">
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
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-card/40 animate-pulse rounded-xl border border-border/20" />
            ))}
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
             <UserPlus className="w-12 h-12 mb-4 text-accent" />
             <p className="text-lg font-medium">No contacts found</p>
             <p className="text-sm">Start building your network for better job opportunities.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* List Header */}
            <div className="grid grid-cols-12 px-6 py-2 text-[11px] font-bold uppercase tracking-wider text-foreground/40 hidden md:grid">
              <div className="col-span-5">Contact Details</div>
              <div className="col-span-3 text-center">Connected Platforms</div>
              <div className="col-span-2 text-center">Category</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {filteredContacts.map(contact => (
              <div key={contact.id} className="grid grid-cols-1 md:grid-cols-12 items-center bg-card px-4 md:px-6 py-3 rounded-xl border border-border/50 hover:border-accent/30 hover:bg-accent/[0.02] transition-all group">
                {/* Info */}
                <div className="col-span-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent font-bold text-sm shrink-0">
                    {contact.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-foreground text-sm truncate">{contact.name}</h3>
                    <div className="text-xs text-foreground/50 flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      <span className="truncate">{contact.companyName || "No Company"}</span>
                    </div>
                  </div>
                </div>

                {/* Platform Icons */}
                <div className="col-span-3 flex items-center justify-center gap-3 mt-3 md:mt-0">
                  <a 
                    href={contact.email ? `mailto:${contact.email}` : '#'} 
                    onClick={(e) => !contact.email && e.preventDefault()}
                    className={`p-2 rounded-lg transition-colors ${contact.email ? 'text-accent hover:bg-accent/10' : 'text-foreground/10 cursor-not-allowed'}`}
                    title={contact.email || 'No Email'}
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                  <a 
                    href={contact.phone ? `tel:${contact.phone}` : '#'} 
                    onClick={(e) => !contact.phone && e.preventDefault()}
                    className={`p-2 rounded-lg transition-colors ${contact.phone ? 'text-blue-400 hover:bg-blue-400/10' : 'text-foreground/10 cursor-not-allowed'}`}
                    title={contact.phone || 'No Phone'}
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                  <a 
                    href={contact.linkedInUrl || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={(e) => !contact.linkedInUrl && e.preventDefault()}
                    className={`p-2 rounded-lg transition-colors ${contact.linkedInUrl ? 'text-[#0A66C2] hover:bg-[#0A66C2]/10' : 'text-foreground/10 cursor-not-allowed'}`}
                    title={contact.linkedInUrl || 'No LinkedIn'}
                  >
                    <Link className="w-4 h-4" />
                  </a>
                </div>

                {/* Category */}
                <div className="col-span-2 flex justify-center mt-2 md:mt-0">
                   <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    contact.category === 'HR' ? 'bg-blue-400/10 text-blue-400 border-blue-400/20' : 'bg-purple-400/10 text-purple-400 border-purple-400/20'
                  }`}>
                    {contact.category}
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 text-foreground/40 hover:text-foreground">
                    <ExternalLink className="w-4 h-4" />
                  </button>
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
                  <label className="text-sm font-medium text-foreground/80 ml-1">Company</label>
                  <input type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="Google" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground/80 ml-1">Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@example.com" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground/80 ml-1 underline decoration-accent/30">Phone</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 234..." className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground/80 ml-1 underline decoration-blue-500/30">LinkedIn URL</label>
                  <input type="url" value={linkedInUrl} onChange={e => setLinkedInUrl(e.target.value)} placeholder="https://linkedin.com/in/..." className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all" />
                </div>
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
