import { create } from "zustand";
import { api } from "../../services/http";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ApiResult,
} from "./authApi";
import { TOKEN_KEY } from "../../app/constants";

interface AuthState {
  token: string | null;
  hydrated: boolean; 
  loading: boolean;
  error: string | null;

  hydrate: () => void;

  login: (data: LoginRequest) => Promise<void>; 
  register: (data: RegisterRequest) => Promise<void>; 
  logout: () => void;
}

function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function writeToken(token: string | null) {
  try {
    if (!token) localStorage.removeItem(TOKEN_KEY);
    else localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  hydrated: false,
  loading: false,
  error: null,

  
  hydrate: () => {
    const token = readToken();
    set({ token, hydrated: true });
  },

  login: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post<ApiResult<LoginResponse>>(
        "/users/login",
        data
      );
      const token = res?.data?.data?.token ?? null;

      if (!token) {
        set({ error: "Login failed: token missing." });
        throw new Error("Token missing");
      }

      writeToken(token);
      set({ token });
    } catch (err: any) {
      const message =
        err?.response?.status === 401
          ? "Invalid email/username or password."
          : err?.response?.data?.msg ||
            err?.response?.data?.message ||
            err?.message ||
            "Login failed.";

      set({ error: message });
      throw err; 
    } finally {
      set({ loading: false });
    }
  },

  register: async (data) => {
    set({ loading: true, error: null });
    try {
      await api.post<ApiResult<RegisterResponse>>("/users/register", data);
      
    } catch (err: any) {
      const msg =
        err?.response?.data?.msg ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Register failed.";

      set({ error: msg });
      throw err; 
    } finally {
      set({ loading: false });
    }
  },

  logout: () => {
    writeToken(null);
    set({ token: null, error: null });
  },
}));