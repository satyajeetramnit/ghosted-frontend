"use client";

import { ApplicationStatus, Note } from '../types';
import { useApplicationStore } from '../store/useApplicationStore';
import { useResumeStore } from '../store/useResumeStore';
import { useUpdateApplicationStatus, useAddNote, useUpdateOA, useUpdateInterview, useDeleteInterview, useApplicationById, useNotes, useUpdateAppliedDate, useUpdateContacts, useDeleteApplication } from '../hooks/useApplications';
import { useContacts } from '../hooks/useContacts';
import { X, Building2, UserCircle2, Calendar, FileText, Loader2, Mail, Tag, ClipboardList, Mic2, Plus, Clock, ExternalLink, Phone, Trash2, Link as LinkIcon, Bell, Globe, Pencil, Search, BookOpen, ChevronDown, CheckCircle2, AlertCircle } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { parseLocalDate } from '../services/api';
import { useState, useEffect, useMemo } from 'react';
import SetupOAModal from './SetupOAModal';
import AddInterviewRoundModal from './AddInterviewRoundModal';
import { motion, AnimatePresence } from 'framer-motion';

export default function ApplicationDrawer() {
  const { selectedApplication: storeApp, setSelectedApplication } = useApplicationStore();
  const selectedId = storeApp?.id;

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

  const [editingOA, setEditingOA] = useState(false);
  const [oaNotes, setOANotes] = useState('');
  const [editingInterviewId, setEditingInterviewId] = useState<string | null>(null);
  const [roundNotes, setRoundNotes] = useState('');

  const [editingDate, setEditingDate] = useState(false);
  const [dateValue, setDateValue] = useState('');

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

  if (isRefetching && !selectedApplication) {
    return (
      <div className="fixed inset-0 z-50 flex justify-end">
        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm" onClick={() => setSelectedApplication(null)} />
        <div className="relative h-full w-full sm:max-w-lg bg-background border-l border-border shadow-2xl flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground/90" />
        </div>
      </div>
    );
  }

  const app = selectedApplication || storeApp;

  const handleStatusChange = (newStatus: ApplicationStatus) => {
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
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/90 backdrop-blur-[8px]" 
          onClick={() => setSelectedApplication(null)} 
        />
        
        {/* Panel */}
        <motion.div 
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative h-full w-full sm:max-w-xl bg-background border-l border-border shadow-[0_0_80px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden"
        >
          {/* Subtle Grain Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.05] mix-blend-overlay z-0" 
               style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3%3Cfilter id='noiseFilter'%3%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3%3C/filter%3%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3%3C/svg%3")` }} 
          />

          {/* Header */}
          <div className="relative z-10 px-8 pt-10 pb-8 flex flex-col gap-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1 max-w-[80%]">
                <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground/90 uppercase tracking-[0.15em] mb-1">
                  <Building2 className="w-3 h-3" />
                  <span>{app.companyName}</span>
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground font-outfit leading-tight">
                  {app.jobTitle}
                </h2>
                {app.jobUrl && (
                  <a href={app.jobUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground hover:underline underline-offset-4 decoration-foreground/20 group">
                    <LinkIcon className="w-3 h-3" />
                    <span>View Posting</span>
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDelete}
                  disabled={isDeletingApplication}
                  className="p-2.5 rounded-xl hover:bg-red-500/10 text-muted-foreground/80 hover:text-red-500 transition-all border border-transparent hover:border-red-500/20"
                >
                  {isDeletingApplication ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => setSelectedApplication(null)} 
                  className="p-2.5 rounded-xl bg-surface border border-border-muted text-muted-foreground hover:text-foreground hover:bg-surface transition-all active:scale-95"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Status Pills */}
            <div className="flex flex-wrap gap-2">
              {(['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED'] as ApplicationStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${
                    app.status === status 
                      ? "bg-foreground text-background border-foreground shadow-lg shadow-foreground/5" 
                      : "bg-surface text-muted-foreground/90 border-border-muted hover:border-border hover:text-foreground"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-8 pb-12 space-y-12 relative z-10 custom-scrollbar">
            
            {/* Recruitment Pipeline */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[13px] font-black uppercase tracking-[0.2em] text-foreground/80 font-inter">Recruitment Pipeline</h3>
                <div className="h-px flex-1 bg-border-muted mx-4" />
              </div>

              {/* OA Section */}
              <div className="group relative bg-surface/50 border border-border-muted rounded-[2rem] p-6 transition-all hover:border-border hover:bg-surface">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-background border border-border-muted flex items-center justify-center text-foreground group-hover:bg-foreground group-hover:text-background transition-all">
                      <ClipboardList className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Online Assessment</h4>
                      <p className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest">{app.oa?.status || 'PENDING'}</p>
                    </div>
                  </div>
                  {app.oa && !editingOA && (
                    <button 
                      onClick={() => { setOANotes(app.oa?.notes || ''); setEditingOA(true); }}
                      className="text-[10px] font-black text-foreground/80 hover:text-foreground transition-colors uppercase tracking-widest px-3 py-1 bg-background border border-border-muted rounded-full"
                    >
                      Edit Notes
                    </button>
                  )}
                </div>

                {app.oa ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-background/50 border border-border-muted rounded-2xl p-3">
                        <p className="text-[9px] font-bold text-muted-foreground/80 uppercase tracking-widest mb-1">Platform</p>
                        <p className="text-xs font-bold text-foreground">{app.oa.platform}</p>
                      </div>
                      <div className="bg-background/50 border border-border-muted rounded-2xl p-3">
                        <p className="text-[9px] font-bold text-muted-foreground/80 uppercase tracking-widest mb-1">Deadline</p>
                        <p className="text-xs font-bold text-foreground">{app.oa.deadline ? format(new Date(app.oa.deadline), 'MMM d, p') : 'No deadline'}</p>
                      </div>
                    </div>

                    {editingOA ? (
                      <div className="space-y-3">
                        <textarea
                          value={oaNotes}
                          onChange={(e) => setOANotes(e.target.value)}
                          placeholder="Log questions, performance, and insights..."
                          className="w-full bg-background border border-border rounded-2xl p-4 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/10 min-h-[120px] font-medium placeholder:text-muted-foreground/90"
                        />
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setEditingOA(false)} className="px-4 py-2 text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors">Discard</button>
                          <button 
                            onClick={() => updateOA({ applicationId: app.id, data: { ...app.oa, notes: oaNotes } }, { onSuccess: () => setEditingOA(false) })}
                            className="px-5 py-2 bg-foreground text-background rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
                            disabled={isUpdatingOA}
                          >
                            {isUpdatingOA && <Loader2 className="w-3 h-3 animate-spin" />}
                            Save Analysis
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-background/30 rounded-2xl border border-border-muted/30">
                        <p className="text-xs text-muted-foreground/80 leading-relaxed italic">
                          {app.oa.notes || "No synthesis provided yet. Record your experience to improve future performance."}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <button 
                    onClick={() => setShowSetupOA(true)}
                    className="w-full py-6 border border-dashed border-border-muted rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 hover:border-foreground/20 hover:text-foreground/80 hover:bg-surface/80 transition-all group/btn"
                  >
                    <Plus className="w-4 h-4 mx-auto mb-2 opacity-20 group-hover/btn:opacity-100 transition-opacity" />
                    Configure OA Round
                  </button>
                )}
              </div>

              {/* Interview Rounds */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-foreground/60 uppercase tracking-widest">
                    <Mic2 className="w-3.5 h-3.5" />
                    Interview Rounds
                  </div>
                  <button 
                    onClick={() => setShowAddInterview(true)}
                    className="p-1.5 bg-foreground text-background rounded-lg hover:scale-110 active:scale-90 transition-all shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {app.interviews?.length > 0 ? (
                    app.interviews.map((round) => (
                      <div key={round.id} className="group/round space-y-3">
                         <div className="bg-surface/50 border border-border-muted rounded-[1.5rem] p-5 flex items-center justify-between transition-all hover:border-border hover:bg-surface">
                           <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-2xl bg-background border border-border-muted flex items-center justify-center text-foreground group-hover/round:border-foreground/20 transition-all shadow-sm">
                               <Calendar className="w-5 h-5" />
                             </div>
                             <div>
                               <p className="text-sm font-bold text-foreground capitalize tracking-tight">{round.type.replace('_', ' ')} Interview</p>
                               <div className="flex items-center gap-2 mt-0.5">
                                 <Clock className="w-3 h-3 text-muted-foreground/80" />
                                 <p className="text-[10px] font-bold text-muted-foreground/90 uppercase tracking-wider">{round.scheduledAt ? format(new Date(round.scheduledAt), 'MMM d, h:mm a') : 'Unscheduled'}</p>
                               </div>
                             </div>
                           </div>
                           
                           <div className="flex items-center gap-1.5">
                              {!editingInterviewId && (
                                 <button 
                                   onClick={() => { setEditingInterviewId(round.id); setRoundNotes(round.notes || ''); }}
                                   className="text-[9px] font-black uppercase tracking-widest text-foreground/70 hover:text-foreground transition-all px-3 py-1.5 bg-background border border-border-muted rounded-full opacity-0 group-hover/round:opacity-100"
                                 >
                                   Insight
                                 </button>
                              )}
                              
                              {round.meetingLink && (
                                <a href={round.meetingLink} target="_blank" rel="noopener noreferrer" className="p-2 bg-background border border-border-muted rounded-xl text-foreground/80 hover:text-foreground hover:border-border transition-all">
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                              
                              <button
                                onClick={() => handleDeleteInterview(round.id)}
                                disabled={isDeletingInterview}
                                className="p-2 text-muted-foreground/90 hover:text-red-500 transition-all opacity-0 group-hover/round:opacity-100"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                           </div>
                         </div>
                         
                         <AnimatePresence>
                           {(editingInterviewId === round.id || round.notes) && (
                             <motion.div 
                               initial={{ opacity: 0, height: 0 }}
                               animate={{ opacity: 1, height: 'auto' }}
                               className="px-5 pb-2"
                             >
                                {editingInterviewId === round.id ? (
                                  <div className="space-y-3 pt-2">
                                    <textarea
                                      value={roundNotes}
                                      onChange={(e) => setRoundNotes(e.target.value)}
                                      placeholder="Synthesize the conversation. Questions, vibes, and red flags..."
                                      className="w-full bg-surface border border-border rounded-2xl p-4 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/10 min-h-[100px] font-medium"
                                    />
                                    <div className="flex justify-end gap-2">
                                      <button onClick={() => setEditingInterviewId(null)} className="px-3 py-1 text-[10px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-widest">Cancel</button>
                                      <button 
                                        onClick={() => updateInterview({ applicationId: app.id, interviewId: round.id, data: { ...round, notes: roundNotes } }, { onSuccess: () => setEditingInterviewId(null) })}
                                        className="px-4 py-1.5 bg-foreground text-background rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-2"
                                        disabled={isUpdatingInterview}
                                      >
                                        Save Insight
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="bg-surface border border-border-muted p-4 rounded-2xl relative group/note transition-all hover:border-border/30">
                                     <p className="text-xs text-muted-foreground/80 leading-relaxed font-medium whitespace-pre-wrap">{round.notes}</p>
                                     <button 
                                       onClick={() => { setEditingInterviewId(round.id); setRoundNotes(round.notes || ''); }}
                                       className="absolute top-3 right-3 text-foreground/60 hover:text-foreground text-[9px] font-black uppercase tracking-widest opacity-0 group-hover/note:opacity-100 transition-all"
                                     >
                                       Edit
                                     </button>
                                  </div>
                                )}
                             </motion.div>
                           )}
                         </AnimatePresence>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 border border-dashed border-border-muted rounded-[1.5rem] flex flex-col items-center justify-center">
                       <p className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-[0.2em]">Silence. No rounds yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Context & Metadata */}
            <section className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-[13px] font-black uppercase tracking-[0.2em] text-foreground/80 font-inter">Workspace Metadata</h3>
                <div className="h-px flex-1 bg-border-muted mx-4" />
              </div>

              {/* Dates & Followups */}
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-surface/50 border border-border-muted rounded-[1.5rem] p-5 group hover:bg-surface hover:border-border transition-all">
                    <div className="flex items-center justify-between mb-3">
                       <div className="p-2 bg-background border border-border-muted rounded-xl text-muted-foreground group-hover:text-foreground transition-all">
                          <Calendar className="w-4 h-4" />
                       </div>
                       <button onClick={() => { setDateValue(app.appliedDate); setEditingDate(true); }} className="text-[9px] font-black text-muted-foreground/70 hover:text-foreground transition-all uppercase tracking-widest">Update</button>
                    </div>
                    <p className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest mb-1">Applied On</p>
                    {editingDate ? (
                      <div className="space-y-2 mt-2">
                        <input type="date" value={dateValue} onChange={e => setDateValue(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs focus:outline-none" />
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setEditingDate(false)} className="text-[9px] font-bold text-muted-foreground">X</button>
                          <button onClick={handleSaveDate} className="text-[9px] font-bold text-foreground">Save</button>
                        </div>
                      </div>
                    ) : (
                      <h4 className="text-sm font-bold text-foreground">{format(parseLocalDate(app.appliedDate), 'MMM d, yyyy')}</h4>
                    )}
                 </div>

                 <div className="bg-surface/50 border border-border-muted rounded-[1.5rem] p-5 group hover:bg-surface hover:border-border transition-all">
                    <div className="flex items-center justify-between mb-3">
                       <div className="p-2 bg-background border border-border-muted rounded-xl text-muted-foreground group-hover:text-foreground transition-all">
                          <Bell className="w-4 h-4" />
                       </div>
                       <span className="text-[9px] font-black text-muted-foreground/90 uppercase tracking-widest">Alert</span>
                    </div>
                    <p className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest mb-1">Follow Up</p>
                    <h4 className="text-sm font-bold text-foreground">{app.followUpDate ? format(parseLocalDate(app.followUpDate), 'MMM d, yyyy') : 'No Alert'}</h4>
                 </div>
              </div>

              {/* Contacts */}
              <div className="bg-surface/50 border border-border-muted rounded-[2rem] p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCircle2 className="w-4 h-4 text-foreground/80" />
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-widest">Key Contacts</h4>
                  </div>
                  <button onClick={startEditContacts} className="p-1.5 bg-background border border-border-muted rounded-lg text-muted-foreground/80 hover:text-foreground transition-all">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>

                {!editingContacts ? (
                  <div className="space-y-3">
                    {contacts.length > 0 ? contacts.map(c => (
                      <div key={c.id} className="bg-background/90 border border-border-muted rounded-2xl p-4 flex items-center justify-between group/contact hover:border-foreground/10 transition-all">
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-foreground">{c.name}</p>
                          <p className="text-[10px] font-medium text-muted-foreground/90">{c.role || 'Stakeholder'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {c.email && (
                            <a href={`mailto:${c.email}`} className="p-2 bg-surface border border-border-muted rounded-xl text-muted-foreground hover:text-foreground hover:bg-background transition-all">
                              <Mail className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {c.linkedInUrl && (
                            <a href={c.linkedInUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-surface border border-border-muted rounded-xl text-muted-foreground hover:text-foreground hover:bg-background transition-all">
                              <Globe className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    )) : (
                      <p className="text-xs text-muted-foreground/70 italic py-2">No contacts mapped to this workspace.</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4 bg-background/50 rounded-2xl p-4 border border-border-muted">
                    {pendingContacts.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {pendingContacts.map(c => (
                          <div key={c.id} className="flex items-center gap-2 bg-foreground text-background rounded-full px-3 py-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider">{c.name}</span>
                            <button onClick={() => setPendingContactIds(ids => ids.filter(id => id !== c.id))} className="hover:text-red-400 transition-colors">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
                      <input type="text" placeholder="Search talent..." value={contactSearch} onChange={e => setContactSearch(e.target.value)}
                        className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none" />
                      {searchResults.length > 0 && (
                        <div className="absolute top-full mt-2 w-full bg-background border border-border rounded-2xl shadow-xl z-20 p-1 space-y-1 overflow-hidden">
                          {searchResults.map(c => (
                            <button key={c.id} onClick={() => { setPendingContactIds(ids => [...ids, c.id]); setContactSearch(''); }}
                              className="w-full text-left px-4 py-2 rounded-xl hover:bg-surface text-xs text-foreground/60 hover:text-foreground transition-all">
                              <span className="font-bold">{c.name}</span>
                              <span className="text-[10px] text-muted-foreground/80 font-medium uppercase tracking-widest ml-2">{c.companyName}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <button onClick={() => setEditingContacts(false)} className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Discard</button>
                      <button onClick={handleSaveContacts} className="px-4 py-2 bg-foreground text-background rounded-full text-[10px] font-black uppercase tracking-wider">Add Contacts</button>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Intelligence Journal (Notes) */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[13px] font-black uppercase tracking-[0.2em] text-foreground/80 font-inter">Intelligence Journal</h3>
                <div className="h-px flex-1 bg-border-muted mx-4" />
              </div>

              <div className="space-y-4">
                {isLoadingNotes ? (
                  <div className="space-y-3">
                    {[1, 2].map(i => <div key={i} className="h-20 bg-surface/50 animate-pulse rounded-2xl border border-border-muted" />)}
                  </div>
                ) : notes.length > 0 ? (
                  <div className="space-y-3">
                    {notes.map((note: Note) => (
                      <div key={note.id} className="bg-surface/50 border border-border-muted rounded-2xl p-5 hover:border-foreground/10 transition-all group/note">
                        <p className="text-sm font-medium text-foreground/80 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                        <div className="flex items-center gap-2 mt-4 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest">
                          <Clock className="w-3 h-3" />
                          <span>{formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center border border-dashed border-border-muted rounded-[1.5rem]">
                    <p className="text-[10px] font-bold text-muted-foreground/90 uppercase tracking-[0.2em]">Journal is empty. Log your progress.</p>
                  </div>
                )}

                <form onSubmit={handleAddNote} className="relative mt-6 group">
                  <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Log a new update or strategic observation..."
                    className="w-full bg-surface border border-border rounded-[2rem] p-6 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/10 transition-all min-h-[140px] resize-none font-medium placeholder:text-muted-foreground/90"
                  />
                  <div className="absolute bottom-4 right-4">
                    <button
                      type="submit"
                      disabled={isAddingNote || !noteContent.trim()}
                      className="bg-foreground text-background px-6 py-3 rounded-full text-[11px] font-black uppercase tracking-wider hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all shadow-xl flex items-center gap-2"
                    >
                      {isAddingNote && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>Commit Entry</span>
                    </button>
                  </div>
                </form>
              </div>
            </section>

            {/* Linked Intelligence */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[13px] font-black uppercase tracking-[0.2em] text-foreground/80 font-inter">Linked Intelligence</h3>
                <div className="h-px flex-1 bg-border-muted mx-4" />
              </div>

              {linkedResume ? (
                <div className="bg-surface/50 border border-border rounded-[1.5rem] p-5 flex items-center justify-between group/res hover:border-foreground/10 transition-all">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-background border border-border-muted flex items-center justify-center text-muted-foreground group-hover/res:text-foreground transition-all">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{linkedResume.jobTitle}</p>
                      <p className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest mt-0.5">Resume Builder Artifact</p>
                    </div>
                  </div>
                  <button
                    onClick={() => updateResume(linkedResume.id, { applicationId: undefined })}
                    className="p-2 text-muted-foreground/90 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setShowResumeDropdown(v => !v)}
                    className="w-full flex items-center justify-between px-6 py-4 bg-surface border border-border-muted rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 hover:text-foreground hover:border-border transition-all"
                  >
                    <span className="flex items-center gap-3"><LinkIcon className="w-3.5 h-3.5" /> Bind Resume Artifact</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showResumeDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {showResumeDropdown && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute bottom-full mb-3 w-full bg-background border border-border rounded-[1.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.2)] z-30 p-2 max-h-48 overflow-y-auto"
                      >
                        {savedResumes.length === 0 ? (
                          <p className="text-[10px] font-bold text-muted-foreground/90 uppercase tracking-widest text-center py-6">No artifacts found.</p>
                        ) : (
                          savedResumes.map(r => (
                            <button
                              key={r.id}
                              onClick={() => { updateResume(r.id, { applicationId: app.id }); setShowResumeDropdown(false); }}
                              className="w-full text-left px-5 py-3 rounded-xl hover:bg-surface text-xs font-bold text-foreground/60 hover:text-foreground transition-all"
                            >
                              {r.companyName} — {r.jobTitle}
                            </button>
                          ))
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </section>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
