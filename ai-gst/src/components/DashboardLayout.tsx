import { ReactNode, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  BarChart3, Upload, Brain, FileText, Clock, Settings, LogOut, Zap, Search, ChevronLeft, LayoutDashboard, Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";


const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Upload, label: "Upload Invoices", path: "/dashboard/upload" },
  { icon: BarChart3, label: "Analytics", path: "/dashboard/analytics" },
  { icon: Brain, label: "AI Insights", path: "/dashboard/insights" },
  { icon: FileText, label: "Reports", path: "/dashboard/reports" },
  { icon: Clock, label: "History", path: "/dashboard/history" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];



export default function DashboardLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const user = auth.currentUser;
  const userEmail = user?.email || "User";
  const avatarLetter = userEmail.charAt(0).toUpperCase();

  const handleLogout = async () => {
  await signOut(auth);
  navigate("/login");
}; 

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full gradient-sidebar flex flex-col border-r border-sidebar-border transition-all duration-300",
          collapsed ? "w-[68px]" : "w-60",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 h-16 border-b border-sidebar-border">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg gradient-primary">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && <span className="text-lg font-bold text-sidebar-accent-foreground">Easy GST</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setMobileOpen(false); }}
                className={cn(
                  "flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm transition-all duration-200",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-4.5 w-4.5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-2 border-t border-sidebar-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <LogOut className="h-4.5 w-4.5 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex absolute -right-3 top-20 h-6 w-6 items-center justify-center rounded-full border border-border bg-card shadow-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className={cn("h-3 w-3 transition-transform", collapsed && "rotate-180")} />
        </button>
      </aside>

      {/* Main */}
      <div className={cn("flex-1 flex flex-col transition-all duration-300", collapsed ? "lg:ml-[68px]" : "lg:ml-60")}>
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex items-center gap-4 h-16 border-b border-border bg-background/80 backdrop-blur-xl px-6">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden text-muted-foreground">
            <Menu className="h-5 w-5" />
          </button>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-9 h-9 bg-muted/50 border-0" />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <ThemeToggle />
            <div className="relative">

            <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold"
            >
            {avatarLetter}
            </button>

            {profileOpen && (
            <div className="absolute right-0 mt-2 w-40 rounded-lg border border-border bg-card shadow-lg overflow-hidden">

            <button
            onClick={()=>{
            navigate("/dashboard/profile");
            setProfileOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm hover:bg-muted"
            >
            My Profile
            </button>

            <button
            onClick={()=>{
            navigate("/dashboard/settings");
            setProfileOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm hover:bg-muted"
            >
            Settings
            </button>

            <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-muted"
            >
            Logout
            </button>

            </div>
            )}

            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
