"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Settings, Bell, Shield, Palette, User, Globe, ArrowRight, 
  Check, Sparkles, Layout, Brain, EyeOff, Mail, Zap, Monitor
} from "lucide-react";
import { useProfile, useSaveProfile } from "@/hooks/useProfile";
import toast from "react-hot-toast";

interface UserPreferences {
  board: {
    defaultView: 'kanban' | 'list';
    hideRejected: boolean;
  };
  ai: {
    autoSummarize: boolean;
    tone: 'formal' | 'casual' | 'innovative';
  };
  notifications: {
    emailAlerts: boolean;
  };
}

const DEFAULT_PREFERENCES: UserPreferences = {
  board: {
    defaultView: 'kanban',
    hideRejected: false,
  },
  ai: {
    autoSummarize: true,
    tone: 'formal',
  },
  notifications: {
    emailAlerts: true,
  },
};

export default function SettingsPage() {
  const { data: profile, isLoading } = useProfile();
  const { mutate: saveProfile, isPending: isSaving } = useSaveProfile();
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (profile?.preferencesJson) {
      try {
        const parsed = JSON.parse(profile.preferencesJson);
        setPrefs({ ...DEFAULT_PREFERENCES, ...parsed });
      } catch (e) {
        console.error("Failed to parse preferences", e);
      }
    }
  }, [profile]);

  const updatePref = (category: keyof UserPreferences, key: string, value: any) => {
    setPrefs(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    saveProfile({
      ...profile,
      preferencesJson: JSON.stringify(prefs)
    }, {
      onSuccess: () => {
        setHasChanges(false);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden relative">
      <header className="pt-10 pb-6 px-10 flex flex-col gap-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-foreground font-outfit">Preferences</h1>
            <p className="text-muted-foreground font-medium text-sm">Configure your intelligence workspace parameters.</p>
          </div>
          
          <AnimatePresence>
            {hasChanges && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2.5 bg-foreground text-background px-8 py-3.5 rounded-[1.5rem] text-sm font-bold transition-all shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-background/20 border-t-background rounded-full animate-spin" />
                ) : (
                  <Check className="w-4 h-4 stroke-[3]" />
                )}
                <span>Save Transformations</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-10 pt-2 space-y-12 pb-32">
        {/* Board Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground/60 font-inter">Visualization Control</h3>
            <div className="h-px flex-1 bg-border-muted" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PreferenceCard
              icon={<Layout className="w-4 h-4" />}
              title="Default Layout"
              description="Primary interface for application tracking"
            >
              <div className="flex bg-surface p-1 rounded-xl border border-border-muted">
                {['kanban', 'list'].map((view) => (
                  <button
                    key={view}
                    onClick={() => updatePref('board', 'defaultView', view)}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                      prefs.board.defaultView === view 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground/60 hover:text-muted-foreground'
                    }`}
                  >
                    {view}
                  </button>
                ))}
              </div>
            </PreferenceCard>

            <PreferenceCard
              icon={<EyeOff className="w-4 h-4" />}
              title="Signal Filtering"
              description="Automatically hide negative results (Rejected)"
            >
              <Toggle 
                enabled={prefs.board.hideRejected} 
                onChange={(val) => updatePref('board', 'hideRejected', val)} 
              />
            </PreferenceCard>
          </div>
        </section>

        {/* AI Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground/60 font-inter">Cognitive Intelligence</h3>
            <div className="h-px flex-1 bg-border-muted" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PreferenceCard
              icon={<Brain className="w-4 h-4" />}
              title="Semantic Enrichment"
              description="Automatically generate AI notes for applications"
            >
              <Toggle 
                enabled={prefs.ai.autoSummarize} 
                onChange={(val) => updatePref('ai', 'autoSummarize', val)} 
              />
            </PreferenceCard>

            <PreferenceCard
              icon={<Zap className="w-4 h-4" />}
              title="Intelligence Tone"
              description="Desired semantic style for AI outputs"
            >
              <div className="grid grid-cols-3 gap-2 w-full">
                {['formal', 'casual', 'innovative'].map((tone) => (
                  <button
                    key={tone}
                    onClick={() => updatePref('ai', 'tone', tone)}
                    className={`py-2 px-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${
                      prefs.ai.tone === tone 
                        ? 'bg-foreground/5 border-foreground text-foreground' 
                        : 'border-border-muted text-muted-foreground/60 hover:border-border hover:text-muted-foreground'
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </PreferenceCard>
          </div>
        </section>

        {/* System & Alerts */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground/60 font-inter">Signal Alerts</h3>
            <div className="h-px flex-1 bg-border-muted" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PreferenceCard
              icon={<Mail className="w-4 h-4" />}
              title="Email Synchronization"
              description="Weekly activity digest and deadline alerts"
            >
              <Toggle 
                enabled={prefs.notifications.emailAlerts} 
                onChange={(val) => updatePref('notifications', 'emailAlerts', val)} 
              />
            </PreferenceCard>

            <div className="bg-surface/50 border border-border-muted rounded-[2.5rem] p-8 flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-foreground">System Integrity</h3>
                <p className="text-[11px] text-muted-foreground/90">Engine v1.0.4 is operating at maximum efficiency.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/80">Active</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function PreferenceCard({ icon, title, description, children }: { icon: React.ReactNode, title: string, description: string, children: React.ReactNode }) {
  return (
    <div className="bg-surface/50 border border-border-muted rounded-[2rem] p-6 flex items-center justify-between group hover:border-border transition-all">
      <div className="flex items-center gap-5">
        <div className="w-12 h-12 rounded-2xl bg-background border border-border-muted flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-all">
          {icon}
        </div>
        <div className="space-y-0.5">
          <p className="text-sm font-bold text-foreground">{title}</p>
          <p className="text-[11px] text-muted-foreground/90 font-medium">{description}</p>
        </div>
      </div>
      <div className="w-32 shrink-0 flex justify-end">
        {children}
      </div>
    </div>
  );
}

function Toggle({ enabled, onChange }: { enabled: boolean, onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`w-12 h-6 rounded-full transition-all relative p-1 ${
        enabled ? 'bg-foreground' : 'bg-muted-foreground/20'
      }`}
    >
      <div className={`w-4 h-4 rounded-full bg-background transition-all transform ${
        enabled ? 'translate-x-6' : 'translate-x-0'
      }`} />
    </button>
  );
}
