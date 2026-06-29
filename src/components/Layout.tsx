import { Link, useLocation } from "react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  Ticket,
  LogIn,
  LogOut,
  User,
  Music,
  Github,
  Heart,
} from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const navItems = [
    { path: "/", label: "Úkoly", icon: LayoutDashboard },
    { path: "/tickets", label: "Vstupenky", icon: Ticket },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/30 transition-shadow">
              <Music className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent leading-tight">
                TaskFlow
              </span>
              <span className="text-[10px] text-slate-400 -mt-0.5 tracking-wider uppercase">
                Beat For Love
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={
                      isActive
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    }
                  >
                    <item.icon className="w-4 h-4 mr-1.5" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Auth */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                  <User className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {user?.name || "Uživatel"}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-slate-500 hover:text-red-500"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 hover:text-indigo-600"
                >
                  <LogIn className="w-4 h-4 mr-1.5" />
                  Přihlásit
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>Made with</span>
              <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" />
              <span>by Patrik</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span>React + tRPC + Drizzle + Neon</span>
              <a
                href="https://github.com/digitalvr51-ctrl/fullstack-neon-app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-indigo-500 transition-colors"
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
