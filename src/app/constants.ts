export const ROUTES = {
  dashboard: "/dashboard",
  tasks: "/tasks",
  calendar: "/calendar",
  pomodoro: "/pomodoro",
  insights: "/insights",
  register: "/register",
} as const;

export type RouteKey = keyof typeof ROUTES;
export const TOKEN_KEY = "token";