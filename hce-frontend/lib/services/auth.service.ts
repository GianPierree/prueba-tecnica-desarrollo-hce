import api from "@/lib/utils/api";
import { LoginDto, RegisterDto, AuthResponse, User } from "@/types/auth.types";

export const authService = {
  login: async (dto: LoginDto): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>("/auth/login", dto);
    return data;
  },

  register: async (dto: RegisterDto): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>("/auth/register", dto);
    return data;
  },

  logout: () => {
    localStorage.removeItem("hce_token");
    localStorage.removeItem("hce_user");
  },

  getCurrentUser: (): User | null => {
    if (typeof window === "undefined") return null;
    try {
      return JSON.parse(localStorage.getItem("hce_user") || "null");
    } catch {
      return null;
    }
  },

  isAuthenticated: (): boolean =>
    typeof window !== "undefined" && !!localStorage.getItem("hce_token"),
};