"use client";

import { useState } from "react";
import {
  Briefcase, GraduationCap, Code, Plus, Pencil, Trash2,
  ChevronUp, ChevronDown, Check, X, Building2, Calendar, Target, Award, BookOpen, Layers, Sparkles
} from "lucide-react";
import { useTemplateStore } from "@/store/useTemplateStore";
import { useSaveProfile } from "@/hooks/useProfile";
import {
  ExperienceTemplate, EducationTemplate, ProjectTemplate,
} from "@/types/resume";
import { motion, AnimatePresence } from "framer-motion";

// ─── Shared input helpers ────────────────────────────────────────────────────

function Input({
  label, value, onChange, placeholder, full = false,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; full?: boolean;
}) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <label className="block text-[10px] font-black text-muted-foreground/80 uppercase tracking-widest ml-1 mb-1.5">{label}</label>
      <input
        type="text"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-background border border-border-muted rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground/90 focus:outline-none focus:ring-1 focus:ring-foreground/10 transition-all"
      />
    </div>
  );
}

function FormActions({
  onSave, onCancel, saveLabel = "Save",
}: {
  onSave: () => void; onCancel: () => void; saveLabel?: string;
}) {
  return (
    <div className="flex gap-3 mt-6 justify-end">
      <button
        onClick={onCancel}
        className="flex items-center gap-2 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 hover:text-foreground transition-all"
      >
        <X size={12} /> Cancel
      </button>
      <button
        onClick={onSave}
        className="flex items-center gap-2 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-background bg-foreground rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all"
      >
        <Check size={12} /> {saveLabel}
      </button>
    </div>
  );
}

function ReorderButtons({
  onUp, onDown, disableUp, disableDown,
}: {
  onUp: () => void; onDown: () => void; disableUp: boolean; disableDown: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 pr-2">
      <button
        disabled={disableUp}
        onClick={onUp}
        className="p-1 rounded-lg bg-surface border border-border-muted text-muted-foreground/70 hover:text-foreground disabled:opacity-10 transition-all"
      >
        <ChevronUp size={12} />
      </button>
      <button
        disabled={disableDown}
        onClick={onDown}
        className="p-1 rounded-lg bg-surface border border-border-muted text-muted-foreground/70 hover:text-foreground disabled:opacity-10 transition-all"
      >
        <ChevronDown size={12} />
      </button>
    </div>
  );
}

// ─── Experience Section ───────────────────────────────────────────────────────

type ExpDraft = Omit<ExperienceTemplate, "id">;
const EMPTY_EXP: ExpDraft = { company: "", title: "", startDate: "", endDate: "", location: "" };

