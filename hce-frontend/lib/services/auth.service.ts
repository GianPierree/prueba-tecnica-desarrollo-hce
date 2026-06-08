import { LoginDto, RegisterDto, AuthResponse, User } from "@/types/auth.types";
const users: Array<User & { password: string }> = [
  { id:"1", nombre:"Administrador", email:"admin@hce.com", password:"admin123", rol:"admin" },
];
export const authService = {
  login: async (dto: LoginDto): Promise<AuthResponse> => {
    const user = users.find(u => u.email === dto.email && u.password === dto.password);
    if (!user) throw new Error("Credenciales inválidas");
    const { password: _, ...u } = user;
    return { token: `mock-jwt-${u.id}-${Date.now()}`, user: u };
  },
  register: async (dto: RegisterDto): Promise<AuthResponse> => {
    if (users.find(u => u.email === dto.email)) throw new Error("El email ya está registrado");
    const newUser = { id: String(users.length + 1), nombre: dto.nombre, email: dto.email, password: dto.password, rol: "usuario" as const };
    users.push(newUser);
    const { password: _, ...u } = newUser;
    return { token: `mock-jwt-${u.id}-${Date.now()}`, user: u };
  },
  logout: () => { localStorage.removeItem("hce_token"); localStorage.removeItem("hce_user"); },
  getCurrentUser: (): User | null => {
    if (typeof window === "undefined") return null;
    try { return JSON.parse(localStorage.getItem("hce_user") || "null"); } catch { return null; }
  },
  isAuthenticated: (): boolean => typeof window !== "undefined" && !!localStorage.getItem("hce_token"),
};
