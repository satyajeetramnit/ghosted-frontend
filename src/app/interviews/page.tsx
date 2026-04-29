"use client";

import { useAuth } from '@/context/AuthContext';
import { useAllInterviews } from '@/hooks/useApplications';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Building2, ExternalLink, Search, CheckCircle2, Mic2, ArrowUpRight, Plus, MapPin, Sparkles, Filter, LayoutGrid, List } from 'lucide-react';
import { format, isToday, isFuture } from 'date-fns';
import { useApplicationStore } from '@/store/useApplicationStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function InterviewsHub() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const { data: interviews = [], isLoading } = useAllInterviews();
  const { setSelectedApplication } = useApplicationStore();

  const handleViewContext = (item: any) => {
    setSelectedApplication({
      id: item.applicationId,
      companyName: item.companyName || 'Loading...',
      jobTitle: item.jobTitle || '',
      status: 'INTERVIEW', 
      appliedDate: new Date().toISOString(), 
      interviews: []
    } as any);
    router.push('/');
  };

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  if (isAuthLoading || !user) return null;

  const upcomingInterviews = interviews.filter(i => {
    if (!i.scheduledAt) return false;
    const date = new Date(i.scheduledAt);
    return isFuture(date) || isToday(date);
  });

  const pastInterviews = interviews.filter(i => {
    if (!i.scheduledAt) return true;
    const date = new Date(i.scheduledAt);
    return !isFuture(date) && !isToday(date);
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent relative">
      {/* Header Section */}
      <header className="pt-10 pb-8 px-10 flex flex-col gap-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
             <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] mb-2">
               <Mic2 className="w-3.5 h-3.5" />
               <span>Tactical Briefing</span>
             </div>
             <h1 className="text-4xl font-bold tracking-tight text-foreground font-outfit">Interview Hub</h1>
             <p className="text-muted-foreground font-medium max-w-lg leading-relaxed">
               Chronological intelligence on upcoming and historical recruitment engagements.
             </p>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="flex bg-surface border border-border-muted rounded-full p-1 shadow-sm">
                <button className="px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-full bg-foreground text-background shadow-lg transition-all">Upcoming</button>
                <button className="px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-full text-muted-foreground/40 hover:text-foreground transition-all">Timeline</button>
             </div>
             <button className="p-3.5 bg-surface border border-border-muted rounded-2xl text-muted-foreground/40 hover:text-foreground transition-all shadow-sm">
               <Filter className="w-4 h-4" />
             </button>
          </div>
        </div>
      </header>

      <main className="flex-1 px-10 pb-20 relative z-10 space-y-16">
        {isLoading ? (
          <div className="space-y-8">
            <div className="h-4 bg-border-muted/50 w-32 rounded-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
               {[1, 2, 3].map(i => <div key={i} className="h-64 bg-surface/30 animate-pulse rounded-[2.5rem] border border-border-muted/50" />)}
            </div>
          </div>
        ) : (
          <>
            {/* Upcoming Section */}
            <section className="space-y-8">
              <div className="flex items-center gap-4">
                <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground/40">Upcoming Engagements</h2>
                <div className="h-px flex-1 bg-border-muted" />
              </div>
              
              {upcomingInterviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {upcomingInterviews.map((item, idx) => (
                    <motion.div 
                      key={item.id} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="group relative bg-surface/40 hover:bg-surface p-8 rounded-[2.5rem] border border-border-muted hover:border-border transition-all duration-500 flex flex-col shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] overflow-hidden"
                    >
                      {/* Date Pill */}
                      <div className="flex items-start justify-between mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-background border border-border-muted flex items-center justify-center text-foreground group-hover:scale-110 transition-all duration-500 shadow-sm">
                           <Clock className="w-6 h-6" />
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-black text-foreground uppercase tracking-widest mb-1">{format(new Date(item.scheduledAt), 'eee, MMM d')}</p>
                           <p className="text-2xl font-bold text-foreground font-outfit">{format(new Date(item.scheduledAt), 'h:mm a')}</p>
                        </div>
                      </div>

                      <div className="space-y-3 mb-10">
                         <h3 className="text-xl font-bold text-foreground font-outfit tracking-tight leading-tight group-hover:text-foreground transition-colors">
                           {item.type.replace('_', ' ')} Interview
                         </h3>
                         <div className="space-y-1">
                           <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                              <Building2 className="w-3.5 h-3.5" />
                              <span>{item.companyName}</span>
                           </div>
                           <p className="text-xs text-muted-foreground/40 font-medium italic truncate">{item.jobTitle}</p>
                         </div>
                      </div>

                      <div className="mt-auto flex items-center justify-between pt-6 border-t border-border-muted">
                         <button 
                           onClick={() => handleViewContext(item)}
                           className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 hover:text-foreground flex items-center gap-2 transition-all group/ctx"
                         >
                           <span>Briefing Context</span>
                           <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                         </button>
                         {item.meetingLink && (
                           <a 
                             href={item.meetingLink} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="bg-foreground text-background px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all"
                           >
                              <span>Join Session</span>
                              <ExternalLink className="w-3 h-3" />
                           </a>
                         )}
                      </div>
                      
                      {/* Decorative Element */}
                      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-20 rounded-[2.5rem] border border-dashed border-border-muted flex flex-col items-center justify-center bg-surface/20 text-center space-y-4">
                   <div className="w-16 h-16 rounded-[1.5rem] bg-surface flex items-center justify-center text-muted-foreground/10">
                     <CalendarIcon className="w-8 h-8" />
                   </div>
                   <p className="text-[11px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">Silence. No upcoming engagements.</p>
                </div>
              )}
            </section>

            {/* Past/Recently Completed Section */}
            {pastInterviews.length > 0 && (
               <section className="space-y-8">
                  <div className="flex items-center gap-4">
                    <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground/40">Mission Archive</h2>
                    <div className="h-px flex-1 bg-border-muted" />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {pastInterviews.slice(0, 5).map((item, idx) => (
                      <motion.div 
                        key={item.id} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-surface/30 border border-border-muted/50 rounded-[1.5rem] p-5 flex items-center justify-between group hover:bg-surface hover:border-border transition-all"
                      >
                         <div className="flex items-center gap-6">
                            <div className="w-12 h-12 rounded-xl bg-background border border-border-muted flex items-center justify-center">
                               <CheckCircle2 className="w-5 h-5 text-muted-foreground/20 group-hover:text-foreground/40 transition-colors" />
                            </div>
                            <div className="space-y-1">
                               <p className="text-sm font-bold text-foreground font-outfit">{item.type.replace('_', ' ')} Engagement @ {item.companyName}</p>
                               <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                                  <div className="flex items-center gap-1">
                                    <CalendarIcon className="w-3 h-3" />
                                    <span>{format(new Date(item.scheduledAt), 'MMMM d, yyyy')}</span>
                                  </div>
                                  <div className="w-1 h-1 rounded-full bg-border-muted" />
                                  <span className="italic">{item.jobTitle}</span>
                               </div>
                            </div>
                         </div>
                         <button 
                           onClick={() => handleViewContext(item)}
                           className="p-3 bg-background border border-border-muted rounded-xl text-muted-foreground/20 hover:text-foreground transition-all group-hover:border-border"
                         >
                            <ExternalLink className="w-4 h-4" />
                         </button>
                      </motion.div>
                    ))}
                  </div>
               </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
