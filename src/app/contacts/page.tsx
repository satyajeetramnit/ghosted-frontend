"use client";

import { useAuth } from '@/context/AuthContext';
import { useContacts, useCreateContact, useUpdateContact, useDeleteContact } from '@/hooks/useContacts';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Plus, Search, UserPlus, Mail, Building2, X, Phone, Pencil, Trash2, MoreVertical } from 'lucide-react';
import { Contact, ContactCategory } from '@/types';

export default function ContactsPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const { data: contactPage, isLoading } = useContacts();
  const { mutate: createContact } = useCreateContact();
  const { mutate: updateContact } = useUpdateContact();
  const { mutate: deleteContact } = useDeleteContact();

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
    if (window.confirm('Are you sure you want to delete this contact?')) {
      deleteContact(id);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background/50">
      <header className="min-h-[72px] h-auto py-4 md:py-0 border-b border-border/30 px-6 flex flex-col sm:flex-row sm:items-center justify-between shrink-0 gap-4 sm:gap-0 bg-background/80 backdrop-blur-md sticky top-0 z-10">
        <h1 className="text-xl font-bold text-foreground">Contacts</h1>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
            <input 
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-card/50 border border-border/50 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent w-48 focus:w-64 transition-all"
            />
          </div>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex cursor-pointer items-center gap-2 bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all hover:shadow-lg hover:shadow-accent/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Contact
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="h-48 bg-card/40 animate-pulse rounded-2xl border border-border/20" />
            ))}
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
             <UserPlus className="w-16 h-16 mb-4 text-accent/40" />
             <p className="text-xl font-semibold">No contacts found</p>
             <p className="text-sm mt-1 max-w-xs">Start building your network for better job opportunities.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredContacts.map(contact => (
              <div key={contact.id} className="group bg-card hover:bg-card/80 p-5 rounded-2xl border border-border/50 hover:border-accent/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col gap-4 relative overflow-hidden">
                {/* Decorative background circle */}
                <div className="pointer-events-none absolute -right-4 -top-4 w-24 h-24 bg-accent/5 rounded-full blur-2xl group-hover:bg-accent/10 transition-colors" />
                
                <div className="flex justify-between items-start relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-bold text-lg">
                    {contact.name.charAt(0)}
                  </div>
                  
                  <div className="flex gap-1">
                    <button 
                      onClick={() => setEditingContact(contact)}
                      className="cursor-pointer p-2 text-foreground/40 hover:text-accent hover:bg-accent/10 rounded-lg transition-all active:scale-90"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(contact.id)}
                      className="cursor-pointer p-2 text-foreground/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all active:scale-90"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-foreground text-base truncate">{contact.name}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                      contact.category === 'HR' ? 'bg-blue-400/10 text-blue-400 border-blue-400/20' : 'bg-purple-400/10 text-purple-400 border-purple-400/20'
                    }`}>
                      {contact.category}
                    </span>
                  </div>
                  <div className="text-sm text-foreground/50 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    <span className="truncate">{contact.companyName || "No Company"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-auto pt-4 border-t border-border/30">
                  <a 
                    href={contact.email ? `mailto:${contact.email}` : undefined} 
                    className={`flex-1 flex items-center justify-center py-2 rounded-lg transition-all ${contact.email ? 'bg-accent/5 text-accent hover:bg-accent/10 cursor-pointer' : 'bg-foreground/5 text-foreground/20 cursor-not-allowed'}`}
                    title={contact.email || 'No Email'}
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                  <a 
                    href={contact.phone ? `tel:${contact.phone}` : undefined} 
                    className={`flex-1 flex items-center justify-center py-2 rounded-lg transition-all ${contact.phone ? 'bg-blue-400/5 text-blue-400 hover:bg-blue-400/10 cursor-pointer' : 'bg-foreground/5 text-foreground/20 cursor-not-allowed'}`}
                    title={contact.phone || 'No Phone'}
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                  <a 
                    href={contact.linkedInUrl || undefined} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`flex-1 flex items-center justify-center py-2 rounded-lg transition-all ${contact.linkedInUrl ? 'bg-[#0A66C2]/5 text-[#0A66C2] hover:bg-[#0A66C2]/10 cursor-pointer' : 'bg-foreground/5 text-foreground/20 cursor-not-allowed'}`}
                    title={contact.linkedInUrl || 'No LinkedIn'}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4"
                    >
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                      <rect x="2" y="9" width="4" height="12"></rect>
                      <circle cx="4" cy="4" r="2"></circle>
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add/Edit Contact Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={closeModal} />
          <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-border/30">
              <h2 className="text-xl font-bold text-foreground">
                {editingContact ? 'Edit Contact' : 'New Contact'}
              </h2>
              <button onClick={closeModal} className="cursor-pointer p-2 hover:bg-background rounded-lg text-foreground/50 hover:text-foreground transition-colors">
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
                <button type="button" onClick={closeModal} className="cursor-pointer px-5 py-2.5 rounded-xl font-medium text-foreground hover:bg-background transition-colors">Cancel</button>
                <button type="submit" className="cursor-pointer bg-accent hover:bg-accent/90 text-white px-5 py-2.5 rounded-xl font-medium transition-colors">
                  {editingContact ? 'Save Changes' : 'Create Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

