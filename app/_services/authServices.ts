import api from "./api";

export interface Register{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    dob: string;
}

export interface RegisterResponse {
  message: string;
  success: boolean;
  userId: number;
}

// Error response shape (400 / 409)
export interface ApiErrorResponse {
  message: string;
  success?: boolean;
}

export interface Login{
  email:string;
  password:string
}

export interface LoginResponse{
  message:string;
  success:boolean;
  token:string;
}

export const authService = {
  register: async (userData: Register): Promise<RegisterResponse> => {
    try {
      const response = await api.post<RegisterResponse>("/auth/register", userData);
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred during registration.";
      throw new Error(message);
    }
  },
};

export const loginService={
  login:async (userData:Login): Promise<LoginResponse> =>{
    try {
      const response = await api.post<LoginResponse>("/auth/login", userData);
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred during login.";
      throw new Error(message);
    }
  }
}