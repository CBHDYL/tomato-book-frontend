export type ApiResult<T> = { code: number; msg?: string; data: T };

export type SpringPage<T> = {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first?: boolean;
  last?: boolean;
};

export type AdminStats = {
  totalUsers: number;
  totalTasks: number;
  totalPomodoroSessions: number;
  pomodoroLast7Days: number;
};

// Match backend User entity (admin list)
export type AdminUser = {
  id: number;
  username: string;
  nickname?: string | null;
  email?: string | null;
  phone?: string | null;
  gender?: number | null;
  avatar?: string | null;
  status?: number | null;
  role?: string | null;
  createTime?: string | null;
  updateTime?: string | null;
};

// Match backend PomodoroSessionDto (admin list)
export type AdminPomodoroSession = {
  id: number;
  userId: number;
  taskId?: number | null;
  mode?: string | null;
  minutes?: number | null;
  startedAt?: string | null;
  endedAt?: string | null;
};

export type AdminPomodoroList = {
  items: AdminPomodoroSession[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

export type AdminInsightRecommendation = {
  taskId: number;
  title: string;
  priority: "low" | "medium" | "high" | string;
  deadline: string | null;
  score: number;
  reasons: string[];
  suggestedPomodoros: number;
};

export type RecommendationsResponse = {
  generatedAt?: string;
  range: string;
  recommendations: AdminInsightRecommendation[];
};