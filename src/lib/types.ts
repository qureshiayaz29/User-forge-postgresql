export interface User extends Record<string, unknown> {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  country: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}


