import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Application } from '../types';
import { useApplicationStore } from '../store/useApplicationStore';
import { Building2, Briefcase, Calendar, Ghost, MapPin, ExternalLink } from 'lucide-react';
import { formatDistanceToNow, differenceInCalendarDays } from 'date-fns';
import { parseLocalDate } from '../services/api';
import { motion } from 'framer-motion';

interface CardProps {
  application: Application;
  index: number;
}

function CardComponent({ application, index }: CardProps) {
  const { setSelectedApplication } = useApplicationStore();

  const appliedLocal = parseLocalDate(application.appliedDate);
  const daysSinceApplied = differenceInCalendarDays(new Date(), appliedLocal);
  const isGhosted = daysSinceApplied > 7;

  return (
    <Draggable draggableId={application.id} index={index}>
      {(provided, snapshot) => (
        <motion.div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => setSelectedApplication(application)}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className={`
            group relative bg-card p-6 rounded-[1.5rem] border transition-all duration-300 cursor-grab active:cursor-grabbing overflow-hidden
            ${snapshot.isDragging ? 'shadow-2xl shadow-foreground/5 border-foreground z-50 scale-[1.02]' : 'border-border-muted hover:border-border hover:bg-surface/50'}
          `}
          style={provided.draggableProps.style}
        >
          {/* Decorative Gradient Glow (Innovative) */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-foreground/5 to-transparent blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Ghosted Indicator */}
          {isGhosted && (
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2 py-1 bg-surface border border-border-muted rounded-full group/ghost">
              <Ghost className="w-3 h-3 text-muted-foreground/60 group-hover/ghost:text-foreground transition-colors" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 group-hover/ghost:text-foreground transition-colors">Ghosted?</span>
            </div>
          )}

          {/* Card Content */}
          <div className="flex flex-col gap-4 relative z-10">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground/50 uppercase tracking-[0.1em]">
                  <Building2 className="w-3 h-3" />
                  <span>{application.companyName}</span>
                </div>
                <h3 className="text-base font-bold text-foreground leading-tight group-hover:text-foreground transition-colors font-outfit">
                  {application.jobTitle}
                </h3>
              </div>
            </div>

            {/* Tags/Meta */}
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-surface border border-border-muted rounded-full text-[10px] font-bold text-muted-foreground/70">
                <MapPin className="w-3 h-3" />
                <span>Remote</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-surface border border-border-muted rounded-full text-[10px] font-bold text-muted-foreground/70">
                <Briefcase className="w-3 h-3" />
                <span>Full-time</span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-border-muted/50 mt-2">
              <div className="flex items-center gap-2">
                 <div className="w-6 h-6 rounded-full bg-surface border border-border-muted flex items-center justify-center overflow-hidden">
                    <span className="text-[10px] font-bold text-foreground/50">
                      {application.contacts[0]?.name?.charAt(0) ?? '?'}
                    </span>
                 </div>
                 <span className="text-[11px] font-medium text-muted-foreground/60 group-hover:text-foreground transition-colors truncate max-w-[100px]">
                    {application.contacts[0]?.name ?? 'Unassigned'}
                 </span>
              </div>
              
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/40 group-hover:text-muted-foreground transition-colors uppercase tracking-wider">
                <Calendar className="w-3 h-3" />
                <span>{formatDistanceToNow(appliedLocal, { addSuffix: true }).replace('about ', '')}</span>
              </div>
            </div>
          </div>
          
          {/* Quick Action Overlay (Innovative) */}
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all">
            <button className="p-2 bg-foreground text-background rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-transform">
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </Draggable>
  );
}

export default React.memo(CardComponent, (prevProps, nextProps) => {
  return (
    prevProps.application.id === nextProps.application.id &&
    prevProps.application.status === nextProps.application.status &&
    prevProps.index === nextProps.index
  );
});
