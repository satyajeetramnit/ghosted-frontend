"use client";

import { useApplicationStore } from '../store/useApplicationStore';
import { useUpdateApplicationStatus, useAddNote } from '../hooks/useApplications';
import { X, Building2, UserCircle2, Calendar, FileText, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ApplicationStatus } from '../types';
import { useState } from 'react';

export default function ApplicationDrawer() {
  const { selectedApplication, setSelectedApplication } = useApplicationStore();
  const { mutate: updateStatus } = useUpdateApplicationStatus();
  const { mutate: addNote, isPending: isAddingNote } = useAddNote();

  const [noteContent, setNoteContent] = useState('');

  if (!selectedApplication) return null;

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as ApplicationStatus;
    // We update UI optimistically in store
    setSelectedApplication({ ...selectedApplication, status: newStatus });
    updateStatus({ id: selectedApplication.id, status: newStatus });
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent) return;
    addNote({ id: selectedApplication.id, content: noteContent }, {
      onSuccess: () => {
        setNoteContent('');
        // Note: For full real-time feel, we could push the Note back to selectedApplication.notes here if we add that array
      }
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity"
        onClick={() => setSelectedApplication(null)}
      />
      
      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full sm:max-w-md bg-card border-l border-border shadow-2xl z-50 transform transition-transform animate-in slide-in-from-right duration-200 ease-out flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/30 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Building2 className="w-5 h-5 text-accent" />
              {selectedApplication.companyName}
            </h2>
            <p className="text-foreground/60 text-sm mt-1">{selectedApplication.jobTitle}</p>
          </div>
          
          <button 
            type="button"
            onClick={() => setSelectedApplication(null)}
            className="p-2 hover:bg-background rounded-lg text-foreground/50 hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Status Select */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-foreground/50 font-medium">Current Status</span>
            <select
              value={selectedApplication.status}
              onChange={handleStatusChange}
              className="bg-background border border-border text-foreground text-sm font-medium rounded-lg focus:ring-accent focus:border-accent block w-32 p-1.5 focus:outline-none"
            >
              <option value="APPLIED">Applied</option>
              <option value="SCREENING">Screening</option>
              <option value="INTERVIEW">Interview</option>
              <option value="OFFER">Offer</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <hr className="border-border/30" />

          {/* Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Details</h3>
            
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center text-foreground/50 shrink-0">
                <UserCircle2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-foreground/50 text-xs text-left">Contact</div>
                <div className="text-foreground">{selectedApplication.contactName || 'Unspecified'}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center text-foreground/50 shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <div className="text-foreground/50 text-xs text-left">Applied Date</div>
                <div className="text-foreground">{format(new Date(selectedApplication.appliedDate), 'MMM d, yyyy')}</div>
              </div>
            </div>
          </div>

          <hr className="border-border/30" />

          {/* Inline Notes Editor */}
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Notes
              </h3>
            </div>
            
            <form onSubmit={handleAddNote}>
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Log a new update, interview note, or feedback..."
                className="w-full bg-background border border-border rounded-xl p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all min-h-[100px] resize-none"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={isAddingNote || !noteContent.trim()}
                  className="bg-accent text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-accent/90 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {isAddingNote && <Loader2 className="w-3 h-3 animate-spin" />}
                  Save Note
                </button>
              </div>
            </form>
          </div>
          
        </div>
      </div>
    </>
  );
}
