"use client";

import { useState, useEffect } from "react";
import {
  User, Mail, Phone, MapPin, ExternalLink, GitBranch, Code2, Globe, Check, Sparkles, UserCircle2, ShieldCheck, Zap
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useProfileStore, EMPTY_PROFILE } from "@/store/useProfileStore";
import { useProfile, useSaveProfile } from "@/hooks/useProfile";
import { GlobalProfile } from "@/types/resume";

function Field({
  label, icon, type = "text", placeholder, value, onChange,
}: {
  label: string; icon: React.ReactNode; type?: string;
  placeholder?: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-black text-muted-foreground/80 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative group">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/70 group-focus-within:text-foreground transition-colors">{icon}</span>
        <input
          type={type}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-11 pr-4 py-3 bg-background border border-border-muted rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground/90 focus:outline-none focus:ring-1 focus:ring-foreground/10 transition-all"
        />
      </div>
    </div>
  );
}

export default function ProfileForm() {
  const { user } = useAuth();
  const { profile: localProfile, setProfile: setLocalProfile } = useProfileStore();
  const { data: remoteProfile, isLoading } = useProfile();
  const { mutate: saveProfileToDb, isPending: isSaving } = useSaveProfile();
  const [form, setForm] = useState<GlobalProfile>({ ...EMPTY_PROFILE });
  const [saved, setSaved] = useState(false);

  // Bootstrap form from backend (preferred) or localStorage fallback
  useEffect(() => {
    if (remoteProfile && (remoteProfile.name || remoteProfile.email)) {
      const merged: GlobalProfile = {
        name: remoteProfile.name || localProfile.name || "",
        email: remoteProfile.email || localProfile.email || (user?.email ?? ""),
        phone: remoteProfile.phone || localProfile.phone || "",
        location: remoteProfile.location || localProfile.location || "",
        linkedin: remoteProfile.linkedin || localProfile.linkedin || "",
        github: remoteProfile.github || localProfile.github || "",
        portfolio: remoteProfile.portfolio || localProfile.portfolio || "",
        leetcode: remoteProfile.leetcode || localProfile.leetcode || "",
        hackerrank: remoteProfile.hackerrank || localProfile.hackerrank || "",
        currentTitle: remoteProfile.currentTitle || localProfile.currentTitle || "",
        yearsExp: remoteProfile.yearsExp || localProfile.yearsExp || "",
        existingSummary: remoteProfile.existingSummary || localProfile.existingSummary || "",
      };
      setForm(merged);
    } else if (!isLoading && user && !form.name) {
      setForm((prev) => ({
        ...EMPTY_PROFILE,
        ...localProfile,
        name: prev.name || `${user.firstName} ${user.lastName}`.trim(),
        email: prev.email || user.email,
      }));
    }
  }, [remoteProfile, isLoading]);

  function set(field: keyof GlobalProfile) {
    return (value: string) => setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSave() {
    // Save to localStorage (instant)
    setLocalProfile(form);
    // Save to backend (persisted)
    saveProfileToDb({ ...form }, {
      onSuccess: () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      },
    });
  }

  return (
    <div className="max-w-3xl space-y-12">
      {/* Contact Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground/80 font-inter">Contact Information</h3>
          <div className="h-px flex-1 bg-border-muted" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Field label="Full Name" icon={<UserCircle2 size={14} />} placeholder="Alex Johnson"
              value={form.name} onChange={set("name")} />
          </div>
          <Field label="Email Address" icon={<Mail size={14} />} type="email" placeholder="you@email.com"
            value={form.email} onChange={set("email")} />
          <Field label="Phone Number" icon={<Phone size={14} />} placeholder="+1 555 234 5678"
            value={form.phone} onChange={set("phone")} />
          <div className="md:col-span-2">
            <Field label="Location" icon={<MapPin size={14} />} placeholder="Bengaluru, India"
              value={form.location} onChange={set("location")} />
          </div>
        </div>
      </section>

      {/* Online Links Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground/80 font-inter">Online Profiles</h3>
          <div className="h-px flex-1 bg-border-muted" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="LinkedIn Profile" icon={<ExternalLink size={14} />}
            placeholder="linkedin.com/in/username" value={form.linkedin} onChange={set("linkedin")} />
          <Field label="GitHub Profile" icon={<GitBranch size={14} />}
            placeholder="github.com/username" value={form.github} onChange={set("github")} />
          <Field label="Portfolio / Website" icon={<Globe size={14} />}
            placeholder="yoursite.pages.dev" value={form.portfolio} onChange={set("portfolio")} />
          <Field label="LeetCode Profile" icon={<Code2 size={14} />}
            placeholder="leetcode.com/username" value={form.leetcode} onChange={set("leetcode")} />
        </div>
      </section>

      {/* Professional Background Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground/80 font-inter">Professional Background</h3>
          <div className="h-px flex-1 bg-border-muted" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Current / Target Job Title" icon={<Zap size={14} />}
            placeholder="Senior Software Engineer" value={form.currentTitle} onChange={set("currentTitle")} />
          <Field label="Years of Experience" icon={<ShieldCheck size={14} />}
            placeholder="3+" value={form.yearsExp} onChange={set("yearsExp")} />
        </div>
        <div className="space-y-2">
          <label className="block text-[10px] font-black text-muted-foreground/80 uppercase tracking-widest ml-1">
            Professional Summary
          </label>
          <textarea
            rows={5}
            value={form.existingSummary}
            onChange={(e) => set("existingSummary")(e.target.value)}
            placeholder="Write a brief professional summary. The AI will use this as context when generating your resume."
            className="w-full px-5 py-4 bg-background border border-border-muted rounded-2xl text-sm font-medium text-foreground placeholder:text-muted-foreground/90 focus:outline-none focus:ring-1 focus:ring-foreground/10 transition-all resize-none leading-relaxed"
          />
        </div>
      </section>

      <div className="pt-6 border-t border-border-muted">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`flex items-center gap-3 px-10 py-4 rounded-full text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-xl hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${
            saved
              ? "bg-green-500 text-white shadow-green-500/20"
              : "bg-foreground text-background"
          }`}
        >
          {saved ? <><Check size={14} /> Saved!</> : isSaving ? <><Sparkles size={14} /> Saving...</> : <><Sparkles size={14} /> Save Profile</>}
        </button>
      </div>
    </div>
  );
}
