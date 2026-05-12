
export interface LoginRequest {
  email: string;
  password: string;
}


export interface LoginResponse {
  accessToken: string;
  expiresAt: string;
  name: string;
  email: string;
  role: string;
}


export interface SignUpRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface SignUpResponse {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}


