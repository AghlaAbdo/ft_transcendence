export const useGoogleAuth = () => {
  const handleGoogleLogin = async (e: React.FormEvent) => {
    window.location.href = 'http://localhost:8080/api/auth/google';
  };

  return { handleGoogleLogin };
};