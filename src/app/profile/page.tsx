"use client";

import { useState } from "react";
import { User, FileText, Settings2, Fingerprint, Layers, Sparkles } from "lucide-react";
import ProfileForm from "@/components/profile/ProfileForm";
import ResumeTemplateEditor from "@/components/profile/ResumeTemplateEditor";
import { motion, AnimatePresence } from "framer-motion";

type Tab = "profile" | "template";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  return (
    <div className="flex-1 overflow-y-auto p-10 custom-scrollbar relative z-10">
      <header className="mb-12 space-y-2">
        <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground/80 uppercase tracking-[0.2em] mb-2">
          <Fingerprint className="w-4 h-4" />
          <span>Core Identity</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground font-outfit">Profile Configuration</h1>
        <p className="text-muted-foreground font-medium max-w-2xl leading-relaxed">
          Define your professional semantic identity. These parameters serve as the foundation for all AI-generated artifacts and strategic alignments.
        </p>
      </header>

      {/* Tab Switcher Overhaul */}
      <div className="flex items-center gap-2 p-1.5 bg-surface/50 rounded-[2rem] border border-border-muted w-fit mb-12 shadow-inner">
        {(
          [
            { id: "profile" as Tab, label: "Core Profile", icon: <User size={12} /> },
            { id: "template" as Tab, label: "Experience", icon: <FileText size={12} /> },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2.5 px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${
              activeTab === tab.id
                ? "bg-foreground text-background shadow-lg"
                : "text-muted-foreground/80 hover:text-foreground"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <motion.div 
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="pb-20"
      >
        <div className="bg-surface/50 rounded-[2.5rem] border border-border-muted p-10 relative overflow-hidden">
           {/* Subtle Glow */}
           <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
           
           <div className="relative z-10">
             {activeTab === "profile" ? <ProfileForm /> : <ResumeTemplateEditor />}
           </div>
        </div>
      </motion.div>
    </div>
  );
}
