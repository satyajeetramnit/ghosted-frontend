"use client";

import { useState } from "react";
import { User, FileText } from "lucide-react";
import ProfileForm from "@/components/profile/ProfileForm";
import ResumeTemplateEditor from "@/components/profile/ResumeTemplateEditor";

type Tab = "profile" | "template";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">Profile &amp; Resume Template</h1>
        <p className="text-sm text-foreground/50 mt-1">
          Your profile info is pre-filled into every resume. The template defines your real
          experience — AI generates tailored content around it.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-card rounded-xl border border-border/30 w-fit mb-6">
        {(
          [
            { id: "profile" as Tab, label: "Personal Info", icon: <User size={14} /> },
            { id: "template" as Tab, label: "Resume Template", icon: <FileText size={14} /> },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === tab.id
                ? "bg-accent/15 text-accent"
                : "text-foreground/50 hover:text-foreground"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "profile" ? <ProfileForm /> : <ResumeTemplateEditor />}
    </div>
  );
}
