import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import api from "../api/axios.js";

const AuthContext = createContext(null);
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;
const WARNING_BEFORE_LOGOUT_MS = 60 * 1000;
const ACTIVITY_EVENTS = [
  "mousemove",
  "keydown",
  "mousedown",
  "touchstart",
  "scroll",
  "click",
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [storage, setStorage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [blockedMessage, setBlockedMessage] = useState("");
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(60);
  const inactivityTimeoutRef = useRef(null);
  const inactivityIntervalRef = useRef(null);

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

  const login = useCallback(async (email, password) => {
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
  }, []);

  const logout = useCallback(async (showConfirm = true) => {
    if (
      showConfirm &&
      typeof window !== "undefined" &&
      !window.confirm("Are you sure you want to log out?")
    ) {
      return false;
    }

    if (inactivityTimeoutRef.current) {
      window.clearTimeout(inactivityTimeoutRef.current);
      inactivityTimeoutRef.current = null;
    }
    if (inactivityIntervalRef.current) {
      window.clearInterval(inactivityIntervalRef.current);
      inactivityIntervalRef.current = null;
    }

    try {
      await api.post("/auth/logout");
    } catch (_) {
      /* ignore */
    }
    localStorage.removeItem("dms_token");
    setUser(null);
    setStorage(null);
    setShowInactivityWarning(false);
    setCountdownSeconds(60);
    return true;
  }, []);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimeoutRef.current) {
      window.clearTimeout(inactivityTimeoutRef.current);
    }
    if (inactivityIntervalRef.current) {
      window.clearInterval(inactivityIntervalRef.current);
      inactivityIntervalRef.current = null;
    }

    setShowInactivityWarning(false);
    setCountdownSeconds(60);

    if (!user) return;

    inactivityTimeoutRef.current = window.setTimeout(() => {
      setShowInactivityWarning(true);
      setCountdownSeconds(60);

      inactivityIntervalRef.current = window.setInterval(() => {
        setCountdownSeconds((prev) => {
          if (prev <= 1) {
            if (inactivityIntervalRef.current) {
              window.clearInterval(inactivityIntervalRef.current);
              inactivityIntervalRef.current = null;
            }
            logout(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, INACTIVITY_TIMEOUT_MS - WARNING_BEFORE_LOGOUT_MS);
  }, [logout, user]);

  useEffect(() => {
    if (!user) {
      setShowInactivityWarning(false);
      setCountdownSeconds(60);
      return;
    }

    const handleActivity = () => resetInactivityTimer();

    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity, { passive: true });
    });

    resetInactivityTimer();

    return () => {
      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity);
      });
      if (inactivityTimeoutRef.current) {
        window.clearTimeout(inactivityTimeoutRef.current);
        inactivityTimeoutRef.current = null;
      }
      if (inactivityIntervalRef.current) {
        window.clearInterval(inactivityIntervalRef.current);
        inactivityIntervalRef.current = null;
      }
    };
  }, [resetInactivityTimer, user]);

  const extendSession = useCallback(() => {
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  return (
    <AuthContext.Provider
      value={{
        user,
        storage,
        loading,
        blockedMessage,
        showInactivityWarning,
        countdownSeconds,
        login,
        logout,
        extendSession,
        refresh: loadMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
