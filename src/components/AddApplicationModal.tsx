"use client";

import { useApplicationStore } from '../store/useApplicationStore';
import { useCreateApplication } from '../hooks/useApplications';
import { X } from 'lucide-react';
import { useState } from 'react';
import { ApplicationStatus } from '../types';

export default function AddApplicationModal() {
  const { isAddModalOpen, setIsAddModalOpen } = useApplicationStore();
  const { mutate: createApplication, isPending } = useCreateApplication();

  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [status, setStatus] = useState<ApplicationStatus>('APPLIED');
  const [contactName, setContactName] = useState('');

  if (!isAddModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !jobTitle) return;

    createApplication({ companyName, jobTitle, status, contactName: contactName || undefined }, {
      onSuccess: () => {
        setIsAddModalOpen(false);
        setCompanyName('');
        setJobTitle('');
        setStatus('APPLIED');
        setContactName('');
      }
    });
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity"
        onClick={() => setIsAddModalOpen(false)}
      />
      
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between p-6 border-b border-border/30">
            <h2 className="text-xl font-bold text-foreground">Add Application</h2>
            <button 
               type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="p-2 hover:bg-background rounded-lg text-foreground/50 hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            <div className="space-y-1.5 text-left">
              <label className="text-sm font-medium text-foreground/80 ml-1">Company</label>
              <input 
                required
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Google, Stripe..."
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
              />
            </div>
            
            <div className="space-y-1.5 text-left">
              <label className="text-sm font-medium text-foreground/80 ml-1">Role</label>
              <input 
                required
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Senior Frontend Engineer"
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 text-left">
                <label className="text-sm font-medium text-foreground/80 ml-1">Status</label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all appearance-none"
                >
                  <option value="APPLIED">Applied</option>
                  <option value="SCREENING">Screening</option>
                  <option value="INTERVIEW">Interview</option>
                  <option value="OFFER">Offer</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-sm font-medium text-foreground/80 ml-1 flex justify-between">
                  HR Contact <span className="text-foreground/40 text-xs">Optional</span>
                </label>
                <input 
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Name"
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-5 py-2.5 rounded-xl font-medium text-foreground hover:bg-background transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="bg-accent hover:bg-accent/90 text-white px-5 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-70 flex items-center justify-center cursor-pointer"
              >
                {isPending ? 'Adding...' : 'Add Application'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  );
}
