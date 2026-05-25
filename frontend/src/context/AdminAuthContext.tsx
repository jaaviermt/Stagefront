import { FC, ReactNode, createContext, useContext, useState } from "react";

interface AdminAuthCtx {
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthCtx>({
  isAuthenticated: false,
  login: () => false,
  logout: () => undefined,
});

const SESSION_KEY = "sf_admin_v1";
const CREDENTIALS = { email: "admin@stagefront.mx", password: "admin123" };

export const AdminAuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === "ok"
  );

  const login = (email: string, password: string): boolean => {
    if (email.trim() === CREDENTIALS.email && password === CREDENTIALS.password) {
      sessionStorage.setItem(SESSION_KEY, "ok");
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = (): void => {
    sessionStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export function useAdminAuth(): AdminAuthCtx {
  return useContext(AdminAuthContext);
}
