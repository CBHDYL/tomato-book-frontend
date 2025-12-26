import { Shield, Users, ListChecks, Timer, Sparkles } from "lucide-react";

export const ADMIN_NAV_ITEMS = [
  { to: "/admin/dashboard", label: "Admin", icon: Shield },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/tasks", label: "Tasks", icon: ListChecks },
  { to: "/admin/pomodoro", label: "Pomodoro", icon: Timer },
  { to: "/admin/insights", label: "Insights", icon: Sparkles },
] as const;