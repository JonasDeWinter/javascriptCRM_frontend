import { apiRequest } from './apiClient';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegistrationDetails extends LoginCredentials {
  email: string;
}

export interface LoginResponse {
  token: string;
  tokenType: 'Bearer';
  expiresIn: number;
}

export const authApi = {
  login(credentials: LoginCredentials): Promise<LoginResponse> {
    return apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async register(details: RegistrationDetails): Promise<void> {
    await apiRequest<unknown>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(details),
    });
  },
};
