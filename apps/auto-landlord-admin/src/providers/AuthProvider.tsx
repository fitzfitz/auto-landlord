import { useEffect, useState, createContext, useContext, useCallback } from "react";
import { useAuth, useClerk } from "@clerk/clerk-react";
import {
  setAuthToken,
  setAuthErrorHandler,
  setRefreshTokenFn,
} from "@/lib/api";

interface AuthContextValue {
  isTokenReady: boolean;
  logout: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue>({
  isTokenReady: false,
  logout: async () => {},
  refreshToken: async () => null,
});

export const useAuthContext = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const [isTokenReady, setIsTokenReady] = useState(false);

  // Logout function
  const logout = useCallback(async () => {
    try {
      setAuthToken(null);
      setIsTokenReady(false);
      await signOut();
    } catch (error) {
      console.error("Logout failed:", error);
      // Force reload to clear state even if signOut fails
      window.location.href = "/";
    }
  }, [signOut]);

  // Refresh token function
  const refreshToken = useCallback(async (): Promise<string | null> => {
    try {
      if (!isSignedIn) {
        return null;
      }
      // Force refresh by passing { skipCache: true }
      const newToken = await getToken({ skipCache: true });
      if (newToken) {
        setAuthToken(newToken);
        return newToken;
      }
      return null;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return null;
    }
  }, [getToken, isSignedIn]);

  // Register handlers with the API module
  useEffect(() => {
    setAuthErrorHandler(() => {
      console.warn("Auth error detected - logging out");
      logout();
    });
    setRefreshTokenFn(refreshToken);
  }, [logout, refreshToken]);

  // Sync token on mount and when auth state changes
  useEffect(() => {
    const syncToken = async () => {
      if (isLoaded && isSignedIn) {
        const token = await getToken();
        setAuthToken(token);
        setIsTokenReady(true);
      } else {
        setAuthToken(null);
        setIsTokenReady(isLoaded); // Ready if loaded but not signed in
      }
    };

    syncToken();

    // Re-sync token periodically (every 50 seconds to be safe before 60s expiry)
    const interval = setInterval(syncToken, 50000);
    return () => clearInterval(interval);
  }, [getToken, isLoaded, isSignedIn]);

  return (
    <AuthContext.Provider value={{ isTokenReady, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
};