function ExperienceSection() {
  const { template, addExperience, updateExperience, removeExperience, moveExperience } =
    useTemplateStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<ExpDraft>(EMPTY_EXP);
  const [isAdding, setIsAdding] = useState(false);
  const [addDraft, setAddDraft] = useState<ExpDraft>(EMPTY_EXP);

  function startEdit(exp: ExperienceTemplate) {
    setEditingId(exp.id);
    setEditDraft({ company: exp.company, title: exp.title, startDate: exp.startDate, endDate: exp.endDate, location: exp.location });
  }
  function saveEdit() {
    if (!editingId || !editDraft.company.trim() || !editDraft.title.trim()) return;
    updateExperience(editingId, editDraft);
    setEditingId(null);
  }
  function saveAdd() {
    if (!addDraft.company.trim() || !addDraft.title.trim()) return;
    addExperience(addDraft);
    setAddDraft(EMPTY_EXP);
    setIsAdding(false);
  }

  const setEdit = (k: keyof ExpDraft) => (v: string) => setEditDraft((p) => ({ ...p, [k]: v }));
  const setAdd = (k: keyof ExpDraft) => (v: string) => setAddDraft((p) => ({ ...p, [k]: v }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center">
             <Briefcase size={14} />
           </div>
           <div className="space-y-0.5">
             <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground/60">Experience</h3>
             <p className="text-[9px] font-bold text-muted-foreground/70 uppercase tracking-widest italic">Your work experience and professional history.</p>
           </div>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-5 py-2 bg-foreground text-background rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={12} /> Add Experience
          </button>
        )}
      </div>

      <div className="space-y-3">
        {template.experiences.map((exp, idx) => (
          <motion.div
            key={exp.id}
            layout
            className={`bg-background/90 rounded-[2rem] border p-6 transition-all duration-500 ${editingId === exp.id ? "border-foreground shadow-2xl" : "border-border-muted hover:border-border"}`}
          >
            {editingId === exp.id ? (
              <>
                <div className="grid grid-cols-2 gap-6">
                  <Input label="Company Name*" value={editDraft.company} onChange={setEdit("company")} placeholder="Anthropic, Google..." full />
                  <Input label="Job Title*" value={editDraft.title} onChange={setEdit("title")} placeholder="Senior Systems Architect" full />
                  <Input label="Start Date" value={editDraft.startDate} onChange={setEdit("startDate")} placeholder="Jan. 2023" />
                  <Input label="End Date" value={editDraft.endDate} onChange={setEdit("endDate")} placeholder="Present" />
                  <Input label="Location" value={editDraft.location} onChange={setEdit("location")} placeholder="San Francisco, CA" full />
                </div>
                <FormActions onSave={saveEdit} onCancel={() => setEditingId(null)} saveLabel="Update Record" />
              </>
            ) : (
              <div className="flex items-center gap-6">
                <ReorderButtons
                  onUp={() => moveExperience(exp.id, "up")}
                  onDown={() => moveExperience(exp.id, "down")}
                  disableUp={idx === 0}
                  disableDown={idx === template.experiences.length - 1}
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold text-foreground font-outfit tracking-tight">{exp.company}</span>
                    <div className="w-1 h-1 rounded-full bg-border-muted" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/90">{exp.title}</span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest">
                    <div className="flex items-center gap-1.5">
                       <Calendar className="w-3 h-3" />
                       <span>{exp.startDate} – {exp.endDate}</span>
                    </div>
                    {exp.location && (
                       <div className="flex items-center gap-1.5">
                          <Target className="w-3 h-3" />
                          <span>{exp.location}</span>
                       </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => startEdit(exp)} className="p-3 rounded-xl bg-surface border border-border-muted text-muted-foreground/70 hover:text-foreground transition-all">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => removeExperience(exp.id)} className="p-3 rounded-xl bg-surface border border-border-muted text-muted-foreground/90 hover:text-red-500 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ))}

        <AnimatePresence>
          {isAdding && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-background/80 rounded-[2rem] border border-foreground p-8 shadow-2xl relative z-20">
              <div className="flex items-center gap-3 mb-8">
                 <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center">
                   <Plus size={14} />
                 </div>
                 <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground">New Blueprint Record</h4>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <Input label="Company Name*" value={addDraft.company} onChange={setAdd("company")} placeholder="OpenText" full />
                <Input label="Job Title*" value={addDraft.title} onChange={setAdd("title")} placeholder="Associate Software Developer" full />
                <Input label="Start Date" value={addDraft.startDate} onChange={setAdd("startDate")} placeholder="Jan. 2023" />
                <Input label="End Date" value={addDraft.endDate} onChange={setAdd("endDate")} placeholder="Present" />
                <Input label="Location" value={addDraft.location} onChange={setAdd("location")} placeholder="Bengaluru, India" full />
              </div>
              <FormActions onSave={saveAdd} onCancel={() => { setIsAdding(false); setAddDraft(EMPTY_EXP); }} saveLabel="Save Experience" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Education Section ────────────────────────────────────────────────────────

type EduDraft = Omit<EducationTemplate, "id">;
const EMPTY_EDU: EduDraft = { institution: "", degree: "", field: "", graduationDate: "", location: "", gpa: "", coursework: "" };

function EduForm({ draft, set: setFn, onSave, onCancel, saveLabel }: { draft: EduDraft; set: (k: keyof EduDraft) => (v: string) => void; onSave: () => void; onCancel: () => void; saveLabel?: string }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-6">
        <Input label="Institution*" value={draft.institution} onChange={setFn("institution")} placeholder="University of Intelligence" full />
        <Input label="Degree Type" value={draft.degree} onChange={setFn("degree")} placeholder="BTech" />
        <Input label="Field of Specialization" value={draft.field} onChange={setFn("field")} placeholder="Information Technology" />
        <Input label="Graduation Date" value={draft.graduationDate} onChange={setFn("graduationDate")} placeholder="June. 2023" />
        <Input label="Location" value={draft.location ?? ""} onChange={setFn("location")} placeholder="Bhubaneshwar, India" />
        <Input label="GPA / CGPA" value={draft.gpa ?? ""} onChange={setFn("gpa")} placeholder="9.02" />
        <Input label="Specialized Coursework" value={draft.coursework ?? ""} onChange={setFn("coursework")} placeholder="Data Structures, Algorithms, OOP" full />
      </div>
      <FormActions onSave={onSave} onCancel={onCancel} saveLabel={saveLabel} />
    </>
  );
}

function EducationSection() {
  const { template, addEducation, updateEducation, removeEducation } = useTemplateStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<EduDraft>(EMPTY_EDU);
  const [isAdding, setIsAdding] = useState(false);
  const [addDraft, setAddDraft] = useState<EduDraft>(EMPTY_EDU);

  function startEdit(edu: EducationTemplate) {
    setEditingId(edu.id);
    setEditDraft({ institution: edu.institution, degree: edu.degree, field: edu.field, graduationDate: edu.graduationDate, location: edu.location ?? "", gpa: edu.gpa ?? "", coursework: edu.coursework ?? "" });
  }
  function saveEdit() {
    if (!editingId || !editDraft.institution.trim()) return;
    updateEducation(editingId, editDraft);
    setEditingId(null);
  }
  function saveAdd() {
    if (!addDraft.institution.trim()) return;
    addEducation(addDraft);
    setAddDraft(EMPTY_EDU);
    setIsAdding(false);
  }

  const setEdit = (k: keyof EduDraft) => (v: string) => setEditDraft((p) => ({ ...p, [k]: v }));
  const setAdd = (k: keyof EduDraft) => (v: string) => setAddDraft((p) => ({ ...p, [k]: v }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center">
             <GraduationCap size={14} />
           </div>
           <div className="space-y-0.5">
             <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground/60">Education</h3>
             <p className="text-[9px] font-bold text-muted-foreground/70 uppercase tracking-widest italic">Your academic background and degrees.</p>
           </div>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-5 py-2 bg-foreground text-background rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={12} /> Add Education
          </button>
        )}
      </div>

      <div className="space-y-3">
        {template.education.map((edu) => (
          <motion.div
            key={edu.id}
            layout
            className={`bg-background/90 rounded-[2rem] border p-6 transition-all duration-500 ${editingId === edu.id ? "border-foreground shadow-2xl" : "border-border-muted hover:border-border"}`}
          >
            {editingId === edu.id ? (
              <EduForm draft={editDraft} set={setEdit} onSave={saveEdit} onCancel={() => setEditingId(null)} saveLabel="Update Foundation" />
            ) : (
              <div className="flex items-center justify-between gap-6">
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-base font-bold text-foreground font-outfit tracking-tight">{edu.institution}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/90">
                      {[edu.degree, edu.field].filter(Boolean).join(" in ")}
                    </span>
                    {edu.gpa && (
                      <>
                        <div className="w-1 h-1 rounded-full bg-border-muted" />
                        <span className="text-[10px] font-bold text-foreground">MAGNITUDE: {edu.gpa}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest pt-1">
                     <div className="flex items-center gap-1.5">
                        <Calendar size={12} />
                        <span>CONFERRED: {edu.graduationDate}</span>
                     </div>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => startEdit(edu)} className="p-3 rounded-xl bg-surface border border-border-muted text-muted-foreground/70 hover:text-foreground transition-all">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => removeEducation(edu.id)} className="p-3 rounded-xl bg-surface border border-border-muted text-muted-foreground/90 hover:text-red-500 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ))}

        <AnimatePresence>
          {isAdding && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-background/80 rounded-[2rem] border border-foreground p-8 shadow-2xl relative z-20">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground mb-8">New Education</p>
              <EduForm draft={addDraft} set={setAdd} onSave={saveAdd} onCancel={() => { setIsAdding(false); setAddDraft(EMPTY_EDU); }} saveLabel="Save Education" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Projects Section ─────────────────────────────────────────────────────────

type ProjDraft = Omit<ProjectTemplate, "id">;
const EMPTY_PROJ: ProjDraft = { name: "", link: "" };

function ProjectsSection() {
  const { template, addProject, updateProject, removeProject, moveProject } = useTemplateStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<ProjDraft>(EMPTY_PROJ);
  const [isAdding, setIsAdding] = useState(false);
  const [addDraft, setAddDraft] = useState<ProjDraft>(EMPTY_PROJ);

  function startEdit(proj: ProjectTemplate) {
    setEditingId(proj.id);
    setEditDraft({ name: proj.name, link: proj.link ?? "" });
  }
  function saveEdit() {
    if (!editingId || !editDraft.name.trim()) return;
    updateProject(editingId, editDraft);
    setEditingId(null);
  }
  function saveAdd() {
    if (!addDraft.name.trim()) return;
    addProject(addDraft);
    setAddDraft(EMPTY_PROJ);
    setIsAdding(false);
  }

  const setEdit = (k: keyof ProjDraft) => (v: string) => setEditDraft((p) => ({ ...p, [k]: v }));
  const setAdd = (k: keyof ProjDraft) => (v: string) => setAddDraft((p) => ({ ...p, [k]: v }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center">
             <Code size={14} />
           </div>
           <div className="space-y-0.5">
             <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground/60">Projects</h3>
             <p className="text-[9px] font-bold text-muted-foreground/70 uppercase tracking-widest italic">Personal projects and applications.</p>
           </div>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-5 py-2 bg-foreground text-background rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={12} /> Add Project
          </button>
        )}
      </div>

      <div className="space-y-3">
        {template.projects.map((proj, idx) => (
          <motion.div
            key={proj.id}
            layout
            className={`bg-background/90 rounded-[2rem] border p-6 transition-all duration-500 ${editingId === proj.id ? "border-foreground shadow-2xl" : "border-border-muted hover:border-border"}`}
          >
            {editingId === proj.id ? (
              <>
                <div className="grid grid-cols-2 gap-6">
                  <Input label="Project Name*" value={editDraft.name} onChange={setEdit("name")} placeholder="Neural Analytics Platform" full />
                  <Input label="Link (URL)" value={editDraft.link ?? ""} onChange={setEdit("link")} placeholder="https://artifact.vercel.app/" full />
                </div>
                <FormActions onSave={saveEdit} onCancel={() => setEditingId(null)} saveLabel="Update Prototype" />
              </>
            ) : (
              <div className="flex items-center gap-6">
                <ReorderButtons
                  onUp={() => moveProject(proj.id, "up")}
                  onDown={() => moveProject(proj.id, "down")}
                  disableUp={idx === 0}
                  disableDown={idx === template.projects.length - 1}
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-base font-bold text-foreground font-outfit tracking-tight">{proj.name}</p>
                  {proj.link && (
                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest">
                       <Target size={12} />
                       <span className="truncate">{proj.link}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => startEdit(proj)} className="p-3 rounded-xl bg-surface border border-border-muted text-muted-foreground/70 hover:text-foreground transition-all">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => removeProject(proj.id)} className="p-3 rounded-xl bg-surface border border-border-muted text-muted-foreground/90 hover:text-red-500 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ))}

        <AnimatePresence>
          {isAdding && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-background/80 rounded-[2rem] border border-foreground p-8 shadow-2xl relative z-20">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground mb-8">New Signal Prototype</p>
              <div className="grid grid-cols-2 gap-6">
                <Input label="Project Name*" value={addDraft.name} onChange={setAdd("name")} placeholder="Neural Analytics Platform" full />
                <Input label="Link (URL)" value={addDraft.link ?? ""} onChange={setAdd("link")} placeholder="https://artifact.vercel.app/" full />
              </div>
              <FormActions onSave={saveAdd} onCancel={() => { setIsAdding(false); setAddDraft(EMPTY_PROJ); }} saveLabel="Save Project" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function ResumeTemplateEditor() {
  const { template } = useTemplateStore();
  const { mutate: saveProfile, isPending: isSaving } = useSaveProfile();
  const [saved, setSaved] = useState(false);

  function handleSaveTemplate() {
    saveProfile(
      {
        experiencesJson: JSON.stringify(template.experiences),
        educationJson: JSON.stringify(template.education),
        projectsJson: JSON.stringify(template.projects),
      },
      {
        onSuccess: () => {
          setSaved(true);
          setTimeout(() => setSaved(false), 2500);
        },
      }
    );
  }

  return (
    <div className="max-w-4xl space-y-16">
      <div className="bg-foreground text-background rounded-[2.5rem] p-10 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h2 className="text-2xl font-bold font-outfit tracking-tight">Experience Configuration</h2>
            </div>
            <p className="text-sm font-medium text-background/60 leading-relaxed max-w-xl">
              Configure your experience, education, and projects. The AI will expand these into tailored resume bullets for each job you apply to.
            </p>
          </div>
          <button
            onClick={handleSaveTemplate}
            disabled={isSaving}
            className={`shrink-0 flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest backdrop-blur-md transition-all disabled:opacity-60 ${
              saved
                ? "bg-green-500/20 border border-green-400/30 text-green-300"
                : "bg-background/10 border border-white/10 text-background/80 hover:bg-background/20"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{saved ? "Saved!" : isSaving ? "Saving..." : "Save Template"}</span>
          </button>
        </div>
        {/* Subtle Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full -mr-20 -mt-20" />
      </div>
      
      <ExperienceSection />
      <EducationSection />
      <ProjectsSection />
    </div>
  );
}
