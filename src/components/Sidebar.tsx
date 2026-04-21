'use client';

import { LayoutDashboard, Users, StickyNote, Ghost, LogOut, Calendar } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const initials = `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase() || "U";

  return (
    <aside className="w-64 h-full bg-background border-r border-border border-opacity-30 p-6 flex flex-col hidden md:flex shrink-0">
      <Link href="/" className="flex items-center gap-3 mb-10 text-xl font-bold text-foreground">
        <Ghost className="w-6 h-6 text-accent" />
        <span>Ghosted <span className="text-sm border ml-1 border-accent/30 bg-accent/10 text-accent px-1.5 py-0.5 rounded-md">Beta</span></span>
      </Link>

      <nav className="flex-1 space-y-2">
        <NavItem href="/" icon={<LayoutDashboard />} label="Dashboard" active={pathname === "/"} />
        <NavItem href="/contacts" icon={<Users />} label="Contacts" active={pathname === "/contacts"} />
        <NavItem href="/interviews" icon={<Calendar />} label="Interviews" active={pathname === "/interviews"} />
        <NavItem href="/notes" icon={<StickyNote />} label="Notes" active={pathname === "/notes"} />
      </nav>
      
      <div className="mt-auto pt-6 border-t border-border/30 space-y-4">
        <div className="flex items-center gap-3 text-sm text-foreground/70">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-medium">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-foreground truncate">{user.firstName} {user.lastName}</div>
            <div className="text-xs truncate text-foreground/50">{user.email}</div>
          </div>
        </div>
        
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 text-foreground/70 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

function NavItem({ href, icon, label, active = false }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <Link 
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${active ? "bg-accent/10 text-accent font-medium" : "text-foreground/70 hover:text-foreground hover:bg-card"}`}
    >
      <div className="[&>svg]:w-5 [&>svg]:h-5">{icon}</div>
      <span>{label}</span>
    </Link>
  );
}

