import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import api from "../api/axios.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [storage, setStorage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [blockedMessage, setBlockedMessage] = useState("");

  const loadMe = useCallback(async () => {
    const token = localStorage.getItem("dms_token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user);
      setStorage(data.storage);
    } catch (err) {
      localStorage.removeItem("dms_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  const login = async (email, password) => {
    setBlockedMessage("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("dms_token", data.token);
      setUser(data.user);
      setStorage(data.storage);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      if (err.response?.data?.blocked) setBlockedMessage(message);
      return { success: false, message };
    }
  };

  const logout = async () => {
    if (
      typeof window !== "undefined" &&
      !window.confirm("Are you sure you want to log out?")
    ) {
      return false;
    }

    try {
      await api.post("/auth/logout");
    } catch (_) {
      /* ignore */
    }
    localStorage.removeItem("dms_token");
    setUser(null);
    setStorage(null);
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        storage,
        loading,
        blockedMessage,
        login,
        logout,
        refresh: loadMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
