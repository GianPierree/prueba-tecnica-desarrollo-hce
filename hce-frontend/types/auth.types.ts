export interface User { id: string; nombre: string; email: string; rol: 'admin' | 'usuario'; }
export interface LoginDto { email: string; password: string; }
export interface RegisterDto { nombre: string; email: string; password: string; }
export interface AuthResponse { token: string; user: User; }
