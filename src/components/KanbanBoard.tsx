"use client";

import { useMemo, useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { useApplications, useUpdateApplicationStatus } from '../hooks/useApplications';
import Column from './Column';
import { Application, ApplicationStatus } from '../types';
import { Ghost, Plus, Search } from 'lucide-react';
import { useApplicationStore } from '../store/useApplicationStore';

const COLUMNS: { id: ApplicationStatus; title: string; emptyMessage: string }[] = [
  { id: 'APPLIED', title: 'Applied', emptyMessage: 'No applications yet. Let’s start strong.' },
  { id: 'SCREENING', title: 'Screening', emptyMessage: 'Waiting for HR to call back.' },
  { id: 'INTERVIEW', title: 'Interview', emptyMessage: 'Line up those interviews here.' },
  { id: 'OFFER', title: 'Offer', emptyMessage: 'Offers will land here 👀' },
  { id: 'REJECTED', title: 'Rejected', emptyMessage: 'Not meant to be. On to the next.' },
];

export default function KanbanBoard() {
  const { data: pageData, isLoading } = useApplications();
  const applications = pageData?.content || [];
  const { mutate: updateStatus } = useUpdateApplicationStatus();
  const { setIsAddModalOpen } = useApplicationStore();

  const [searchTerm, setSearchTerm] = useState('');

  // 1. Filter applications locally based on search
  // 2. Normalize and group data in one pass per render
  const groupedApplications = useMemo(() => {
    const grouped: Record<ApplicationStatus, Application[]> = {
      APPLIED: [],
      SCREENING: [],
      INTERVIEW: [],
      OFFER: [],
      REJECTED: [],
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

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as ApplicationStatus;
    updateStatus({ id: draggableId, status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col h-full bg-background p-6">
        <div className="h-16 flex items-center justify-between mb-6">
          <div className="w-1/3 h-8 bg-card/60 animate-pulse rounded-lg" />
          <div className="w-32 h-10 bg-card/60 animate-pulse rounded-lg" />
        </div>
        <div className="flex gap-6 overflow-hidden">
          {[1, 2, 3, 4, 5].map(i => (
             <div key={i} className="flex-col shrink-0 w-[280px] md:w-[320px] bg-card/10 rounded-2xl p-3 border border-border/20">
               <div className="w-3/4 h-5 bg-card/40 animate-pulse rounded mb-4" />
               <div className="space-y-3">
                 <div className="w-full h-32 bg-card/30 animate-pulse rounded-xl" />
                 <div className="w-full h-32 bg-card/30 animate-pulse rounded-xl" />
               </div>
             </div>
          ))}
        </div>
      </div>
    );
  }

  const applied = applications.filter(a => a.status === 'APPLIED').length;
  const interviews = applications.filter(a => a.status === 'INTERVIEW').length;
  const offers = applications.filter(a => a.status === 'OFFER').length;

  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      {/* Top Bar */}
      <header className="h-[72px] border-b border-border/30 px-6 flex flex-col md:flex-row md:items-center justify-between shrink-0 gap-4 md:gap-0">
        <div className="text-sm font-medium text-foreground/60 flex flex-wrap items-center gap-4">
          <span>Applied: <span className="text-foreground">{applied}</span></span>
          <span className="w-1 h-1 rounded-full bg-border hidden md:block"></span>
          <span>Interviews: <span className="text-foreground">{interviews}</span></span>
          <span className="w-1 h-1 rounded-full bg-border hidden md:block"></span>
          <span>Offers: <span className="text-foreground">{offers}</span></span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
            <input 
              type="text"
              placeholder="Search company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent w-48 transition-all focus:w-64"
            />
          </div>
          
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Application</span>
          </button>
        </div>
      </header>

      {/* Board */}
      <div className="flex-1 overflow-x-auto p-4 md:p-6 snap-x snap-mandatory">
        {applications.length === 0 && !searchTerm ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-6 text-accent">
              <Ghost className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">No applications yet</h2>
            <p className="text-foreground/60 mb-6">Start tracking your job search journey. Your next role is waiting.</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-accent text-white px-6 py-2.5 rounded-lg font-medium hover:bg-accent/90 transition-colors cursor-pointer"
            >
              Add your first application
            </button>
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-4 md:gap-6 h-full items-start pb-4">
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
      </div>
    </div>
  );
}
