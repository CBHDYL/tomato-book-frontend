import { LayoutDashboard, CheckSquare, Calendar as CalendarIcon, Timer, LineChart } from "lucide-react";
import { ROUTES } from "../app/constants";

export const NAV_ITEMS = [
  { to: ROUTES.dashboard, label: "Dashboard", icon: LayoutDashboard },
  { to: ROUTES.tasks, label: "Tasks", icon: CheckSquare },
  { to: ROUTES.calendar, label: "Calendar", icon: CalendarIcon },
  { to: ROUTES.pomodoro, label: "Pomodoro", icon: Timer },
  { to: ROUTES.insights, label: "Insights", icon: LineChart }
] as const;