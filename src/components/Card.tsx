import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Application } from '../types';
import { useApplicationStore } from '../store/useApplicationStore';
import { Building2, UserCircle2, Clock, Ghost } from 'lucide-react';
import { formatDistanceToNow, differenceInCalendarDays } from 'date-fns';
import { parseLocalDate } from '../services/api';

interface CardProps {
  application: Application;
  index: number;
}

function CardComponent({ application, index }: CardProps) {
  const { setSelectedApplication } = useApplicationStore();

  // Parse as local midnight so formatDistanceToNow is not skewed by UTC offset
  const appliedLocal = parseLocalDate(application.appliedDate);
  const daysSinceApplied = differenceInCalendarDays(new Date(), appliedLocal);
  const isGhosted = daysSinceApplied > 7;

  return (
    <Draggable draggableId={application.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => setSelectedApplication(application)}
          className={`
            bg-card p-4 rounded-xl border border-border/50 text-left relative
            transition-all duration-200 cursor-grab active:cursor-grabbing
            hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5
            ${snapshot.isDragging ? 'shadow-xl shadow-accent/10 border-accent rotate-2 scale-105 z-50' : ''}
          `}
          style={provided.draggableProps.style}
        >
          {isGhosted && (
            <div className="absolute -top-2 -right-2 bg-background border border-border/50 text-foreground/50 p-1.5 rounded-full shadow-sm group">
              <Ghost className="w-3.5 h-3.5" />
              <span className="absolute hidden group-hover:block w-max bg-foreground text-background text-[10px] font-medium px-2 py-1 rounded right-0 top-7 z-10">
                Might be ghosting you
              </span>
            </div>
          )}

          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4 text-foreground/50" />
              {application.companyName}
            </h3>
          </div>
          
          <div className="text-sm text-foreground/80 font-medium mb-4">
            {application.jobTitle}
          </div>

          <div className="flex items-center justify-between text-xs text-foreground/50 mt-4 pt-3 border-t border-border/30">
            <div className="flex items-center gap-1.5">
              <UserCircle2 className="w-3.5 h-3.5" />
              <span className="truncate max-w-[80px]">{application.contacts[0]?.name ?? 'No contact'}</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatDistanceToNow(appliedLocal, { addSuffix: true }).replace('about ', '')}</span>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}

// React.memo prevents the card from re-rendering unless its application data or index changes.
export default React.memo(CardComponent, (prevProps, nextProps) => {
  return (
    prevProps.application.id === nextProps.application.id &&
    prevProps.application.status === nextProps.application.status &&
    prevProps.index === nextProps.index
  );
});
