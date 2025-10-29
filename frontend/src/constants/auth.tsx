export interface User {
  id: number;
  username: string;
  email: string;
  avatar_url: string | null;
  isAccountVerified: boolean;
}


// Define the API response type
export interface AuthResponse {
    status: boolean,
    user: User
}


// Define the return type of the hook
export interface UseAuthReturn {
    user: User | null,
    isLoading: boolean
}