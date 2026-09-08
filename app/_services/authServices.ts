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

export const authService={
    register : async(userData:Register)=>{
      try {
        const response = await api.post('/auth/register',userData)
        return response.data as RegisterResponse;
      } catch (error) {
        
      }
    }
}