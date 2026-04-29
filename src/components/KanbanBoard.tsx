"use client";

import { useMemo, useState, useEffect } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { useApplications, useUpdateApplicationStatus } from '../hooks/useApplications';
import Column from './Column';
import { Application, ApplicationStatus } from '../types';
import { Ghost, Plus, Search, Filter, ArrowUpRight, BarChart3, Clock } from 'lucide-react';
import { useApplicationStore } from '../store/useApplicationStore';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const COLUMNS: { id: ApplicationStatus; title: string; emptyMessage: string }[] = [
  { id: 'APPLIED', title: 'Applied', emptyMessage: 'No applications yet. Start your journey.' },
  { id: 'SCREENING', title: 'Screening', emptyMessage: 'The first filter.' },
  { id: 'INTERVIEW', title: 'Interview', emptyMessage: 'Time to shine.' },
  { id: 'OFFER', title: 'Offer', emptyMessage: 'The goal line.' },
  { id: 'REJECTED', title: 'Rejected', emptyMessage: 'Lessons learned.' },
];

export default function KanbanBoard() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const { data: pageData, isLoading: isQueryLoading } = useApplications();
  const { mutate: updateStatus } = useUpdateApplicationStatus();
  const { setIsAddModalOpen } = useApplicationStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [localApplications, setLocalApplications] = useState<Application[]>([]);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  // Sync local applications when NOT dragging
  useEffect(() => {
    if (!isDragging && pageData?.content) {
      setLocalApplications(pageData.content);
    }
  }, [pageData, isDragging]);

  const applications = localApplications;

  const groupedApplications = useMemo(() => {
    const grouped: Record<ApplicationStatus, Application[]> = {
      APPLIED: [],
      SCREENING: [],
      INTERVIEW: [],
      OFFER: [],
      REJECTED: [],
      WITHDRAWN: [],
    };

    applications.forEach((app) => {
      const matchesSearch = 
        app.companyName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
        
      if (matchesSearch && grouped[app.status]) {
        grouped[app.status].push(app);
      }
    });

    return grouped;
  }, [applications, searchTerm]);

  const onDragStart = () => {
    setIsDragging(true);
  };

  const onDragEnd = (result: DropResult) => {
    setIsDragging(false);
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId as ApplicationStatus;
    
    // Optimistically update local state immediately to avoid "jump"
    setLocalApplications(prev => prev.map(app => 
      app.id === draggableId ? { ...app, status: newStatus } : app
    ));

    updateStatus({ id: draggableId, status: newStatus });
  };

  if (isAuthLoading || !user) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  if (isQueryLoading) {
    return (
      <div className="flex-1 flex flex-col h-full bg-background p-8">
        <div className="h-20 flex items-center justify-between mb-8">
          <div className="w-64 h-10 bg-surface animate-pulse rounded-2xl" />
          <div className="w-40 h-10 bg-surface animate-pulse rounded-2xl" />
        </div>
        <div className="flex gap-8 overflow-hidden">
          {[1, 2, 3, 4].map(i => (
             <div key={i} className="flex-col shrink-0 w-[300px] bg-surface/30 rounded-[2rem] p-5 border border-border-muted/50">
               <div className="w-1/2 h-6 bg-surface animate-pulse rounded-full mb-6" />
               <div className="space-y-4">
                 <div className="w-full h-32 bg-surface animate-pulse rounded-2xl" />
                 <div className="w-full h-32 bg-surface animate-pulse rounded-2xl" />
               </div>
             </div>
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Active', count: applications.filter(a => ['APPLIED', 'SCREENING', 'INTERVIEW'].includes(a.status)).length, icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Interviews', count: applications.filter(a => a.status === 'INTERVIEW').length, icon: <Clock className="w-4 h-4" /> },
    { label: 'Offers', count: applications.filter(a => a.status === 'OFFER').length, icon: <ArrowUpRight className="w-4 h-4" /> },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-background relative">
      {/* Top Header Section */}
      <header className="pt-10 pb-6 px-10 flex flex-col gap-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2 font-outfit">Workspace</h1>
            <p className="text-muted-foreground text-sm font-medium">Manage your professional evolution.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-foreground transition-colors" />
              <input 
                type="text"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 pr-5 py-3 bg-surface border border-border rounded-2xl text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/10 w-64 transition-all focus:w-80 placeholder:text-muted-foreground/40 font-medium"
              />
            </div>
            
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2.5 bg-foreground text-background px-6 py-3 rounded-2xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-lg"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Application</span>
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="flex flex-wrap gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-2.5 bg-surface/50 border border-border-muted rounded-full group hover:border-border transition-colors">
              <div className="text-muted-foreground/60 group-hover:text-foreground transition-colors">{stat.icon}</div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70 group-hover:text-foreground transition-colors">{stat.label}</span>
              <span className="text-sm font-black text-foreground ml-1">{stat.count}</span>
            </div>
          ))}
          <button className="ml-auto flex items-center gap-2 px-4 py-2.5 text-muted-foreground hover:text-foreground transition-colors text-xs font-bold uppercase tracking-widest">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>
      </header>

      {/* Board Container */}
      <div className="flex-1 p-10 pt-2">
        <AnimatePresence mode="wait">
          {applications.length === 0 && !searchTerm ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-[60vh] flex flex-col items-center justify-center text-center max-w-lg mx-auto"
            >
              <div className="w-24 h-24 bg-surface rounded-[2.5rem] flex items-center justify-center mb-10 text-foreground border border-border-muted shadow-sm">
                <Ghost className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-4 font-outfit">Your board is quiet.</h2>
              <p className="text-muted-foreground font-medium mb-10 leading-relaxed">
                The best way to stop being ghosted is to flood the funnel. Start tracking your next big move today.
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-foreground text-background px-10 py-4 rounded-[1.5rem] font-bold hover:scale-105 transition-all shadow-xl active:scale-95"
              >
                Launch First Application
              </button>
            </motion.div>
          ) : (
            <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
              <div className="flex gap-10 h-full items-start pb-10">
                {COLUMNS.map((column) => (
                  <Column
                    key={column.id}
                    id={column.id}
                    title={column.title}
                    emptyMessage={column.emptyMessage}
                    applications={groupedApplications[column.id]}
                  />
                ))}
              </div>
            </DragDropContext>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
