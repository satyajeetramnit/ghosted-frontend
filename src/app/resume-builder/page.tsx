"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  FileText, Code2, Eye, Upload, Trash2, Plus, Building2, Save, Check, AlertCircle, Info,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useResumeStore } from "@/store/useResumeStore";
import { useProfileStore } from "@/store/useProfileStore";
import { useTemplateStore } from "@/store/useTemplateStore";
import { generateLatex } from "@/lib/latexGenerator";
import { ResumeData, GlobalProfile, SavedResume } from "@/types/resume";

import JobDescriptionInput from "@/components/resume/JobDescriptionInput";
import ResumeDisplay from "@/components/resume/ResumeDisplay";
import LaTeXEditor from "@/components/resume/LaTeXEditor";
import AIEditPanel from "@/components/resume/AIEditPanel";
import Preview from "@/components/resume/Preview";
import ResumeUploadModal from "@/components/resume/ResumeUploadModal";

type Tab = "resume" | "latex" | "preview";
type LinkKey = "linkedin" | "github" | "portfolio" | "leetcode" | "hackerrank";

const LINK_KEYS: { key: LinkKey; label: string }[] = [
  { key: "linkedin", label: "LinkedIn" },
  { key: "github", label: "GitHub" },
  { key: "portfolio", label: "Portfolio" },
  { key: "leetcode", label: "LeetCode" },
  { key: "hackerrank", label: "HackerRank" },
];

