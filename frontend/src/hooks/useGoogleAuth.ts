export const useGoogleAuth = () => {
  const handleGoogleLogin = async (e: React.FormEvent) => {
    window.location.href = '/api/auth/google';
  };

  return { handleGoogleLogin };
};