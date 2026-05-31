import { NavLink, Outlet } from "react-router-dom";
import {
  Bug,
  Code2,
  LayoutDashboard,
  Sparkles,
} from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/review", label: "Code Review", icon: Code2 },
  { to: "/debug", label: "Debug Assistant", icon: Bug },
];

export function Layout() {
  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-700/50 bg-surface-800/95 backdrop-blur-md lg:static">
        <div className="flex items-center gap-3 border-b border-slate-700/50 px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white">CodeReview AI</h1>
            <p className="text-xs text-slate-400">Review & Debug</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-accent/20 text-accent-hover"
                    : "text-slate-400 hover:bg-surface-700 hover:text-slate-200"
                }`
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-700/50 p-4">
          <p className="text-xs text-slate-500">Powered by Google Gemini</p>
        </div>
      </aside>

      <main className="flex-1 overflow-auto lg:ml-0">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
