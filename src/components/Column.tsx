'use client';

import { Droppable } from '@hello-pangea/dnd';
import { Application, ApplicationStatus } from '../types';
import Card from './Card';
import { MoreHorizontal } from 'lucide-react';

interface ColumnProps {
  id: ApplicationStatus;
  title: string;
  applications: Application[];
  emptyMessage: string;
}

export default function Column({ id, title, applications, emptyMessage }: ColumnProps) {
  return (
    <div className="flex flex-col w-[320px] shrink-0 group">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-3">
          <h2 className="text-[13px] font-black uppercase tracking-[0.15em] text-foreground/80 font-inter">
            {title}
          </h2>
          <span className="flex items-center justify-center min-w-[22px] h-[22px] px-1.5 text-[11px] font-bold bg-surface border border-border-muted rounded-md text-muted-foreground transition-colors group-hover:border-border">
            {applications.length}
          </span>
        </div>
        <button className="p-1.5 text-muted-foreground/40 hover:text-foreground hover:bg-surface rounded-lg transition-all opacity-0 group-hover:opacity-100">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Drop Zone */}
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`
              flex-1 flex flex-col gap-5 p-2 rounded-[2rem] transition-all duration-300 pb-10
              ${snapshot.isDraggingOver ? 'bg-surface/50 border border-dashed border-border' : 'bg-transparent'}
            `}
          >
            {applications.map((app, index) => (
              <Card key={app.id} application={app} index={index} />
            ))}
            
            {applications.length === 0 && (
              <div className="h-32 border border-dashed border-border-muted rounded-[1.5rem] flex items-center justify-center p-6 text-center group/empty transition-all hover:border-border">
                <p className="text-[11px] font-medium text-muted-foreground/40 leading-relaxed uppercase tracking-wider group-hover/empty:text-muted-foreground/60 transition-colors">
                  {emptyMessage}
                </p>
              </div>
            )}
            
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
