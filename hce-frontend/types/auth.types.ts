export interface User {
  id: number;
  nombreCompleto: string;
  email: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  nombreCompleto: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}