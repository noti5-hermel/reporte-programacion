import { useAuthContext } from "../features/auth/context/AuthContext";

export const useAuth = () => {
  const {
    isAuthenticated,
    user,
    hasRole,
    login: contextLogin,
    logout: contextLogout,
    authServiceAvailable,
  } = useAuthContext();

  const isLoading = false;

  const login = async (credentials: { username: string; password: string }) => {
    await contextLogin(credentials.username, credentials.password);
  };

  const logout = () => {
    contextLogout();
  };

  return {
    isAuthenticated,
    user,
    hasRole,
    login,
    logout,
    isLoading,
    authServiceAvailable,
  };
};
