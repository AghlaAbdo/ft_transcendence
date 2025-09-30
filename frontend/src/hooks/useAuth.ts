"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface User {
  id: number;
  username: string;
  email: string;
  avatar_url: string;
  isAccountVerified: boolean;
}


interface AuthResponse {
    status: boolean,
    user: User
}

interface UseAuthReturn {
    user: User | null,
    isLoading: boolean
}

export const useAuth = () : UseAuthReturn => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async (): Promise<void> => {
            try {
                const response = await fetch('https://localhost:8080/api/auth/me', {
                    method: 'GET',
                    credentials: 'include'
                });

                if (response.ok) {
                    const data : AuthResponse = await response.json();
                    setUser(data.user);
                } else {
                    router.push('/login');
                }
            } catch (error) {
                console.error('Auth check error:', error);
                router.push('/login');
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    return {user, isLoading};
}