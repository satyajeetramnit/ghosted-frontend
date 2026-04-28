'use client';

import { LayoutDashboard, Users, Calendar, Ghost, LogOut, FileText } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileNav() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-background/95 backdrop-blur-md border-t border-border/50 z-40 flex items-center justify-around md:hidden px-2 pb-safe">
      <NavItem href="/" icon={<LayoutDashboard className="w-5 h-5" />} label="Home" active={pathname === "/"} />
      <NavItem href="/contacts" icon={<Users className="w-5 h-5" />} label="Contacts" active={pathname === "/contacts"} />
      <div className="flex flex-col items-center justify-center -mt-8 relative z-50">
         <div className="bg-background p-1.5 rounded-full border border-border shadow-lg">
           <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white shadow-xl shadow-accent/20">
             <Ghost className="w-5 h-5" />
           </div>
         </div>
      </div>
      <NavItem href="/interviews" icon={<Calendar className="w-5 h-5" />} label="Interviews" active={pathname === "/interviews"} />
      <NavItem href="/resume-builder" icon={<FileText className="w-5 h-5" />} label="Resume" active={pathname === "/resume-builder"} />
      <button 
        onClick={logout}
        className="flex flex-col items-center justify-center w-16 gap-1 text-foreground/50 hover:text-red-400 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        <span className="text-[9px] font-medium tracking-wide">Logout</span>
      </button>
    </nav>
  );
}

function NavItem({ href, icon, label, active = false }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <Link 
      href={href}
      className={`flex flex-col items-center justify-center w-16 gap-1 transition-colors ${active ? "text-accent" : "text-foreground/50 hover:text-foreground"}`}
    >
      <div className={active ? "scale-110 transition-transform" : ""}>{icon}</div>
      <span className="text-[9px] font-medium tracking-wide">{label}</span>
    </Link>
  );
}
