"use client";

import { useApplicationStore } from '../store/useApplicationStore';
import { useUpdateApplicationStatus, useAddNote, useUpdateOA, useAddInterview, useUpdateInterview } from '../hooks/useApplications';
import { X, Building2, UserCircle2, Calendar, FileText, Loader2, Mail, Tag, ClipboardList, Mic2, Plus, Clock, ExternalLink, CheckCircle2, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { ApplicationStatus, InterviewType } from '../types';
import { useState } from 'react';

export default function ApplicationDrawer() {
  const { selectedApplication, setSelectedApplication } = useApplicationStore();
  const { mutate: updateStatus } = useUpdateApplicationStatus();
  const { mutate: addNote, isPending: isAddingNote } = useAddNote();
  const { mutate: updateOA, isPending: isUpdatingOA } = useUpdateOA();
  const { mutate: updateInterview, isPending: isUpdatingInterview } = useUpdateInterview();

  const [noteContent, setNoteContent] = useState('');
  const [showAddInterview, setShowAddInterview] = useState(false);
  
  // Funnel Editing State
  const [editingOA, setEditingOA] = useState(false);
  const [oaNotes, setOANotes] = useState(selectedApplication?.oa?.notes || '');
  const [editingInterviewId, setEditingInterviewId] = useState<string | null>(null);
  const [roundNotes, setRoundNotes] = useState('');

  if (!selectedApplication) return null;

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as ApplicationStatus;
    setSelectedApplication({ ...selectedApplication, status: newStatus });
    updateStatus({ id: selectedApplication.id, status: newStatus });
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent) return;
    addNote({ id: selectedApplication.id, content: noteContent }, {
      onSuccess: () => {
        setNoteContent('');
      }
    });
  };

  const contact = selectedApplication.contact;

  return (
    <>
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity" onClick={() => setSelectedApplication(null)} />
      
      <div className="fixed top-0 right-0 h-full w-full sm:max-w-md bg-card border-l border-border shadow-2xl z-50 transform transition-transform animate-in slide-in-from-right duration-200 ease-out flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-border/30 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2 text-left">
              <Building2 className="w-5 h-5 text-accent" />
              {selectedApplication.companyName}
            </h2>
            <p className="text-foreground/60 text-sm mt-1 text-left">{selectedApplication.jobTitle}</p>
          </div>
          
          <button onClick={() => setSelectedApplication(null)} className="p-2 hover:bg-background rounded-lg text-foreground/50 hover:text-foreground transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
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

          {/* Recruitment Funnel Section */}
          <div className="space-y-6">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
               <Tag className="w-4 h-4 text-accent" />
               Recruitment Funnel
            </h3>

            {/* OA Section */}
            <div className="bg-accent/5 rounded-2xl p-4 border border-accent/10 space-y-3">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <ClipboardList className="w-4 h-4 text-accent" />
                    Online Assessment
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/20 text-accent uppercase">
                    {selectedApplication.oa?.status || 'PENDING'}
                  </span>
               </div>
               {selectedApplication.oa ? (
                 <div className="text-xs text-foreground/60 space-y-1 pl-6">
                    <p>Platform: <span className="text-foreground">{selectedApplication.oa.platform}</span></p>
                    <p>Deadline: <span className="text-foreground">{selectedApplication.oa.deadline ? format(new Date(selectedApplication.oa.deadline), 'MMM d, p') : 'No deadline'}</span></p>
                    
                    <div className="mt-4 space-y-2">
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-tighter">Experience & Questions</span>
                          {!editingOA && (
                             <button 
                               onClick={() => { setOANotes(selectedApplication.oa?.notes || ''); setEditingOA(true); }}
                               className="text-accent hover:underline font-bold text-[10px]"
                             >
                                Edit
                             </button>
                          )}
                       </div>
                       
                       {editingOA ? (
                         <div className="space-y-2">
                           <textarea
                             value={oaNotes}
                             onChange={(e) => setOANotes(e.target.value)}
                             placeholder="What questions were asked? Any technical challenges?"
                             className="w-full bg-background border border-border rounded-lg p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent min-h-[80px]"
                           />
                           <div className="flex justify-end gap-2">
                             <button onClick={() => setEditingOA(false)} className="px-2 py-1 text-[10px] font-bold text-foreground/50 hover:text-foreground">Cancel</button>
                             <button 
                               onClick={() => updateOA({ applicationId: selectedApplication.id, data: { ...selectedApplication.oa, notes: oaNotes } }, { onSuccess: () => setEditingOA(false) })}
                               className="px-2 py-1 bg-accent text-white rounded text-[10px] font-bold flex items-center gap-1"
                               disabled={isUpdatingOA}
                             >
                               {isUpdatingOA && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
                               Save
                             </button>
                           </div>
                         </div>
                       ) : (
                         <p className="text-[11px] text-foreground/80 line-clamp-3 bg-background/30 p-2 rounded-lg border border-border/10">
                           {selectedApplication.oa.notes || "No details added yet. Click edit to record questions or experience."}
                         </p>
                       )}
                    </div>
                 </div>
               ) : (
                 <button className="w-full py-2 border border-dashed border-accent/20 rounded-xl text-xs text-accent/60 hover:bg-accent/5 transition-colors">
                   + Setup OA Round
                 </button>
               )}
            </div>

            {/* Interviews Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <Mic2 className="w-4 h-4 text-accent" />
                  Interview Rounds
                </div>
                <button 
                  onClick={() => setShowAddInterview(true)}
                  className="p-1 hover:bg-background rounded-md text-accent transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                {selectedApplication.interviews?.length > 0 ? (
                  selectedApplication.interviews.map((round) => (
                    <div key={round.id} className="space-y-2">
                       <div className="bg-background border border-border/50 rounded-xl p-3 flex items-center justify-between group hover:border-accent/30 transition-all">
                         <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-card border border-border/30 flex items-center justify-center text-accent">
                             <Clock className="w-4 h-4" />
                           </div>
                           <div className="text-left">
                             <p className="text-xs font-bold text-foreground capitalize">{round.type.toLowerCase()} Round</p>
                             <p className="text-[10px] text-foreground/50">{format(new Date(round.scheduledAt), 'MMM d, h:mm a')}</p>
                           </div>
                         </div>
                         <div className="flex items-center gap-2">
                            {!editingInterviewId && (
                               <button 
                                 onClick={() => { setEditingInterviewId(round.id); setRoundNotes(round.notes || ''); }}
                                 className="text-[9px] font-bold text-accent opacity-0 group-hover:opacity-100 transition-opacity"
                               >
                                 Notes
                               </button>
                            )}
                            <span className="text-[9px] font-bold text-foreground/40">{round.status}</span>
                            {round.meetingLink && (
                              <a href={round.meetingLink} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-accent/10 rounded-md text-accent">
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                         </div>
                       </div>
                       
                       {(editingInterviewId === round.id || round.notes) && (
                         <div className="pl-11 pr-2 pb-2">
                            {editingInterviewId === round.id ? (
                              <div className="space-y-2">
                                <textarea
                                  value={roundNotes}
                                  onChange={(e) => setRoundNotes(e.target.value)}
                                  placeholder="How did it go? What questions were asked?"
                                  className="w-full bg-background border border-border rounded-lg p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent min-h-[80px]"
                                />
                                <div className="flex justify-end gap-2">
                                  <button onClick={() => setEditingInterviewId(null)} className="px-2 py-1 text-[10px] font-bold text-foreground/50 hover:text-foreground">Cancel</button>
                                  <button 
                                    onClick={() => updateInterview({ applicationId: selectedApplication.id, interviewId: round.id, data: { ...round, notes: roundNotes } }, { onSuccess: () => setEditingInterviewId(null) })}
                                    className="px-2 py-1 bg-accent text-white rounded text-[10px] font-bold flex items-center gap-1"
                                    disabled={isUpdatingInterview}
                                  >
                                    {isUpdatingInterview && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
                                    Save
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-accent/5 p-3 rounded-lg border border-accent/10 relative group">
                                 <p className="text-[10px] text-foreground/70 whitespace-pre-wrap">{round.notes}</p>
                                 <button 
                                   onClick={() => { setEditingInterviewId(round.id); setRoundNotes(round.notes || ''); }}
                                   className="absolute top-2 right-2 text-accent text-[9px] font-bold opacity-0 group-hover:opacity-100"
                                 >
                                   Edit
                                 </button>
                              </div>
                            )}
                         </div>
                       )}
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-foreground/30 italic text-center py-2">No interview rounds scheduled yet.</p>
                )}
              </div>
            </div>
          </div>

          <hr className="border-border/30" />

          {/* Contact Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
               <UserCircle2 className="w-4 h-4 text-accent" />
               Contact Details
            </h3>
            
            {contact ? (
              <div className="bg-background/50 rounded-2xl p-4 border border-border/50 space-y-3">
                 <div className="flex items-center justify-between">
                    <div className="font-bold text-foreground">{contact.name}</div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      contact.category === 'HR' ? 'bg-blue-400/10 text-blue-400 border-blue-400/20' : 'bg-purple-400/10 text-purple-400 border-purple-400/20'
                    }`}>
                      {contact.category}
                    </span>
                 </div>
                 <div className="flex flex-wrap gap-3">
                    {contact.email && (
                      <div className="flex items-center gap-2 text-xs text-foreground/60">
                         <Mail className="w-3.5 h-3.5" />
                         {contact.email}
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center gap-2 text-xs text-foreground/60">
                         <Phone className="w-3.5 h-3.5" />
                         {contact.phone}
                      </div>
                    )}
                 </div>
              </div>
            ) : (
              <p className="text-sm text-foreground/40 italic">No contact linked to this application.</p>
            )}

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
                placeholder="Log a new update..."
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
