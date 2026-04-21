"use client";

import { useAuth } from '@/context/AuthContext';
import { useAllInterviews } from '@/hooks/useApplications';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Building2, ExternalLink, MapPin, Search, Filter, CheckCircle2 } from 'lucide-react';
import { format, isToday, isFuture, parseISO } from 'date-fns';
import { useApplicationStore } from '@/store/useApplicationStore';

export default function InterviewsHub() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const { data: interviews = [], isLoading } = useAllInterviews();
  const { setSelectedApplication } = useApplicationStore();

  const handleViewContext = (item: any) => {
    // Pass minimal application data so the drawer has an ID to fetch with
    // and basic info to show while the full refresh happens.
    setSelectedApplication({
      id: item.applicationId,
      companyName: item.companyName || 'Loading...',
      jobTitle: item.jobTitle || '',
      status: 'INTERVIEW', // Placeholder status
      appliedDate: new Date().toISOString(), // Fallback date if not fetched
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

  // Split into upcoming and past - with null safety for scheduledAt
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
    <div className="flex-1 flex flex-col h-full bg-background">
      <header className="h-[72px] border-b border-border/30 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
           <CalendarIcon className="w-6 h-6 text-accent" />
           <h1 className="text-xl font-bold text-foreground">Interview Hub</h1>
        </div>
        
        <div className="flex items-center gap-4">
           {/* Placeholder for future filtering */}
           <div className="flex bg-card border border-border rounded-lg p-1">
              <button className="px-3 py-1.5 text-xs font-bold rounded-md bg-accent text-white transition-all">Upcoming</button>
              <button className="px-3 py-1.5 text-xs font-bold rounded-md text-foreground/40 hover:text-foreground transition-all">Timeline</button>
           </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-10">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
               <div key={i} className="h-24 bg-card/40 animate-pulse rounded-2xl border border-border/20" />
            ))}
          </div>
        ) : (
          <>
            {/* Upcoming Section */}
            <section className="space-y-4">
              <h2 className="text-sm font-bold text-foreground/40 uppercase tracking-widest px-1">Upcoming Rounds</h2>
              
              {upcomingInterviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingInterviews.map((item) => (
                    <div 
                      key={item.id} 
                      className="bg-card border border-border/50 rounded-2xl p-5 hover:border-accent/40 hover:shadow-xl hover:shadow-accent/5 transition-all group relative overflow-hidden flex flex-col"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-accent/10 rounded-xl text-accent">
                           <Clock className="w-6 h-6" />
                        </div>
                        <div className="text-right">
                           <p className="text-xs font-bold text-accent uppercase">{format(new Date(item.scheduledAt), 'eee, MMM d')}</p>
                           <p className="text-lg font-bold text-foreground">{format(new Date(item.scheduledAt), 'h:mm a')}</p>
                        </div>
                      </div>

                      <div className="space-y-1 mb-6 text-left">
                         <h3 className="text-lg font-bold text-foreground group-hover:text-accent transition-colors truncate">
                           {item.type.replace('_', ' ')} Round
                         </h3>
                         <div className="flex items-center gap-2 text-sm text-foreground/50">
                            <Building2 className="w-3.5 h-3.5" />
                            {item.companyName}
                         </div>
                         <p className="text-xs text-foreground/40 truncate italic">{item.jobTitle}</p>
                      </div>

                      <div className="mt-auto flex items-center justify-between pt-4 border-t border-border/30">
                         <button 
                           onClick={() => handleViewContext(item)}
                           className="text-xs font-bold text-foreground/60 hover:text-foreground flex items-center gap-1.5 transition-colors"
                         >
                           View Context
                         </button>
                         {item.meetingLink && (
                           <a 
                             href={item.meetingLink} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="bg-accent text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-accent/90 shadow-lg shadow-accent/20 transition-all"
                           >
                              Join Call
                              <ExternalLink className="w-3 h-3" />
                           </a>
                         )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-48 rounded-2xl border border-dashed border-border/30 flex flex-col items-center justify-center bg-card/20 opacity-40">
                   <CalendarIcon className="w-8 h-8 mb-2" />
                   <p className="text-sm font-medium">No upcoming interviews scheduled.</p>
                </div>
              )}
            </section>

            {/* Past/Recently Completed Section */}
            {pastInterviews.length > 0 && (
               <section className="space-y-4">
                  <h2 className="text-sm font-bold text-foreground/40 uppercase tracking-widest px-1">Recently Completed</h2>
                  <div className="space-y-2">
                    {pastInterviews.slice(0, 5).map((item) => (
                      <div key={item.id} className="bg-card/40 border border-border/30 rounded-xl p-4 flex items-center justify-between opacity-70 hover:opacity-100 transition-opacity">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center text-foreground/30">
                               <CheckCircle2 className="w-5 h-5 text-green-500/50" />
                            </div>
                            <div className="text-left">
                               <p className="text-sm font-bold text-foreground">{item.type.replace('_', ' ')} Round @ {item.companyName}</p>
                               <p className="text-xs text-foreground/40">{format(new Date(item.scheduledAt), 'MMMM d, yyyy')}</p>
                            </div>
                         </div>
                         <button 
                           onClick={() => handleViewContext(item)}
                           className="p-2 hover:bg-background rounded-lg text-foreground/40 hover:text-foreground transition-colors"
                         >
                            <ExternalLink className="w-4 h-4" />
                         </button>
                      </div>
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
