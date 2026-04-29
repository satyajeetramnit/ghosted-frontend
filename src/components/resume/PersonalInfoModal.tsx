"use client";

import { useState } from "react";
import { X, User, Mail, Phone, MapPin, ExternalLink, GitBranch, Code2, Globe } from "lucide-react";
import { PersonalInfo } from "@/types/resume";

interface Props {
  onConfirm: (info: PersonalInfo) => void;
  onSkip: () => void;
  /** Pre-populated values from the user's auth profile */
  prefill?: Partial<PersonalInfo>;
}

function emptyInfo(prefill?: Partial<PersonalInfo>): PersonalInfo {
  return {
    name: prefill?.name ?? "",
    email: prefill?.email ?? "",
    phone: prefill?.phone ?? "",
    location: prefill?.location ?? "",
    linkedin: prefill?.linkedin ?? "",
    github: prefill?.github ?? "",
    portfolio: prefill?.portfolio ?? "",
    leetcode: prefill?.leetcode ?? "",
    hackerrank: prefill?.hackerrank ?? "",
    currentTitle: prefill?.currentTitle ?? "",
    yearsExp: prefill?.yearsExp ?? "",
    existingSummary: prefill?.existingSummary ?? "",
  };
}

interface FieldProps {
  label: string;
  required?: boolean;
  icon: React.ReactNode;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}

function Field({ label, required, icon, type = "text", placeholder, value, onChange, error }: FieldProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-foreground/60 mb-1">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/70">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-3 py-2 bg-background border border-border/50 rounded-lg text-sm text-foreground placeholder:text-foreground/25 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50"
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

export default function PersonalInfoModal({ onConfirm, onSkip, prefill }: Props) {
  const [info, setInfo] = useState<PersonalInfo>(() => emptyInfo(prefill));
  const [errors, setErrors] = useState<Partial<Record<keyof PersonalInfo, string>>>({});

  function set(field: keyof PersonalInfo) {
    return (value: string) => setInfo((prev) => ({ ...prev, [field]: value }));
  }

  function validate(): boolean {
    const newErrors: Partial<Record<keyof PersonalInfo, string>> = {};
    if (!info.name.trim()) newErrors.name = "Name is required";
    if (!info.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email))
      newErrors.email = "Enter a valid email";
    if (!info.phone.trim()) newErrors.phone = "Phone is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleConfirm() {
    if (validate()) onConfirm(info);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card rounded-2xl border border-border/50 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/30 sticky top-0 bg-card rounded-t-2xl z-10">
          <div>
            <h2 className="text-base font-semibold text-foreground">Your Profile</h2>
            <p className="text-xs text-foreground/80 mt-0.5">
              This info will be pre-filled into your generated resume
            </p>
          </div>
          <button
            onClick={onSkip}
            className="p-1.5 rounded-lg hover:bg-border/30 text-foreground/80 hover:text-foreground/70 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Contact Info */}
          <section>
            <h3 className="text-[10px] uppercase tracking-widest text-accent font-medium mb-3">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Field label="Full Name" required icon={<User size={13} />}
                  placeholder="Alex Johnson" value={info.name} onChange={set("name")} error={errors.name} />
              </div>
              <Field label="Email" required icon={<Mail size={13} />} type="email"
                placeholder="you@email.com" value={info.email} onChange={set("email")} error={errors.email} />
              <Field label="Phone" required icon={<Phone size={13} />}
                placeholder="+1 555 234 5678" value={info.phone} onChange={set("phone")} error={errors.phone} />
              <div className="sm:col-span-2">
                <Field label="Location" icon={<MapPin size={13} />}
                  placeholder="Bengaluru, India" value={info.location} onChange={set("location")} />
              </div>
            </div>
          </section>

          {/* Online Profiles */}
          <section>
            <h3 className="text-[10px] uppercase tracking-widest text-accent font-medium mb-3">
              Online Profiles
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="LinkedIn URL" icon={<ExternalLink size={13} />}
                placeholder="linkedin.com/in/username" value={info.linkedin} onChange={set("linkedin")} />
              <Field label="GitHub URL" icon={<GitBranch size={13} />}
                placeholder="github.com/username" value={info.github} onChange={set("github")} />
              <Field label="Portfolio URL" icon={<Globe size={13} />}
                placeholder="yoursite.pages.dev" value={info.portfolio} onChange={set("portfolio")} />
              <Field label="LeetCode URL" icon={<Code2 size={13} />}
                placeholder="leetcode.com/username" value={info.leetcode} onChange={set("leetcode")} />
              <Field label="HackerRank URL" icon={<Code2 size={13} />}
                placeholder="hackerrank.com/username" value={info.hackerrank} onChange={set("hackerrank")} />
            </div>
          </section>

          {/* Background */}
          <section>
            <h3 className="text-[10px] uppercase tracking-widest text-accent font-medium mb-3">
              Your Background
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <Field label="Current / Target Title" icon={<User size={13} />}
                placeholder="Senior Software Engineer" value={info.currentTitle} onChange={set("currentTitle")} />
              <Field label="Years of Experience" icon={<User size={13} />}
                placeholder="3+" value={info.yearsExp} onChange={set("yearsExp")} />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground/60 mb-1">
                Existing Summary{" "}
                <span className="text-foreground/70 font-normal">(optional — AI will enhance it)</span>
              </label>
              <textarea
                rows={4}
                value={info.existingSummary}
                onChange={(e) => set("existingSummary")(e.target.value)}
                placeholder="Paste your current summary or key skills. Leave blank to let AI generate one from the job description."
                className="w-full px-3 py-2 bg-background border border-border/50 rounded-lg text-sm text-foreground placeholder:text-foreground/25 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 resize-y"
              />
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border/30 flex flex-col sm:flex-row gap-3 sticky bottom-0 bg-card rounded-b-2xl">
          <button
            onClick={onSkip}
            className="cursor-pointer flex-1 py-2.5 border border-border/50 text-foreground/60 text-sm font-medium rounded-lg hover:bg-border/20 transition-colors"
          >
            Skip - Use AI Defaults
          </button>
          <button
            onClick={handleConfirm}
            className="cursor-pointer flex-1 py-2.5 bg-accent hover:bg-accent/90 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all"
          >
            Save &amp; Generate Resume
          </button>
        </div>
      </div>
    </div>
  );
}
