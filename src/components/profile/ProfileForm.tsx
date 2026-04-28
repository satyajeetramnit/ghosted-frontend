"use client";

import { useState, useEffect } from "react";
import {
  User, Mail, Phone, MapPin, ExternalLink, GitBranch, Code2, Globe, Check,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useProfileStore, EMPTY_PROFILE } from "@/store/useProfileStore";
import { GlobalProfile } from "@/types/resume";

function Field({
  label, icon, type = "text", placeholder, value, onChange,
}: {
  label: string; icon: React.ReactNode; type?: string;
  placeholder?: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-foreground/60 mb-1.5">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30">{icon}</span>
        <input
          type={type}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-3 py-2 bg-background border border-border/50 rounded-lg text-sm text-foreground placeholder:text-foreground/25 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50"
        />
      </div>
    </div>
  );
}

export default function ProfileForm() {
  const { user } = useAuth();
  const { profile, setProfile } = useProfileStore();
  const [form, setForm] = useState<GlobalProfile>({ ...EMPTY_PROFILE, ...profile });
  const [saved, setSaved] = useState(false);

  // Pre-fill from auth if profile is empty
  useEffect(() => {
    if (!profile.name && user) {
      setForm((prev) => ({
        ...EMPTY_PROFILE,
        ...prev,
        name: `${user.firstName} ${user.lastName}`.trim(),
        email: prev.email || user.email,
      }));
    }
  }, [user, profile.name]);

  function set(field: keyof GlobalProfile) {
    return (value: string) => setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSave() {
    setProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Contact */}
      <div className="bg-card rounded-xl border border-border/50 p-5 space-y-4">
        <h3 className="text-xs uppercase tracking-widest text-accent font-medium">Contact Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Field label="Full Name" icon={<User size={13} />} placeholder="Alex Johnson"
              value={form.name} onChange={set("name")} />
          </div>
          <Field label="Email" icon={<Mail size={13} />} type="email" placeholder="you@email.com"
            value={form.email} onChange={set("email")} />
          <Field label="Phone" icon={<Phone size={13} />} placeholder="+1 555 234 5678"
            value={form.phone} onChange={set("phone")} />
          <div className="sm:col-span-2">
            <Field label="Location" icon={<MapPin size={13} />} placeholder="Bengaluru, India"
              value={form.location} onChange={set("location")} />
          </div>
        </div>
      </div>

      {/* Online Profiles */}
      <div className="bg-card rounded-xl border border-border/50 p-5 space-y-4">
        <h3 className="text-xs uppercase tracking-widest text-accent font-medium">Online Profiles</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="LinkedIn URL" icon={<ExternalLink size={13} />}
            placeholder="linkedin.com/in/username" value={form.linkedin} onChange={set("linkedin")} />
          <Field label="GitHub URL" icon={<GitBranch size={13} />}
            placeholder="github.com/username" value={form.github} onChange={set("github")} />
          <Field label="Portfolio URL" icon={<Globe size={13} />}
            placeholder="yoursite.pages.dev" value={form.portfolio} onChange={set("portfolio")} />
          <Field label="LeetCode URL" icon={<Code2 size={13} />}
            placeholder="leetcode.com/username" value={form.leetcode} onChange={set("leetcode")} />
          <Field label="HackerRank URL" icon={<Code2 size={13} />}
            placeholder="hackerrank.com/username" value={form.hackerrank} onChange={set("hackerrank")} />
        </div>
      </div>

      {/* Background */}
      <div className="bg-card rounded-xl border border-border/50 p-5 space-y-4">
        <h3 className="text-xs uppercase tracking-widest text-accent font-medium">Background</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Current / Target Title" icon={<User size={13} />}
            placeholder="Senior Software Engineer" value={form.currentTitle} onChange={set("currentTitle")} />
          <Field label="Years of Experience" icon={<User size={13} />}
            placeholder="3+" value={form.yearsExp} onChange={set("yearsExp")} />
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground/60 mb-1.5">
            Existing Summary{" "}
            <span className="text-foreground/30 font-normal">(optional — AI will enhance it)</span>
          </label>
          <textarea
            rows={4}
            value={form.existingSummary}
            onChange={(e) => set("existingSummary")(e.target.value)}
            placeholder="Paste your current summary or key skills. Leave blank to let AI generate one from the job description."
            className="w-full px-3 py-2 bg-background border border-border/50 rounded-lg text-sm text-foreground placeholder:text-foreground/25 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 resize-y"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        className={`flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${
          saved
            ? "bg-green-500/15 text-green-400 border border-green-500/30"
            : "bg-accent hover:bg-accent/90 text-white"
        }`}
      >
        {saved ? <><Check size={14} /> Profile Saved!</> : "Save Profile"}
      </button>
    </div>
  );
}
