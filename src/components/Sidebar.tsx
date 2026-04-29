'use client';

import { LayoutDashboard, Users, Calendar, FileText, Ghost, LogOut, Settings, ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const initials = `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase() || "U";

  return (
    <aside className="w-72 h-full bg-background border-r border-border p-6 flex flex-col hidden md:flex shrink-0 relative z-20">
      {/* Logo Section */}
      <div className="mb-10 px-2">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white overflow-hidden relative shadow-sm transition-transform group-hover:scale-105">
            <Ghost className="w-6 h-6 relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-foreground">Ghosted</span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/90 leading-none">Intelligence</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 space-y-8">
        <div>
          <h3 className="px-4 text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-[0.2em] mb-4">Core</h3>
          <nav className="space-y-1.5">
            <NavItem href="/" icon={<LayoutDashboard />} label="Dashboard" active={pathname === "/"} />
            <NavItem href="/contacts" icon={<Users />} label="Contacts" active={pathname === "/contacts"} />
            <NavItem href="/interviews" icon={<Calendar />} label="Interviews" active={pathname === "/interviews"} />
          </nav>
        </div>

        <div>
          <h3 className="px-4 text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-[0.2em] mb-4">Tools</h3>
          <nav className="space-y-1.5">
            <NavItem href="/resume-builder" icon={<FileText />} label="Resume Builder" active={pathname === "/resume-builder"} />
            <NavItem href="/settings" icon={<Settings />} label="Preferences" active={pathname === "/settings"} />
          </nav>
        </div>
      </div>
      
      {/* Profile & Footer */}
      <div className="mt-auto pt-6 border-t border-border-muted space-y-4">
        <Link
          href="/profile"
          className="flex items-center gap-3 p-2 rounded-2xl hover:bg-surface transition-all group border border-transparent hover:border-border-muted"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-foreground font-semibold border border-border group-hover:border-accent/20 transition-colors">
              {initials}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm text-foreground truncate">{user.firstName} {user.lastName}</div>
            <div className="text-[11px] text-muted-foreground truncate group-hover:text-foreground/70 transition-colors">View Workspace</div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground/70 group-hover:text-muted-foreground transition-colors" />
        </Link>
        
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-muted-foreground hover:text-foreground hover:bg-surface rounded-xl transition-all text-xs font-medium border border-transparent hover:border-border-muted"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

function NavItem({ href, icon, label, active = false }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <Link 
      href={href}
      className={`group relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ${
        active 
          ? "text-foreground bg-surface border border-border-muted shadow-[0_1px_2px_rgba(0,0,0,0.02)]" 
          : "text-muted-foreground hover:text-foreground hover:bg-surface/50"
      }`}
    >
      {active && (
        <motion.div 
          layoutId="active-nav"
          className="absolute left-0 w-1 h-5 bg-foreground rounded-full"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
      <div className={`transition-colors duration-300 ${active ? "text-foreground" : "text-muted-foreground/90 group-hover:text-foreground"} [&>svg]:w-[18px] [&>svg]:h-[18px]`}>
        {icon}
      </div>
      <span className="text-sm font-medium tracking-tight">{label}</span>
      {active && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-foreground/20" />
      )}
    </Link>
  );
}
