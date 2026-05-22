import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { BarChart3, BriefcaseBusiness, CheckSquare, LogOut, Menu, Settings, UserRound, UsersRound } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/Button";
import { useAuthStore } from "../store/auth-store";
import { cn } from "../utils/cn";

const nav = [
  { to: "/app/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/app/projects", label: "Projects", icon: BriefcaseBusiness },
  { to: "/app/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/app/team", label: "Team", icon: UsersRound },
  { to: "/app/profile", label: "Profile", icon: UserRound },
  { to: "/app/settings", label: "Settings", icon: Settings }
];

export function AppLayout() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 border-r border-border bg-white transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center border-b border-border px-5">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-slate-900 font-bold text-white">TT</div>
          <div className="ml-3">
            <p className="text-sm font-bold">Team Task Manager</p>
            <p className="text-xs text-slate-500">Operations workspace</p>
          </div>
        </div>
        <nav className="space-y-1 px-3 py-4">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950",
                  isActive && "bg-slate-900 text-white hover:bg-slate-900 hover:text-white"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      {open && <button aria-label="Close navigation" className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden" onClick={() => setOpen(false)} />}
      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-white/95 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="h-9 w-9 px-0 lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation">
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.role === "ADMIN" ? "System admin" : "Team member"}</p>
            </div>
          </div>
          <Button variant="secondary" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
