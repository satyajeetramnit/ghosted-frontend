"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  FileText, Code2, Eye, Upload, Trash2, Plus, Building2, Save, Check, AlertCircle, Info, Sparkles, Loader2, BookOpen, Layers, Briefcase, Zap, Globe, ArrowRight, Settings2, ShieldCheck, ChevronRight
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useResumeStore } from "@/store/useResumeStore";
import { useProfileStore } from "@/store/useProfileStore";
import { useTemplateStore } from "@/store/useTemplateStore";
import { generateLatex } from "@/lib/latexGenerator";
import { ResumeData, GlobalProfile, SavedResume } from "@/types/resume";
import { format } from 'date-fns';

import JobDescriptionInput from "@/components/resume/JobDescriptionInput";
import ResumeDisplay from "@/components/resume/ResumeDisplay";
import LaTeXEditor from "@/components/resume/LaTeXEditor";
import AIEditPanel from "@/components/resume/AIEditPanel";
import Preview from "@/components/resume/Preview";
import ResumeUploadModal from "@/components/resume/ResumeUploadModal";
import { motion, AnimatePresence } from "framer-motion";

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
    { id: "resume", label: "Semantic View", icon: <FileText size={12} /> },
    { id: "latex", label: "Source Code", icon: <Code2 size={12} /> },
    { id: "preview", label: "Artifact PDF", icon: <Eye size={12} /> },
  ];

  const profileMissing = !profile.name?.trim();
  const templateMissing = template.experiences.length === 0;

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-transparent">
      {showUploadModal && (
        <ResumeUploadModal
          onExtracted={handleResumeExtracted}
          onClose={() => setShowUploadModal(false)}
        />
      )}

      {/* Library Sidebar */}
      <aside className="w-80 shrink-0 border-r border-border-muted flex flex-col bg-surface/30 backdrop-blur-md hidden xl:flex">
        <div className="p-8 space-y-6">
           <div className="space-y-1">
             <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">
               <Layers className="w-3.5 h-3.5" />
               <span>Artifact Library</span>
             </div>
             <h2 className="text-xl font-bold text-foreground font-outfit">Resume Forge</h2>
           </div>
           
           <button
             onClick={handleNewResume}
             className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-foreground text-background rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
           >
             <Plus className="w-4 h-4" />
             Forge New Artifact
           </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-10 space-y-4 custom-scrollbar">
          {savedResumes.length === 0 ? (
            <div className="py-20 text-center space-y-4 opacity-20">
               <BookOpen className="w-10 h-10 mx-auto" />
               <p className="text-[10px] font-bold uppercase tracking-[0.2em]">No artifacts stored.</p>
            </div>
          ) : (
            savedResumes.map((r) => (
              <motion.div
                key={r.id}
                layout
                onClick={() => handleLoadResume(r)}
                className={`group relative rounded-[1.8rem] p-5 cursor-pointer transition-all duration-500 border ${activeResumeId === r.id ? "bg-background border-border shadow-lg" : "bg-surface/50 border-border-muted hover:border-border hover:bg-surface"}`}
              >
                <div className="flex items-start gap-4 pr-6">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${activeResumeId === r.id ? "bg-foreground text-background" : "bg-background border border-border-muted text-muted-foreground/30 group-hover:text-foreground"}`}>
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-bold text-foreground font-outfit truncate">{r.companyName}</p>
                    <p className="text-[11px] font-medium text-muted-foreground/60 truncate tracking-tight">{r.jobTitle}</p>
                    <p className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-widest pt-2">{format(new Date(r.updatedAt), 'MMM d, yyyy')}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteResume(r.id); if (activeResumeId === r.id) handleNewResume(); }}
                  className="absolute top-4 right-4 p-2 opacity-0 group-hover:opacity-100 text-muted-foreground/20 hover:text-red-500 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))
          )}
        </div>
      </aside>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="shrink-0 px-10 py-6 flex items-center justify-between bg-transparent z-20">
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-foreground text-background flex items-center justify-center">
                 <Zap className="w-5 h-5" />
               </div>
               <div>
                  <h1 className="text-xl font-bold text-foreground font-outfit tracking-tight">Intelligence Forge</h1>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                    <span>Targeting</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-foreground/60">{companyName || 'Undefined Entity'}</span>
                  </div>
               </div>
             </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-surface border border-border-muted rounded-full text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 hover:text-foreground hover:border-border transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              Ingest Data
            </button>
            <Link
              href="/profile"
              className="flex items-center gap-2 px-5 py-2.5 bg-foreground text-background rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              <Settings2 className="w-3.5 h-3.5" />
              Configure Core
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-10 pb-20 space-y-8 custom-scrollbar relative z-10">
          <AnimatePresence>
            {profileMissing && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="overflow-hidden">
                <div className="flex items-center gap-4 p-5 rounded-[1.5rem] border border-amber-500/20 bg-amber-500/5 text-amber-500/80 text-xs font-medium">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span className="flex-1">Semantic profile incomplete. Forge will utilize generic intelligence.</span>
                  <Link href="/profile" className="px-4 py-1.5 bg-amber-500/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-amber-500/20 transition-all">Setup</Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] ml-2">Target Enterprise</label>
              <div className="relative group">
                <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30 group-focus-within:text-foreground transition-colors" />
                <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. Anthropic, Neuralink..." className="w-full pl-12 pr-6 py-4 bg-surface/50 border border-border-muted rounded-2xl text-sm font-bold text-foreground placeholder:text-muted-foreground/20 focus:outline-none focus:ring-1 focus:ring-foreground/10 transition-all" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] ml-2">Objective Role</label>
              <div className="relative group">
                <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30 group-focus-within:text-foreground transition-colors" />
                <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Systems Architect" className="w-full pl-12 pr-6 py-4 bg-surface/50 border border-border-muted rounded-2xl text-sm font-bold text-foreground placeholder:text-muted-foreground/20 focus:outline-none focus:ring-1 focus:ring-foreground/10 transition-all" />
              </div>
            </div>
          </div>

          {/* Social Injectors */}
          <div className="bg-surface/30 border border-border-muted rounded-[2rem] p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground/40" />
                <h3 className="text-[11px] font-black text-foreground/60 uppercase tracking-[0.2em]">Digital Signal Injection</h3>
              </div>
              <p className="text-[10px] font-medium text-muted-foreground/40 italic">Active signals will be compiled into the artifact header.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {LINK_KEYS.map(({ key, label }) => {
                const available = isLinkAvailable(key);
                const enabled = available && !disabledLinks.has(key);
                return (
                  <button
                    key={key}
                    disabled={!available}
                    onClick={() => available && toggleLink(key)}
                    className={`px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-full border transition-all ${!available ? "opacity-10 grayscale border-border-muted bg-transparent" : enabled ? "bg-foreground text-background border-foreground shadow-lg" : "bg-surface/50 border-border-muted text-muted-foreground/40 hover:border-border hover:text-foreground"}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Job Description Input Overhaul happens in its component, but we style its placement */}
          <div className="relative group">
             <JobDescriptionInput onGenerate={handleGenerate} isGenerating={isGenerating} />
          </div>

          <AnimatePresence>
            {resumeData && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <AIEditPanel onApply={handleAIEdit} isProcessing={isApplyingEdit} />
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-surface/50 p-4 rounded-[2rem] border border-border-muted">
                  <div className="flex gap-2 p-1.5 bg-background rounded-[1.5rem] border border-border-muted shadow-inner">
                    {tabs.map((tab) => (
                      <button 
                        key={tab.id} 
                        onClick={() => setActiveTab(tab.id)} 
                        className={`flex items-center gap-2 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${activeTab === tab.id ? "bg-foreground text-background shadow-md" : "text-muted-foreground/40 hover:text-foreground"}`}
                      >
                        {tab.icon}
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={handleSave}
                    className={`flex items-center gap-3 px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${saveStatus === "saved" ? "bg-green-500 text-white shadow-lg shadow-green-500/20" : "bg-foreground text-background shadow-xl hover:scale-105 active:scale-95"}`}
                  >
                    {saveStatus === "saved" ? <><Check className="w-4 h-4" /> Artifact Compiled</> : <><Save className="w-4 h-4" /> Commit to Library</>}
                  </button>
                </div>

                <div className="pb-20 relative min-h-[600px]">
                  {activeTab === "resume" && <ResumeDisplay resume={resumeData} />}
                  {activeTab === "latex" && <LaTeXEditor value={latexCode} onChange={setLatexCode} />}
                  {activeTab === "preview" && <Preview latex={latexCode} />}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!resumeData && !isGenerating && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 space-y-6">
              <div className="w-24 h-24 rounded-[2.5rem] bg-surface border border-border-muted flex items-center justify-center mx-auto text-muted-foreground/10 group-hover:scale-110 transition-transform">
                <FileText className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <p className="text-[11px] font-black text-foreground/40 uppercase tracking-[0.3em]">System Standby</p>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto font-medium">Input target intelligence (Job Description) to initialize artifact synthesis.</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}