import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { Shell } from "../layout/Shell";
import { DashboardPage } from "../pages/Dashboard/DashboardPage";
import { TasksPage } from "../pages/Tasks/TasksPage";
import { CalendarPage } from "../pages/Calendar/CalendarPage";
import { PomodoroPage } from "../pages/Pomodoro/PomodoroPage";
import InsightsPage from "../pages/Insights/InsightsPage";
import LoginPage from "../pages/Auth/LoginPage";
import RegisterPage from "../pages/Auth/RegisterPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { AdminRoute } from "./AdminRoute";

import AdminDashboardPage from "../pages/Admin/AdminDashboardPage";
import AdminUsersPage from "../pages/Admin/AdminUsersPage";
import AdminTasksPage from "../pages/Admin/AdminTasksPage";
import AdminPomodoroPage from "../pages/Admin/AdminPomodoroPage";
import AdminInsightsPage from "../pages/Admin/AdminInsightsPage";

export const router = createBrowserRouter([
  
  { path: "/", element: <Navigate to="/dashboard" replace /> },

  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },

  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <Shell />,
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/tasks", element: <TasksPage /> },
          { path: "/calendar", element: <CalendarPage /> },
          { path: "/pomodoro", element: <PomodoroPage /> },
          { path: "/insights", element: <InsightsPage /> },
        ],
      },
    ],
  },
  // ✅ Admin (role=ADMIN only)
  {
    element: <AdminRoute />,
    children: [
      {
        element: <Shell />,
        children: [
          {
            path: "/admin",
            element: <Navigate to="/admin/dashboard" replace />,
          },
          { path: "/admin/dashboard", element: <AdminDashboardPage /> },
          { path: "/admin/users", element: <AdminUsersPage /> },
          { path: "/admin/tasks", element: <AdminTasksPage /> },
          { path: "/admin/pomodoro", element: <AdminPomodoroPage /> },
          { path: "/admin/insights", element: <AdminInsightsPage /> },
        ],
      },
    ],
  },

  { path: "*", element: <Navigate to="/" replace /> },
]);