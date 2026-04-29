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
    <nav className="fixed bottom-4 left-4 right-4 h-16 bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl z-50 flex items-center justify-around md:hidden px-2 shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
      <NavItem href="/" icon={<LayoutDashboard />} label="Home" active={pathname === "/"} />
      <NavItem href="/contacts" icon={<Users />} label="Contacts" active={pathname === "/contacts"} />
      
      <div className="flex flex-col items-center justify-center -mt-10 relative">
         <Link href="/" className="bg-background p-1 rounded-full border border-border shadow-lg active:scale-95 transition-transform">
           <div className="w-12 h-12 bg-foreground rounded-full flex items-center justify-center text-background shadow-xl">
             <Ghost className="w-6 h-6" />
           </div>
         </Link>
      </div>

      <NavItem href="/interviews" icon={<Calendar />} label="Events" active={pathname === "/interviews"} />
      <NavItem href="/resume-builder" icon={<FileText />} label="Resume" active={pathname === "/resume-builder"} />
    </nav>
  );
}

function NavItem({ href, icon, label, active = false }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <Link 
      href={href}
      className={`flex flex-col items-center justify-center w-12 gap-1 transition-all duration-300 ${
        active ? "text-foreground scale-110" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <div className="[&>svg]:w-[20px] [&>svg]:h-[20px]">{icon}</div>
      <span className="text-[8px] font-bold uppercase tracking-wider">{label}</span>
      {active && (
        <div className="w-1 h-1 rounded-full bg-foreground mt-0.5" />
      )}
    </Link>
  );
}
