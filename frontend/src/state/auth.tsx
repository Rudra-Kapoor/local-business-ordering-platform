import * as React from "react";
import { api, setAuthToken } from "../lib/api";
import { getToken, setToken } from "../lib/storage";
import type { Role, User } from "../lib/types";

type AuthState = {
  token: string | null;
  user: User | null;
  isReady: boolean;
};

type AuthContextValue = AuthState & {
  login: (args: { email: string; password: string }) => Promise<void>;
  register: (args: {
    name: string;
    email: string;
    password: string;
    role?: Role;
  }) => Promise<void>;
  logout: () => void;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AuthState>({
    token: null,
    user: null,
    isReady: false,
  });

  React.useEffect(() => {
    const token = getToken();
    setAuthToken(token);
    setState((s) => ({ ...s, token }));
    (async () => {
      if (!token) {
        setState((s) => ({ ...s, isReady: true }));
        return;
      }
      try {
        const res = await api.get<{ user: User }>("/auth/me");
        setState({ token, user: res.data.user, isReady: true });
      } catch {
        setToken(null);
        setAuthToken(null);
        setState({ token: null, user: null, isReady: true });
      }
    })();
  }, []);

  const login: AuthContextValue["login"] = async ({ email, password }) => {
    const res = await api.post<{ user: User; token: string }>("/auth/login", {
      email,
      password,
    });
    setToken(res.data.token);
    setAuthToken(res.data.token);
    setState({ token: res.data.token, user: res.data.user, isReady: true });
  };

  const register: AuthContextValue["register"] = async ({
    name,
    email,
    password,
    role,
  }) => {
    const res = await api.post<{ user: User; token: string }>("/auth/register", {
      name,
      email,
      password,
      role,
    });
    setToken(res.data.token);
    setAuthToken(res.data.token);
    setState({ token: res.data.token, user: res.data.user, isReady: true });
  };

  const logout = () => {
    setToken(null);
    setAuthToken(null);
    setState({ token: null, user: null, isReady: true });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

