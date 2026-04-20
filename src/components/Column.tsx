import { Droppable } from '@hello-pangea/dnd';
import { Application, ApplicationStatus } from '../types';
import Card from './Card';
import clsx from 'clsx';

interface ColumnProps {
  id: ApplicationStatus;
  title: string;
  applications: Application[];
  emptyMessage: string;
}

export default function Column({ id, title, applications, emptyMessage }: ColumnProps) {
  return (
    <div className="flex flex-col shrink-0 w-[280px] md:w-[320px] bg-card/20 rounded-2xl p-3 border border-border/30 snap-center">
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="font-medium text-foreground/80 flex items-center gap-2">
          <div className={clsx(
            "w-2 h-2 rounded-full",
            id === 'APPLIED' && "bg-status-applied",
            id === 'SCREENING' && "bg-status-screening",
            id === 'INTERVIEW' && "bg-status-interview",
            id === 'OFFER' && "bg-status-offer",
            id === 'REJECTED' && "bg-status-rejected",
          )} />
          {title}
        </h2>
        <span className="text-xs font-medium text-foreground/40 bg-background px-2 py-0.5 rounded-full border border-border/50">
          {applications.length}
        </span>
      </div>

      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`
              flex-1 min-h-[150px] space-y-3 p-1 rounded-xl transition-colors
              ${snapshot.isDraggingOver ? 'bg-card/40' : ''}
              ${applications.length === 0 ? 'flex flex-col items-center justify-center border-2 border-dashed border-border/30 bg-card/5' : ''}
            `}
          >
            {applications.length === 0 && !snapshot.isDraggingOver && (
               <p className="text-xs text-foreground/40 font-medium text-center px-4">
                 {emptyMessage}
               </p>
            )}

            {applications.map((app, index) => (
              <Card key={app.id} application={app} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
