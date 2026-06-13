import { NavLink } from "react-router-dom";
import Icon from "@/components/ui/icon";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
      style={{ background: "rgba(12,11,24,0.8)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(192,96,255,0.12)" }}>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg btn-neon flex items-center justify-center">
          <Icon name="Music2" size={16} />
        </div>
        <span className="font-display text-lg font-bold neon-text-purple tracking-wider">LYRIX</span>
      </div>

      <div className="flex items-center gap-1">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive ? "bg-purple-500/20 text-purple-300 neon-border" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`
          }
        >
          <Icon name="Shuffle" size={15} />
          Генератор
        </NavLink>
        <NavLink
          to="/history"
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive ? "bg-purple-500/20 text-purple-300 neon-border" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`
          }
        >
          <Icon name="Clock" size={15} />
          История
        </NavLink>
      </div>
    </nav>
  );
}
