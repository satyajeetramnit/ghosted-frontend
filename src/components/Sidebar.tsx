import { LayoutDashboard, Users, StickyNote, Ghost } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-64 h-full bg-background border-r border-border border-opacity-30 p-6 flex flex-col hidden md:flex shrink-0">
      <div className="flex items-center gap-3 mb-10 text-xl font-bold text-foreground">
        <Ghost className="w-6 h-6 text-accent" />
        <span>Ghosted <span className="text-sm border ml-1 border-accent/30 bg-accent/10 text-accent px-1.5 py-0.5 rounded-md">Beta</span></span>
      </div>

      <nav className="flex-1 space-y-2">
        <NavItem icon={<LayoutDashboard />} label="Dashboard" active />
        <NavItem icon={<Users />} label="Contacts" />
        <NavItem icon={<StickyNote />} label="Notes" />
      </nav>
      
      <div className="mt-auto pt-6 border-t border-border/30">
        <div className="flex items-center gap-3 text-sm text-foreground/70">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-medium">SR</div>
          <div>
            <div className="font-medium text-foreground">User</div>
            <div className="text-xs">Pro Plan</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <div className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${active ? "bg-accent/10 text-accent font-medium" : "text-foreground/70 hover:text-foreground hover:bg-card"}`}>
      <div className="[&>svg]:w-5 [&>svg]:h-5">{icon}</div>
      <span>{label}</span>
    </div>
  );
}
