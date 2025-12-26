# File Structure

src/
  app/
    constants.ts         # routes
    providers.tsx        # React Query + Toast
    router.tsx           # pages routing
  layout/
    nav.ts               # sidebar items
    Shell.tsx            # desktop layout shell
    ProfileModal.tsx     # Profile & Settings modal
  components/
    ui/                  # Button/Card/Input/Select/Chip
    common/              # Modal/ToastHost
  features/
    tasks/
      types.ts
      taskApi.ts         # swap to Spring Boot endpoints later
      taskQueries.ts     # React Query hooks
    pomodoro/
      types.ts
      pomodoroStore.ts   # timer + sessions (local storage)
    insights/
      types.ts
      dss.ts             # rule-based scoring (explainable)
      insights.ts        # overview + recommendations builders
      insightsQueries.ts
  pages/
    Dashboard/
      DashboardPage.tsx
    Tasks/
      TasksPage.tsx
      TaskEditorModal.tsx
      TaskDetailsPanel.tsx
    Calendar/
      CalendarPage.tsx
    Pomodoro/
      PomodoroPage.tsx
    Insights/
      InsightsPage.tsx
  mock/
    seed.ts              # initial demo data
    db.ts                # localStorage DB for tasks
  services/
    http.ts              # axios base
    storage.ts           # localStorage helpers
  utils/
    cx.ts                # class concat
    date.ts              # date helpers
