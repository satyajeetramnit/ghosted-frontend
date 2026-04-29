"use client";

import { motion } from "framer-motion";
import { Settings, Bell, Shield, Palette, User, Globe, ArrowRight } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex-1 p-10 space-y-12 overflow-y-auto custom-scrollbar relative z-10">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-foreground font-outfit">Settings</h1>
        <p className="text-muted-foreground font-medium">Configure your intelligence workspace.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <SettingsGroup 
          title="Account" 
          icon={<User className="w-4 h-4" />}
          items={[
            { label: "Profile Information", description: "Update your personal details and avatar", icon: <User /> },
            { label: "Security", description: "Manage passwords and authentication", icon: <Shield /> },
          ]}
        />
        
        <SettingsGroup 
          title="Workspace" 
          icon={<Globe className="w-4 h-4" />}
          items={[
            { label: "General", description: "Default board views and tracking rules", icon: <Settings /> },
            { label: "Appearance", description: "Customize your theme and aesthetics", icon: <Palette /> },
          ]}
        />

        <SettingsGroup 
          title="Notifications" 
          icon={<Bell className="w-4 h-4" />}
          items={[
            { label: "Email Alerts", description: "Follow-up reminders and status updates", icon: <Bell /> },
            { label: "Push Notifications", description: "Browser-level real-time alerts", icon: <Globe /> },
          ]}
        />
      </div>

      {/* Innovation: System Health */}
      <div className="bg-surface/50 border border-border-muted rounded-[2.5rem] p-8 flex items-center justify-between group hover:border-border transition-all">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-foreground">System Health</h3>
          <p className="text-xs text-muted-foreground/60">Ghosted Intelligence Engine v1.0.4 is running optimally.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Synchronized</span>
        </div>
      </div>
    </div>
  );
}

function SettingsGroup({ title, icon, items }: { title: string, icon: React.ReactNode, items: { label: string, description: string, icon: React.ReactNode }[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 px-2">
        <div className="text-muted-foreground/40">{icon}</div>
        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground/60">{title}</h3>
      </div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <button key={i} className="w-full text-left bg-surface/50 border border-border-muted rounded-[1.5rem] p-5 flex items-center justify-between group hover:bg-surface hover:border-border transition-all">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-background border border-border-muted flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-all">
                {item.icon}
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{item.label}</p>
                <p className="text-[11px] text-muted-foreground/60 mt-0.5">{item.description}</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground/20 group-hover:text-foreground transition-all translate-x-[-10px] opacity-0 group-hover:translate-x-0 group-hover:opacity-100" />
          </button>
        ))}
      </div>
    </div>
  );
}