export default function ResumeBuilderPage() {
  const { user } = useAuth();

  const { savedResumes, addResume, updateResume, deleteResume, activeResumeId, setActiveResume } =
    useResumeStore();
  const { profile } = useProfileStore();
  const { template } = useTemplateStore();

  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [latexCode, setLatexCode] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("resume");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApplyingEdit, setIsApplyingEdit] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved">("idle");
  const [disabledLinks, setDisabledLinks] = useState<Set<LinkKey>>(new Set());
  const [showUploadModal, setShowUploadModal] = useState(false);

  function isLinkAvailable(key: LinkKey): boolean {
    return Boolean(profile[key]?.trim());
  }

  function toggleLink(key: LinkKey) {
    setDisabledLinks((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function getFilteredProfile(): Partial<GlobalProfile> {
    const base: Partial<GlobalProfile> = { ...profile };
    for (const { key } of LINK_KEYS) {
      if (disabledLinks.has(key)) {
        (base as Record<string, string>)[key] = "";
      }
    }
    if (!base.name?.trim() && user) {
      base.name = `${user.firstName} ${user.lastName}`.trim();
      base.email = base.email || user.email;
    }
    return base;
  }

  async function runGeneration(description: string) {
    setIsGenerating(true);
    const filteredProfile = getFilteredProfile();
    try {
      const res = await fetch("/api/generate-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription: description, profile: filteredProfile, template }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Generation failed");
      const data = json.resume as ResumeData;
      const latex = generateLatex(data);
      setResumeData(data);
      setLatexCode(latex);
      setActiveTab("resume");
      setSaveStatus("idle");
    } catch (err) {
      console.error("Resume generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleGenerate = useCallback((description: string) => { void runGeneration(description); }, [profile, template, disabledLinks]);

  function handleResumeExtracted(extracted: ResumeData) {
    const latex = generateLatex(extracted);
    setResumeData(extracted);
    setLatexCode(latex);
    setActiveTab("resume");
    setSaveStatus("idle");
  }

  const handleAIEdit = useCallback(
    async (instruction: string) => {
      if (!latexCode) return;
      setIsApplyingEdit(true);
      try {
        const res = await fetch("/api/ai-edit-latex", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ latex: latexCode, instruction }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Edit failed");
        setLatexCode(json.latex as string);
        setActiveTab("latex");
      } catch (err) {
        console.error("AI edit error:", err);
      } finally {
        setIsApplyingEdit(false);
      }
    },
    [latexCode]
  );

  function handleSave() {
    if (!resumeData || !latexCode) return;
    const name = companyName.trim() || "Untitled Company";
    const title = jobTitle.trim() || "Unknown Role";
    if (activeResumeId) {
      updateResume(activeResumeId, { resumeData, latexCode, companyName: name, jobTitle: title });
    } else {
      const id = addResume({ companyName: name, jobTitle: title, resumeData, latexCode });
      setActiveResume(id);
    }
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2000);
  }

  function handleLoadResume(saved: SavedResume) {
    setResumeData(saved.resumeData);
    setLatexCode(saved.latexCode);
    setCompanyName(saved.companyName);
    setJobTitle(saved.jobTitle);
    setActiveResume(saved.id);
    setActiveTab("resume");
    setSaveStatus("idle");
  }

  function handleNewResume() {
    setResumeData(null);
    setLatexCode("");
    setCompanyName("");
    setJobTitle("");
    setActiveResume(null);
    setSaveStatus("idle");
    setActiveTab("resume");
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "resume", label: "Resume", icon: <FileText size={14} /> },
    { id: "latex", label: "LaTeX", icon: <Code2 size={14} /> },
    { id: "preview", label: "Preview", icon: <Eye size={14} /> },
  ];

  const profileMissing = !profile.name?.trim();
  const templateMissing = template.experiences.length === 0;

  return (
    <div className="flex h-full overflow-hidden">
      {showUploadModal && (
        <ResumeUploadModal
          onExtracted={handleResumeExtracted}
          onClose={() => setShowUploadModal(false)}
        />
      )}

      <aside className="w-64 shrink-0 border-r border-border/30 flex flex-col bg-background overflow-hidden hidden md:flex">
        <div className="px-4 py-4 border-b border-border/30">
          <h2 className="text-xs uppercase tracking-widest text-foreground/50 font-medium mb-3">My Resumes</h2>
          <button
            onClick={handleNewResume}
            className="cursor-pointer w-full flex items-center gap-2 px-3 py-2 bg-accent/10 hover:bg-accent/20 text-accent text-sm font-medium rounded-lg transition-colors border border-accent/20"
          >
            <Plus size={14} />
            New Resume
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {savedResumes.length === 0 ? (
            <p className="text-xs text-foreground/30 text-center mt-6 px-2">No saved resumes yet. Generate one and save it here.</p>
          ) : (
            savedResumes.map((r) => (
              <div
                key={r.id}
                onClick={() => handleLoadResume(r)}
                className={`group relative rounded-lg p-3 cursor-pointer transition-colors border ${activeResumeId === r.id ? "bg-accent/10 border-accent/30 text-accent" : "bg-card border-border/30 hover:bg-card/80 text-foreground"}`}
              >
                <div className="flex items-start gap-2 pr-6">
                  <Building2 size={14} className="mt-0.5 shrink-0 opacity-70" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{r.companyName}</p>
                    <p className="text-xs opacity-60 truncate">{r.jobTitle}</p>
                    <p className="text-[10px] opacity-40 mt-0.5">{new Date(r.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteResume(r.id); if (activeResumeId === r.id) handleNewResume(); }}
                  className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 text-foreground/40 hover:text-red-400 transition-all rounded"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="shrink-0 px-5 py-3 border-b border-border/30 flex items-center gap-3 bg-background/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <FileText size={16} className="text-accent shrink-0" />
            <span className="font-semibold text-foreground text-sm">Resume Builder</span>
            <span className="text-xs border border-accent/30 bg-accent/10 text-accent px-1.5 py-0.5 rounded-md hidden sm:inline">AI Powered</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUploadModal(true)}
              className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-foreground/60 bg-card hover:bg-border/30 rounded-lg border border-border/50 transition-all"
            >
              <Upload size={12} />
              Import
            </button>
            <Link
              href="/profile"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-accent bg-accent/10 hover:bg-accent/20 rounded-lg border border-accent/20 transition-all"
            >
              {profile.name ? `Profile: ${profile.name.split(" ")[0]}` : "Set Up Profile"}
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {profileMissing && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-amber-500/30 bg-amber-500/8 text-amber-400 text-sm">
              <AlertCircle size={16} className="shrink-0" />
              <span className="flex-1">Your profile is not set up. AI will use placeholder details.</span>
              <Link href="/profile" className="text-xs font-medium underline underline-offset-2 hover:text-amber-300">Set Up Profile</Link>
            </div>
          )}
          {templateMissing && !profileMissing && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-blue-500/30 bg-blue-500/8 text-blue-400 text-sm">
              <Info size={16} className="shrink-0" />
              <span className="flex-1">No experience template configured. AI will use sample experience.</span>
              <Link href="/profile" className="text-xs font-medium underline underline-offset-2 hover:text-blue-300">Edit Template</Link>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground/50 mb-1.5">Company Name</label>
              <div className="relative">
                <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" />
                <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. Google" className="w-full pl-9 pr-3 py-2 bg-card border border-border/50 rounded-lg text-sm text-foreground placeholder:text-foreground/25 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground/50 mb-1.5">Job Title</label>
              <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Senior Software Engineer" className="w-full px-3 py-2 bg-card border border-border/50 rounded-lg text-sm text-foreground placeholder:text-foreground/25 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50" />
            </div>
          </div>

          <div className="rounded-xl border border-border/30 bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-foreground/60 uppercase tracking-widest">Online Profiles in Header</p>
              <Link href="/profile" className="text-xs text-accent hover:text-accent/80 transition-colors">Edit Profile</Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {LINK_KEYS.map(({ key, label }) => {
                const available = isLinkAvailable(key);
                const enabled = available && !disabledLinks.has(key);
                return (
                  <button
                    key={key}
                    disabled={!available}
                    onClick={() => available && toggleLink(key)}
                    title={!available ? `Add ${label} URL in Profile` : undefined}
                    className={`px-3 py-1 text-xs font-medium rounded-full border transition-all ${!available ? "opacity-30 cursor-not-allowed border-border/40 text-foreground/40 bg-transparent" : enabled ? "bg-accent/15 border-accent/30 text-accent" : "bg-transparent border-border/40 text-foreground/40 hover:border-accent/20"}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <JobDescriptionInput onGenerate={handleGenerate} isGenerating={isGenerating} />

          {resumeData && (
            <>
              <AIEditPanel onApply={handleAIEdit} isProcessing={isApplyingEdit} />
              <div className="flex items-center justify-between">
                <div className="flex gap-1 p-1 bg-card rounded-xl border border-border/30">
                  {tabs.map((tab) => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${activeTab === tab.id ? "bg-accent/15 text-accent" : "text-foreground/50 hover:text-foreground"}`}>
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleSave}
                  className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all ${saveStatus === "saved" ? "bg-green-500/15 text-green-400 border border-green-500/30" : "bg-accent/10 hover:bg-accent/20 text-accent border border-accent/20"}`}
                >
                  {saveStatus === "saved" ? <><Check size={14} /> Saved!</> : <><Save size={14} /> Save Resume</>}
                </button>
              </div>
              <div className="pb-8">
                {activeTab === "resume" && <ResumeDisplay resume={resumeData} />}
                {activeTab === "latex" && <LaTeXEditor value={latexCode} onChange={setLatexCode} />}
                {activeTab === "preview" && <Preview latex={latexCode} />}
              </div>
            </>
          )}

          {!resumeData && (
            <div className="text-center py-16 text-foreground/30">
              <FileText size={40} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm">Paste a job description above to generate your tailored resume</p>
              <p className="text-xs mt-1">Or import an existing resume to edit it</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}