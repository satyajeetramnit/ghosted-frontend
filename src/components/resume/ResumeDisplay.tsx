"use client";

import { ResumeData } from "@/types/resume";
import {
  User, Mail, Phone, MapPin, ExternalLink, GitBranch,
  Briefcase, GraduationCap, Code, Wrench, Sparkles, Building2, Calendar, Target
} from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  resume: ResumeData;
}

export default function ResumeDisplay({ resume }: Props) {
  return (
    <div className="bg-surface/50 rounded-[2.5rem] border border-border-muted p-10 space-y-12">
      {/* Header Artifact */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border-muted pb-10">
        <div className="space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-foreground text-background flex items-center justify-center shadow-xl">
             <User className="w-8 h-8" />
          </div>
          <div className="space-y-1">
             <h2 className="text-4xl font-bold text-foreground font-outfit tracking-tight leading-tight">
               {resume.name}
             </h2>
             <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2">
               {resume.email && (
                 <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground/90 uppercase tracking-widest">
                   <Mail className="w-3.5 h-3.5" />
                   <span>{resume.email}</span>
                 </div>
               )}
               {resume.phone && (
                 <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground/90 uppercase tracking-widest">
                   <Phone className="w-3.5 h-3.5" />
                   <span>{resume.phone}</span>
                 </div>
               )}
               {resume.location && (
                 <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground/90 uppercase tracking-widest">
                   <MapPin className="w-3.5 h-3.5" />
                   <span>{resume.location}</span>
                 </div>
               )}
             </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {resume.linkedin && (
             <div className="flex items-center gap-2 px-4 py-2 bg-background border border-border-muted rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground/90">
               <ExternalLink className="w-3 h-3" />
               <span>LinkedIn</span>
             </div>
          )}
          {resume.github && (
             <div className="flex items-center gap-2 px-4 py-2 bg-background border border-border-muted rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground/90">
               <GitBranch className="w-3 h-3" />
               <span>GitHub</span>
             </div>
          )}
        </div>
      </div>

      {/* Summary Module */}
      {resume.summary && (
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground/80 font-inter">Strategic Objective</h3>
            <div className="h-px flex-1 bg-border-muted" />
          </div>
          <p className="text-base text-foreground/80 leading-relaxed font-medium italic">"{resume.summary}"</p>
        </section>
      )}

      {/* Skills Matrix */}
      {resume.skills.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground/80 font-inter">Competency Matrix</h3>
            <div className="h-px flex-1 bg-border-muted" />
          </div>
          <div className="flex flex-wrap gap-2">
            {resume.skills.map((skill) => (
              <span key={skill} className="px-4 py-2 bg-foreground text-background text-[10px] font-black uppercase tracking-widest rounded-full shadow-md">
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Professional Trajectory */}
      {resume.experience.length > 0 && (
        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground/80 font-inter">Professional Trajectory</h3>
            <div className="h-px flex-1 bg-border-muted" />
          </div>
          <div className="space-y-12">
            {resume.experience.map((exp, i) => (
              <div key={i} className="group relative pl-10 border-l border-border-muted hover:border-foreground transition-colors duration-500">
                <div className="absolute -left-[5px] top-0 w-[9px] h-[9px] rounded-full bg-border-muted group-hover:bg-foreground transition-all duration-500" />
                
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div className="space-y-1">
                    <p className="text-xl font-bold text-foreground font-outfit">{exp.title}</p>
                    <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground/90 uppercase tracking-widest">
                       <Building2 className="w-3.5 h-3.5" />
                       <span>{exp.company}</span>
                    </div>
                  </div>
                  <div className="flex flex-col md:items-end gap-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">
                    <div className="flex items-center gap-2">
                       <Calendar className="w-3.5 h-3.5" />
                       <span>{exp.startDate} – {exp.endDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <MapPin className="w-3.5 h-3.5" />
                       <span>{exp.location}</span>
                    </div>
                  </div>
                </div>
                
                <ul className="space-y-3">
                  {exp.bullets.map((bullet, j) => (
                    <li key={j} className="text-sm text-foreground/70 leading-relaxed font-medium flex gap-4">
                      <span className="w-1.5 h-1.5 rounded-full bg-border-muted mt-1.5 shrink-0 group-hover:bg-foreground/20 transition-all" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {resume.education.length > 0 && (
        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground/80 font-inter">Education</h3>
            <div className="h-px flex-1 bg-border-muted" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {resume.education.map((edu, i) => (
              <div key={i} className="bg-background/90 border border-border-muted rounded-[1.5rem] p-6 space-y-4">
                <div className="space-y-1">
                  <p className="text-lg font-bold text-foreground font-outfit">{edu.institution}</p>
                  <p className="text-[11px] font-bold text-muted-foreground/90 uppercase tracking-widest">
                    {edu.degree} in {edu.field}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-border-muted">
                   <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{edu.graduationDate}</span>
                   </div>
                   {edu.gpa && (
                     <div className="px-3 py-1 bg-surface border border-border-muted rounded-full text-[10px] font-black text-foreground">
                       GPA: {edu.gpa}
                     </div>
                   )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects (Projects) */}
      {resume.projects.length > 0 && (
        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground/80 font-inter">Projects</h3>
            <div className="h-px flex-1 bg-border-muted" />
          </div>
          <div className="grid grid-cols-1 gap-6">
            {resume.projects.map((proj, i) => (
              <div key={i} className="bg-surface/50 border border-border-muted rounded-[2rem] p-8 group hover:bg-surface hover:border-border transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <p className="text-xl font-bold text-foreground font-outfit">{proj.name}</p>
                    {proj.link && (
                      <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest">
                         <Target className="w-3.5 h-3.5" />
                         <span>{proj.link}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3 bg-background border border-border-muted rounded-xl text-muted-foreground/90 group-hover:text-foreground transition-all">
                    <Code className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-sm text-foreground/70 leading-relaxed font-medium mb-6">{proj.description}</p>
                <div className="flex flex-wrap gap-2">
                  {proj.technologies.map((tech) => (
                    <span key={tech} className="px-3 py-1 bg-background border border-border-muted rounded-lg text-[9px] font-black uppercase tracking-widest text-muted-foreground/90 group-hover:text-foreground group-hover:border-border transition-all">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
