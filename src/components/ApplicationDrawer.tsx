"use client";

import { ApplicationStatus, Note } from '../types';
import { useApplicationStore } from '../store/useApplicationStore';
import { useResumeStore } from '../store/useResumeStore';
import { useUpdateApplicationStatus, useAddNote, useUpdateOA, useUpdateInterview, useDeleteInterview, useApplicationById, useNotes, useUpdateAppliedDate, useUpdateContacts, useDeleteApplication } from '../hooks/useApplications';
import { useContacts } from '../hooks/useContacts';
import { X, Building2, UserCircle2, Calendar, FileText, Loader2, Mail, Tag, ClipboardList, Mic2, Plus, Clock, ExternalLink, Phone, Trash2, Link as LinkIcon, Bell, Globe, Pencil, Search, BookOpen, ChevronDown } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { parseLocalDate } from '../services/api';
import { useState, useEffect, useMemo } from 'react';
import SetupOAModal from './SetupOAModal';
import AddInterviewRoundModal from './AddInterviewRoundModal';

export default function ApplicationDrawer() {
  const { selectedApplication: storeApp, setSelectedApplication } = useApplicationStore();
  const selectedId = storeApp?.id;

  // Dedicated query for the selected application — always fresh data
  const { data: selectedApplication, isLoading: isRefetching } = useApplicationById(selectedId);
  const { data: notes = [], isLoading: isLoadingNotes } = useNotes(selectedId);
  const { data: contactPage } = useContacts();

  const { mutate: updateStatus } = useUpdateApplicationStatus();
  const { mutate: addNote, isPending: isAddingNote } = useAddNote();
  const { mutate: updateOA, isPending: isUpdatingOA } = useUpdateOA();
  const { mutate: updateInterview, isPending: isUpdatingInterview } = useUpdateInterview();
  const { mutate: deleteInterview, isPending: isDeletingInterview } = useDeleteInterview();
  const { mutate: updateAppliedDate, isPending: isSavingDate } = useUpdateAppliedDate();
  const { mutate: updateContacts, isPending: isSavingContacts } = useUpdateContacts();
  const { mutate: deleteApplication, isPending: isDeletingApplication } = useDeleteApplication();

  const { savedResumes, updateResume } = useResumeStore();
  const [showResumeDropdown, setShowResumeDropdown] = useState(false);

  const [noteContent, setNoteContent] = useState('');
  const [showAddInterview, setShowAddInterview] = useState(false);
  const [showSetupOA, setShowSetupOA] = useState(false);

  // Funnel Editing State
  const [editingOA, setEditingOA] = useState(false);
  const [oaNotes, setOANotes] = useState('');
  const [editingInterviewId, setEditingInterviewId] = useState<string | null>(null);
  const [roundNotes, setRoundNotes] = useState('');

  // Applied date editing
  const [editingDate, setEditingDate] = useState(false);
  const [dateValue, setDateValue] = useState('');

  // Contacts editing
  const [editingContacts, setEditingContacts] = useState(false);
  const [pendingContactIds, setPendingContactIds] = useState<string[]>([]);
  const [contactSearch, setContactSearch] = useState('');

  const allContacts = useMemo(() => contactPage?.content || [], [contactPage]);
  const pendingContacts = useMemo(() => allContacts.filter(c => pendingContactIds.includes(c.id)), [allContacts, pendingContactIds]);
  const searchResults = useMemo(() => {
    const q = contactSearch.toLowerCase();
    if (!q) return [];
    return allContacts.filter(c => !pendingContactIds.includes(c.id) && (
      c.name.toLowerCase().includes(q) || c.companyName?.toLowerCase().includes(q)
    )).slice(0, 6);
  }, [allContacts, contactSearch, pendingContactIds]);

  // Sync state if application changes
  useEffect(() => {
    setEditingOA(false);
    setEditingInterviewId(null);
    setShowSetupOA(false);
    setShowAddInterview(false);
    setNoteContent('');
    setOANotes('');
    setEditingDate(false);
    setEditingContacts(false);
    setShowResumeDropdown(false);
  }, [selectedApplication?.id]);

  if (!storeApp) return null;

  // Show skeleton while fetching fresh data
  if (isRefetching && !selectedApplication) {
    return (
      <>
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40" onClick={() => setSelectedApplication(null)} />
        <div className="fixed top-0 right-0 h-full w-full sm:max-w-md bg-card border-l border-border shadow-2xl z-50 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    );
  }

  // Fall back to storeApp if query hasn't resolved yet
  const app = selectedApplication || storeApp;

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as ApplicationStatus;
    setSelectedApplication({ ...app, status: newStatus });
    updateStatus({ id: app.id, status: newStatus });
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    addNote({ id: app.id, content: noteContent }, {
      onSuccess: () => {
        setNoteContent('');
      }
    });
  };

  const handleDeleteInterview = (interviewId: string) => {
    if (!confirm('Remove this interview round?')) return;
    deleteInterview({ applicationId: app.id, interviewId });
  };

  const handleSaveDate = () => {
    if (!dateValue) return;
    updateAppliedDate({ id: app.id, appliedDate: dateValue }, {
      onSuccess: () => setEditingDate(false),
    });
  };

  const handleSaveContacts = () => {
    updateContacts({ id: app.id, contactIds: pendingContactIds }, {
      onSuccess: () => setEditingContacts(false),
    });
  };

  function startEditContacts() {
    setPendingContactIds(app.contacts.map(c => c.id));
    setContactSearch('');
    setEditingContacts(true);
  }

  function handleDelete() {
    if (!confirm(`Delete "${app.companyName} — ${app.jobTitle}"? This cannot be undone.`)) return;
    deleteApplication(app.id, { onSuccess: () => setSelectedApplication(null) });
  }

  const linkedResume = savedResumes.find(r => r.applicationId === app.id);

  const contacts = app.contacts ?? [];

  return (
    <>
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity" onClick={() => setSelectedApplication(null)} />
      
      <div className="fixed top-0 right-0 h-full w-full sm:max-w-md bg-card border-l border-border shadow-2xl z-50 transform transition-transform animate-in slide-in-from-right duration-200 ease-out flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-border/30 shrink-0">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2 text-left truncate">
              <Building2 className="w-5 h-5 text-accent shrink-0" />
              {app.companyName}
            </h2>
            <p className="text-foreground/60 text-sm mt-0.5 text-left truncate">{app.jobTitle}</p>
            {app.jobUrl && (
              <a
                href={app.jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-1.5 text-[11px] text-accent hover:underline"
              >
                <LinkIcon className="w-3 h-3" />
                View Job Posting
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>
          
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleDelete}
              disabled={isDeletingApplication}
              title="Delete application"
              className="p-2 hover:bg-red-500/10 rounded-lg text-foreground/30 hover:text-red-400 transition-colors"
            >
              {isDeletingApplication ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setSelectedApplication(null); }} 
              className="p-2 hover:bg-background rounded-lg text-foreground/50 hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Status */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-foreground/50 font-medium">Status</span>
            <select
              value={app.status}
              onChange={handleStatusChange}
              className="bg-background border border-border text-foreground text-sm font-medium rounded-lg focus:ring-accent focus:border-accent block w-36 p-1.5 focus:outline-none"
            >
              <option value="APPLIED">Applied</option>
              <option value="SCREENING">Screening</option>
              <option value="INTERVIEW">Interview</option>
              <option value="OFFER">Offer</option>
              <option value="REJECTED">Rejected</option>
              <option value="WITHDRAWN">Withdrawn</option>
            </select>
          </div>

          <hr className="border-border/30" />

          {/* Recruitment Funnel */}
          <div className="space-y-6">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
               <Tag className="w-4 h-4 text-accent" />
               Recruitment Funnel
            </h3>

            {/* OA Section */}
            <div className="bg-accent/5 rounded-2xl p-4 border border-accent/10 space-y-3 relative">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <ClipboardList className="w-4 h-4 text-accent" />
                    Online Assessment
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/20 text-accent uppercase">
                    {app.oa?.status || 'PENDING'}
                  </span>
               </div>
               {app.oa ? (
                 <div className="text-xs text-foreground/60 space-y-1 pl-6">
                    <p>Platform: <span className="text-foreground">{app.oa.platform}</span></p>
                    <p>Deadline: <span className="text-foreground">{app.oa.deadline ? format(new Date(app.oa.deadline), 'MMM d, p') : 'No deadline'}</span></p>
                    
                    <div className="mt-4 space-y-2">
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-tighter">Experience &amp; Questions</span>
                          {!editingOA && (
                             <button 
                               onClick={() => { setOANotes(app.oa?.notes || ''); setEditingOA(true); }}
                               className="text-accent hover:underline font-bold text-[10px] cursor-pointer"
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
                               onClick={() => updateOA({ applicationId: app.id, data: { ...app.oa, notes: oaNotes } }, { onSuccess: () => setEditingOA(false) })}
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
                           {app.oa.notes || "No details added yet. Click edit to record questions or experience."}
                         </p>
                       )}
                    </div>
                 </div>
               ) : (
                 <button 
                   onClick={() => setShowSetupOA(true)}
                   className="w-full py-2 border border-dashed border-accent/20 rounded-xl text-xs text-accent/60 hover:bg-accent/5 transition-colors cursor-pointer"
                 >
                   + Setup OA Round
                 </button>
               )}
               {showSetupOA && (
                 <SetupOAModal 
                   applicationId={app.id} 
                   onClose={() => setShowSetupOA(false)} 
                 />
               )}
            </div>

            {/* Interview Rounds */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <Mic2 className="w-4 h-4 text-accent" />
                  Interview Rounds
                </div>
                <button 
                  onClick={() => setShowAddInterview(true)}
                  className="p-1 hover:bg-background rounded-md text-accent transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {showAddInterview && (
                <AddInterviewRoundModal 
                  applicationId={app.id} 
                  onClose={() => setShowAddInterview(false)} 
                />
              )}

              <div className="space-y-2">
                {app.interviews?.length > 0 ? (
                  app.interviews.map((round) => (
                    <div key={round.id} className="space-y-2">
                       <div className="bg-background border border-border/50 rounded-xl p-3 flex items-center justify-between group hover:border-accent/30 transition-all">
                         <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-card border border-border/30 flex items-center justify-center text-accent">
                             <Clock className="w-4 h-4" />
                           </div>
                           <div className="text-left">
                             <p className="text-xs font-bold text-foreground capitalize">{round.type.replace('_', ' ')} Round</p>
                             <p className="text-[10px] text-foreground/50">{round.scheduledAt ? format(new Date(round.scheduledAt), 'MMM d, h:mm a') : 'No date set'}</p>
                           </div>
                         </div>
                         <div className="flex items-center gap-1.5">
                            {!editingInterviewId && (
                               <button 
                                 onClick={() => { setEditingInterviewId(round.id); setRoundNotes(round.notes || ''); }}
                                 className="text-[9px] font-bold text-accent opacity-0 group-hover:opacity-100 transition-opacity px-1.5 py-1 hover:bg-accent/10 rounded"
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
                            <button
                              onClick={() => handleDeleteInterview(round.id)}
                              disabled={isDeletingInterview}
                              className="p-1.5 hover:bg-red-500/10 rounded-md text-foreground/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                              title="Remove round"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
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
                                    onClick={() => updateInterview({ applicationId: app.id, interviewId: round.id, data: { ...round, notes: roundNotes } }, { onSuccess: () => setEditingInterviewId(null) })}
                                    className="px-2 py-1 bg-accent text-white rounded text-[10px] font-bold flex items-center gap-1"
                                    disabled={isUpdatingInterview}
                                  >
                                    {isUpdatingInterview && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
                                    Save
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-accent/5 p-3 rounded-lg border border-accent/10 relative group/notes">
                                 <p className="text-[10px] text-foreground/70 whitespace-pre-wrap">{round.notes}</p>
                                 <button 
                                   onClick={() => { setEditingInterviewId(round.id); setRoundNotes(round.notes || ''); }}
                                   className="absolute top-2 right-2 text-accent text-[9px] font-bold opacity-0 group-hover/notes:opacity-100"
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

          {/* Contact & Dates */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
               <UserCircle2 className="w-4 h-4 text-accent" />
               Contacts &amp; Dates
            </h3>

            {/* ── Contacts ── */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-foreground/40 uppercase tracking-wider">Contact Persons</span>
                {!editingContacts && (
                  <button onClick={startEditContacts} className="flex items-center gap-1 text-[10px] text-accent hover:underline font-bold">
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                )}
              </div>

              {!editingContacts ? (
                contacts.length > 0 ? (
                  <div className="space-y-2">
                    {contacts.map(c => (
                      <div key={c.id} className="bg-background/50 rounded-xl p-3 border border-border/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-foreground text-sm">{c.name}</div>
                            {c.role && <div className="text-[10px] text-foreground/50">{c.role}</div>}
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            c.category === 'HR'
                              ? 'bg-blue-400/10 text-blue-400 border-blue-400/20'
                              : c.category === 'POI'
                              ? 'bg-purple-400/10 text-purple-400 border-purple-400/20'
                              : 'bg-foreground/5 text-foreground/40 border-border/30'
                          }`}>
                            {c.category}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                          {c.email && (
                            <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 text-xs text-foreground/60 hover:text-accent transition-colors">
                              <Mail className="w-3.5 h-3.5 shrink-0" />
                              {c.email}
                            </a>
                          )}
                          {c.phone && (
                            <a href={`tel:${c.phone}`} className="flex items-center gap-1.5 text-xs text-foreground/60 hover:text-accent transition-colors">
                              <Phone className="w-3.5 h-3.5 shrink-0" />
                              {c.phone}
                            </a>
                          )}
                          {c.linkedInUrl && (
                            <a href={c.linkedInUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-foreground/60 hover:text-accent transition-colors">
                              <Globe className="w-3.5 h-3.5 shrink-0" />
                              LinkedIn
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <button onClick={startEditContacts} className="w-full py-3 border border-dashed border-border/40 rounded-xl text-xs text-foreground/30 hover:border-accent/30 hover:text-accent/60 transition-colors">
                    + Add contact persons
                  </button>
                )
              ) : (
                /* Editing mode */
                <div className="space-y-3 bg-background/40 rounded-xl p-3 border border-border/40">
                  {/* Linked chips */}
                  {pendingContacts.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {pendingContacts.map(c => (
                        <div key={c.id} className="flex items-center gap-1.5 bg-accent/10 border border-accent/20 rounded-full px-2.5 py-1">
                          <span className="text-xs font-medium text-accent">{c.name}</span>
                          <button type="button" onClick={() => setPendingContactIds(ids => ids.filter(id => id !== c.id))} className="text-accent/50 hover:text-red-400">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/40" />
                    <input
                      type="text"
                      placeholder="Search contacts..."
                      value={contactSearch}
                      onChange={e => setContactSearch(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg pl-8 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-accent/50"
                    />
                    {searchResults.length > 0 && (
                      <div className="absolute top-full mt-1 w-full bg-card border border-border rounded-xl shadow-lg z-10 p-1 space-y-0.5 max-h-40 overflow-y-auto">
                        {searchResults.map(c => (
                          <button key={c.id} type="button"
                            onClick={() => { setPendingContactIds(ids => [...ids, c.id]); setContactSearch(''); }}
                            className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-background text-xs text-foreground/70 hover:text-foreground transition-colors"
                          >
                            <span className="font-medium">{c.name}</span>
                            {c.companyName && <span className="text-foreground/40"> · {c.companyName}</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button type="button" onClick={() => setEditingContacts(false)} className="px-2 py-1 text-[10px] font-bold text-foreground/50 hover:text-foreground">Cancel</button>
                    <button type="button" onClick={handleSaveContacts} disabled={isSavingContacts}
                      className="px-3 py-1 bg-accent text-white rounded text-[10px] font-bold flex items-center gap-1 disabled:opacity-60"
                    >
                      {isSavingContacts && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Applied Date ── */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-foreground/40 uppercase tracking-wider">Applied Date</span>
                {!editingDate && (
                  <button onClick={() => { setDateValue(app.appliedDate); setEditingDate(true); }} className="flex items-center gap-1 text-[10px] text-accent hover:underline font-bold">
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                )}
              </div>

              {editingDate ? (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={dateValue}
                    onChange={e => setDateValue(e.target.value)}
                    className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent/50"
                  />
                  <button onClick={() => setEditingDate(false)} className="text-[10px] font-bold text-foreground/50 hover:text-foreground px-2">Cancel</button>
                  <button onClick={handleSaveDate} disabled={isSavingDate}
                    className="px-3 py-1.5 bg-accent text-white rounded-lg text-[10px] font-bold flex items-center gap-1 disabled:opacity-60"
                  >
                    {isSavingDate && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-sm bg-background/30 rounded-xl p-3 border border-border/20">
                  <Calendar className="w-4 h-4 text-foreground/40 shrink-0" />
                  <div>
                    <div className="text-foreground text-xs font-medium">{format(parseLocalDate(app.appliedDate), 'MMM d, yyyy')}</div>
                    <div className="text-foreground/40 text-[10px]">{formatDistanceToNow(parseLocalDate(app.appliedDate), { addSuffix: true })}</div>
                  </div>
                </div>
              )}
            </div>

            {app.followUpDate && (
              <div className="flex items-center gap-3 text-sm bg-accent/5 rounded-xl p-3 border border-accent/10">
                <Bell className="w-4 h-4 text-accent shrink-0" />
                <div>
                  <div className="text-accent/60 text-[10px] font-bold uppercase">Follow Up</div>
                  <div className="text-foreground text-xs font-medium">{format(parseLocalDate(app.followUpDate), 'MMM d, yyyy')}</div>
                </div>
              </div>
            )}
          </div>

          <hr className="border-border/30" />

          {/* Linked Resume */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-accent" />
              Linked Resume
            </h3>

            {linkedResume ? (
              <div className="bg-background/50 rounded-xl p-3 border border-border/50 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{linkedResume.companyName} — {linkedResume.jobTitle}</p>
                  <p className="text-[10px] text-foreground/40 mt-0.5">
                    Updated {new Date(linkedResume.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => updateResume(linkedResume.id, { applicationId: undefined })}
                  className="shrink-0 text-[10px] font-bold text-red-400/70 hover:text-red-400 px-2 py-1 hover:bg-red-500/10 rounded transition-colors"
                >
                  Unlink
                </button>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowResumeDropdown(v => !v)}
                  className="w-full flex items-center justify-between px-3 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground/50 hover:border-accent/40 hover:text-foreground transition-colors"
                >
                  <span className="flex items-center gap-2"><LinkIcon className="w-3.5 h-3.5" /> Link an existing resume</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showResumeDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showResumeDropdown && (
                  <div className="absolute top-full mt-1 w-full bg-card border border-border rounded-xl shadow-xl z-10 p-1 max-h-48 overflow-y-auto">
                    {savedResumes.length === 0 ? (
                      <p className="text-xs text-foreground/30 text-center py-3">No saved resumes yet.</p>
                    ) : (
                      savedResumes.map(r => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => { updateResume(r.id, { applicationId: app.id }); setShowResumeDropdown(false); }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-background text-xs text-foreground/70 hover:text-foreground transition-colors"
                        >
                          <span className="font-medium">{r.companyName}</span>
                          <span className="text-foreground/40"> — {r.jobTitle}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <hr className="border-border/30" />

          {/* Notes */}
          <div className="space-y-4 text-left">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Notes
            </h3>
            
            {/* Existing Notes List */}
            {isLoadingNotes ? (
              <div className="space-y-2">
                {[1, 2].map(i => <div key={i} className="h-12 bg-card/40 animate-pulse rounded-xl" />)}
              </div>
            ) : notes.length > 0 ? (
              <div className="space-y-2">
                {notes.map((note: Note) => (
                  <div key={note.id} className="bg-background/50 rounded-xl p-3 border border-border/30">
                    <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">{note.content}</p>
                    <p className="text-[10px] text-foreground/30 mt-2">
                      {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-foreground/30 italic text-center py-2">No notes yet.</p>
            )}

            {/* Add Note Form */}
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
