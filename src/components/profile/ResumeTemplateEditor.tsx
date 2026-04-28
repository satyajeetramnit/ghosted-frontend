"use client";

import { useState } from "react";
import {
  Briefcase, GraduationCap, Code, Plus, Pencil, Trash2,
  ChevronUp, ChevronDown, Check, X,
} from "lucide-react";
import { useTemplateStore } from "@/store/useTemplateStore";
import {
  ExperienceTemplate, EducationTemplate, ProjectTemplate,
} from "@/types/resume";

// ─── Shared input helpers ────────────────────────────────────────────────────

function Input({
  label, value, onChange, placeholder, full = false,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; full?: boolean;
}) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <label className="block text-xs font-medium text-foreground/50 mb-1">{label}</label>
      <input
        type="text"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-card border border-border/50 rounded-lg text-sm text-foreground placeholder:text-foreground/25 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50"
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
    <div className="flex gap-2 mt-3 justify-end">
      <button
        onClick={onCancel}
        className="flex items-center gap-1 px-3 py-1.5 text-xs text-foreground/50 hover:text-foreground border border-border/40 rounded-lg transition-colors"
      >
        <X size={12} /> Cancel
      </button>
      <button
        onClick={onSave}
        className="flex items-center gap-1 px-3 py-1.5 text-xs text-white bg-accent hover:bg-accent/90 rounded-lg transition-colors"
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
    <div className="flex flex-col gap-0.5">
      <button
        disabled={disableUp}
        onClick={onUp}
        className="p-1 rounded text-foreground/30 hover:text-foreground/70 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronUp size={13} />
      </button>
      <button
        disabled={disableDown}
        onClick={onDown}
        className="p-1 rounded text-foreground/30 hover:text-foreground/70 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronDown size={13} />
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
    <div className="bg-card rounded-xl border border-border/50 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Briefcase size={14} className="text-accent" /> Work Experience
        </h3>
        <p className="text-xs text-foreground/40 mr-auto ml-3">AI fills bullet points per entry</p>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-accent bg-accent/10 hover:bg-accent/20 border border-accent/20 rounded-lg transition-colors"
          >
            <Plus size={12} /> Add
          </button>
        )}
      </div>

      {template.experiences.length === 0 && !isAdding && (
        <p className="text-xs text-foreground/30 text-center py-4">
          No experience added yet. Add your real work history for accurate AI-generated resumes.
        </p>
      )}

      <div className="space-y-2">
        {template.experiences.map((exp, idx) => (
          <div
            key={exp.id}
            className={`bg-background rounded-lg border p-3 transition-colors ${editingId === exp.id ? "border-accent/30" : "border-border/30"}`}
          >
            {editingId === exp.id ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Company*" value={editDraft.company} onChange={setEdit("company")} placeholder="OpenText" full />
                  <Input label="Job Title*" value={editDraft.title} onChange={setEdit("title")} placeholder="Associate Software Developer" full />
                  <Input label="Start Date" value={editDraft.startDate} onChange={setEdit("startDate")} placeholder="Jan. 2023" />
                  <Input label="End Date" value={editDraft.endDate} onChange={setEdit("endDate")} placeholder="Present" />
                  <Input label="Location" value={editDraft.location} onChange={setEdit("location")} placeholder="Bengaluru, India" full />
                </div>
                <FormActions onSave={saveEdit} onCancel={() => setEditingId(null)} />
              </>
            ) : (
              <div className="flex items-start gap-2">
                <ReorderButtons
                  onUp={() => moveExperience(exp.id, "up")}
                  onDown={() => moveExperience(exp.id, "down")}
                  disableUp={idx === 0}
                  disableDown={idx === template.experiences.length - 1}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-medium text-foreground">{exp.company}</span>
                    <span className="text-foreground/30 text-xs">·</span>
                    <span className="text-xs text-foreground/60">{exp.title}</span>
                  </div>
                  <p className="text-xs text-foreground/40 mt-0.5">
                    {exp.startDate} – {exp.endDate}{exp.location ? ` · ${exp.location}` : ""}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => startEdit(exp)} className="p-1.5 rounded hover:bg-border/30 text-foreground/40 hover:text-foreground/70 transition-colors">
                    <Pencil size={12} />
                  </button>
                  <button onClick={() => removeExperience(exp.id)} className="p-1.5 rounded hover:bg-red-500/10 text-foreground/40 hover:text-red-400 transition-colors">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {isAdding && (
          <div className="bg-background rounded-lg border border-accent/30 p-3">
            <p className="text-xs text-accent font-medium mb-3">New Experience</p>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Company*" value={addDraft.company} onChange={setAdd("company")} placeholder="OpenText" full />
              <Input label="Job Title*" value={addDraft.title} onChange={setAdd("title")} placeholder="Associate Software Developer" full />
              <Input label="Start Date" value={addDraft.startDate} onChange={setAdd("startDate")} placeholder="Jan. 2023" />
              <Input label="End Date" value={addDraft.endDate} onChange={setAdd("endDate")} placeholder="Present" />
              <Input label="Location" value={addDraft.location} onChange={setAdd("location")} placeholder="Bengaluru, India" full />
            </div>
            <FormActions onSave={saveAdd} onCancel={() => { setIsAdding(false); setAddDraft(EMPTY_EXP); }} saveLabel="Add Experience" />
          </div>
        )}
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
      <div className="grid grid-cols-2 gap-3">
        <Input label="Institution*" value={draft.institution} onChange={setFn("institution")} placeholder="Kalinga Institute of Industrial Technology" full />
        <Input label="Degree" value={draft.degree} onChange={setFn("degree")} placeholder="BTech" />
        <Input label="Field of Study" value={draft.field} onChange={setFn("field")} placeholder="Information Technology" />
        <Input label="Graduation Date" value={draft.graduationDate} onChange={setFn("graduationDate")} placeholder="June. 2023" />
        <Input label="Location" value={draft.location ?? ""} onChange={setFn("location")} placeholder="Bhubaneshwar, India" />
        <Input label="GPA / CGPA" value={draft.gpa ?? ""} onChange={setFn("gpa")} placeholder="9.02" />
        <Input label="Coursework" value={draft.coursework ?? ""} onChange={setFn("coursework")} placeholder="Data Structures, Algorithms, OOP" full />
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
    <div className="bg-card rounded-xl border border-border/50 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <GraduationCap size={14} className="text-accent" /> Education
        </h3>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-accent bg-accent/10 hover:bg-accent/20 border border-accent/20 rounded-lg transition-colors"
          >
            <Plus size={12} /> Add
          </button>
        )}
      </div>

      {template.education.length === 0 && !isAdding && (
        <p className="text-xs text-foreground/30 text-center py-4">No education added yet.</p>
      )}

      <div className="space-y-2">
        {template.education.map((edu) => (
          <div
            key={edu.id}
            className={`bg-background rounded-lg border p-3 transition-colors ${editingId === edu.id ? "border-accent/30" : "border-border/30"}`}
          >
            {editingId === edu.id ? (
              <EduForm draft={editDraft} set={setEdit} onSave={saveEdit} onCancel={() => setEditingId(null)} />
            ) : (
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{edu.institution}</p>
                  <p className="text-xs text-foreground/60">
                    {[edu.degree, edu.field].filter(Boolean).join(" in ")}
                    {edu.gpa ? <span className="text-foreground/40 ml-2">CGPA: {edu.gpa}</span> : null}
                  </p>
                  <p className="text-xs text-foreground/40 mt-0.5">
                    {edu.graduationDate}{edu.location ? ` · ${edu.location}` : ""}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => startEdit(edu)} className="p-1.5 rounded hover:bg-border/30 text-foreground/40 hover:text-foreground/70 transition-colors">
                    <Pencil size={12} />
                  </button>
                  <button onClick={() => removeEducation(edu.id)} className="p-1.5 rounded hover:bg-red-500/10 text-foreground/40 hover:text-red-400 transition-colors">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {isAdding && (
          <div className="bg-background rounded-lg border border-accent/30 p-3">
            <p className="text-xs text-accent font-medium mb-3">New Education</p>
            <EduForm draft={addDraft} set={setAdd} onSave={saveAdd} onCancel={() => { setIsAdding(false); setAddDraft(EMPTY_EDU); }} saveLabel="Add Education" />
          </div>
        )}
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
    <div className="bg-card rounded-xl border border-border/50 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Code size={14} className="text-accent" /> Projects
        </h3>
        <p className="text-xs text-foreground/40 mr-auto ml-3">AI fills descriptions & tech stack</p>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-accent bg-accent/10 hover:bg-accent/20 border border-accent/20 rounded-lg transition-colors"
          >
            <Plus size={12} /> Add
          </button>
        )}
      </div>

      {template.projects.length === 0 && !isAdding && (
        <p className="text-xs text-foreground/30 text-center py-4">No projects added yet.</p>
      )}

      <div className="space-y-2">
        {template.projects.map((proj, idx) => (
          <div
            key={proj.id}
            className={`bg-background rounded-lg border p-3 transition-colors ${editingId === proj.id ? "border-accent/30" : "border-border/30"}`}
          >
            {editingId === proj.id ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Project Name*" value={editDraft.name} onChange={setEdit("name")} placeholder="Last 10 Years Analytics Platform" full />
                  <Input label="Live URL / GitHub link" value={editDraft.link ?? ""} onChange={setEdit("link")} placeholder="https://last10years.vercel.app/" full />
                </div>
                <FormActions onSave={saveEdit} onCancel={() => setEditingId(null)} />
              </>
            ) : (
              <div className="flex items-start gap-2">
                <ReorderButtons
                  onUp={() => moveProject(proj.id, "up")}
                  onDown={() => moveProject(proj.id, "down")}
                  disableUp={idx === 0}
                  disableDown={idx === template.projects.length - 1}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{proj.name}</p>
                  {proj.link && <p className="text-xs text-accent/70 truncate mt-0.5">{proj.link}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => startEdit(proj)} className="p-1.5 rounded hover:bg-border/30 text-foreground/40 hover:text-foreground/70 transition-colors">
                    <Pencil size={12} />
                  </button>
                  <button onClick={() => removeProject(proj.id)} className="p-1.5 rounded hover:bg-red-500/10 text-foreground/40 hover:text-red-400 transition-colors">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {isAdding && (
          <div className="bg-background rounded-lg border border-accent/30 p-3">
            <p className="text-xs text-accent font-medium mb-3">New Project</p>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Project Name*" value={addDraft.name} onChange={setAdd("name")} placeholder="Last 10 Years Analytics Platform" full />
              <Input label="Live URL / GitHub link" value={addDraft.link ?? ""} onChange={setAdd("link")} placeholder="https://last10years.vercel.app/" full />
            </div>
            <FormActions onSave={saveAdd} onCancel={() => { setIsAdding(false); setAddDraft(EMPTY_PROJ); }} saveLabel="Add Project" />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function ResumeTemplateEditor() {
  return (
    <div className="max-w-2xl space-y-5">
      <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 text-sm text-foreground/60">
        Define your real experience, education and projects here. When you generate a resume,{" "}
        <span className="text-foreground/80">AI fills in bullet points and descriptions</span> tailored to each job description — your structure stays the same.
      </div>
      <ExperienceSection />
      <EducationSection />
      <ProjectsSection />
    </div>
  );
}
