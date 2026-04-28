"use client";

import { ResumeData } from "@/types/resume";
import {
  User, Mail, Phone, MapPin, ExternalLink, GitBranch,
  Briefcase, GraduationCap, Code, Wrench,
} from "lucide-react";

interface Props {
  resume: ResumeData;
}

export default function ResumeDisplay({ resume }: Props) {
  return (
    <div className="bg-card rounded-xl border border-border/50 p-5 space-y-5">
      {/* Header */}
      <div className="border-b border-border/30 pb-4">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <User size={18} className="text-accent" />
          {resume.name}
        </h2>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-foreground/60">
          {resume.email && (
            <span className="flex items-center gap-1"><Mail size={12} />{resume.email}</span>
          )}
          {resume.phone && (
            <span className="flex items-center gap-1"><Phone size={12} />{resume.phone}</span>
          )}
          {resume.location && (
            <span className="flex items-center gap-1"><MapPin size={12} />{resume.location}</span>
          )}
          {resume.linkedin && (
            <span className="flex items-center gap-1"><ExternalLink size={12} />{resume.linkedin}</span>
          )}
          {resume.github && (
            <span className="flex items-center gap-1"><GitBranch size={12} />{resume.github}</span>
          )}
        </div>
      </div>

      {/* Summary */}
      {resume.summary && (
        <section>
          <h3 className="text-[11px] uppercase tracking-widest text-accent font-medium mb-2">Summary</h3>
          <p className="text-sm text-foreground/80 leading-relaxed">{resume.summary}</p>
        </section>
      )}

      {/* Skills */}
      {resume.skills.length > 0 && (
        <section>
          <h3 className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-accent font-medium mb-2">
            <Wrench size={12} /> Technical Skills
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {resume.skills.map((skill) => (
              <span key={skill} className="px-2.5 py-0.5 bg-accent/10 text-accent text-xs font-medium rounded-full border border-accent/20">
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Experience */}
      {resume.experience.length > 0 && (
        <section>
          <h3 className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-accent font-medium mb-3">
            <Briefcase size={12} /> Work Experience
          </h3>
          <div className="space-y-4">
            {resume.experience.map((exp, i) => (
              <div key={i} className="relative pl-4 border-l-2 border-accent/20">
                <div className="flex flex-wrap justify-between items-start gap-1">
                  <div>
                    <p className="font-semibold text-foreground text-sm">{exp.title}</p>
                    <p className="text-foreground/60 text-sm">{exp.company}</p>
                  </div>
                  <div className="text-right text-xs text-foreground/40">
                    <p>{exp.startDate} – {exp.endDate}</p>
                    <p>{exp.location}</p>
                  </div>
                </div>
                <ul className="mt-2 space-y-1">
                  {exp.bullets.map((bullet, j) => (
                    <li key={j} className="text-sm text-foreground/70 flex gap-2 before:content-['•'] before:text-accent before:flex-shrink-0">
                      {bullet}
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
        <section>
          <h3 className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-accent font-medium mb-3">
            <GraduationCap size={12} /> Education
          </h3>
          <div className="space-y-2">
            {resume.education.map((edu, i) => (
              <div key={i} className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-foreground text-sm">{edu.institution}</p>
                  <p className="text-foreground/60 text-sm">
                    {edu.degree} in {edu.field}
                    {edu.gpa && <span className="ml-2 text-foreground/40">GPA: {edu.gpa}</span>}
                  </p>
                </div>
                <p className="text-xs text-foreground/40">{edu.graduationDate}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {resume.projects.length > 0 && (
        <section>
          <h3 className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-accent font-medium mb-3">
            <Code size={12} /> Projects
          </h3>
          <div className="space-y-3">
            {resume.projects.map((proj, i) => (
              <div key={i} className="bg-background rounded-lg p-3 border border-border/40">
                <div className="flex justify-between items-start">
                  <p className="font-semibold text-foreground text-sm">{proj.name}</p>
                  {proj.link && <span className="text-xs text-accent">{proj.link}</span>}
                </div>
                <p className="text-sm text-foreground/70 mt-1">{proj.description}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {proj.technologies.map((tech) => (
                    <span key={tech} className="px-2 py-0.5 bg-card border border-border/50 text-xs text-foreground/60 rounded">
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
