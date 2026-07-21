import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Login from "./pages/Login.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import StoreDashboard from "./pages/store/StoreDashboard.jsx";

const Splash = () => (
  <div className="min-h-screen flex items-center justify-center bg-paper">
    <div className="flex items-center gap-3 text-ledger-700">
      <div className="h-5 w-5 rounded-full border-2 border-ledger-700 border-t-transparent animate-spin" />
      <span className="font-display text-lg">Loading ledger…</span>
    </div>
  </div>
);

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <Splash />;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return (
      <Navigate to={user.role === "admin" ? "/admin" : "/store"} replace />
    );
  }
  return children;
};

function App() {
  const {
    user,
    loading,
    showInactivityWarning,
    countdownSeconds,
    extendSession,
    logout,
  } = useAuth();

  if (loading) return <Splash />;

  return (
    <>
      {showInactivityWarning && (
        <div className="fixed inset-x-0 top-0 z-40 border-b border-amber-300 bg-amber-100 px-4 py-3 text-center text-sm text-amber-900 shadow-sm">
          <div className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-2 sm:flex-row">
            <span>
              You’ve been inactive for a while. You’ll be signed out in{" "}
              {countdownSeconds} second{countdownSeconds === 1 ? "" : "s"}.
            </span>
            <div className="flex gap-2">
              <button
                onClick={extendSession}
                className="rounded bg-amber-700 px-3 py-1 text-white hover:bg-amber-800"
              >
                Stay signed in
              </button>
              <button
                onClick={() => logout(false)}
                className="rounded border border-amber-700 px-3 py-1 text-amber-800 hover:bg-amber-200"
              >
                Sign out now
              </button>
            </div>
          </div>
        </div>
      )}

      <Routes>
        <Route
          path="/login"
          element={
            user ? (
              <Navigate
                to={user.role === "admin" ? "/admin" : "/store"}
                replace
              />
            ) : (
              <Login />
            )
          }
        />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/store/*"
          element={
            <ProtectedRoute role="store_owner">
              <StoreDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <Navigate
              to={
                user ? (user.role === "admin" ? "/admin" : "/store") : "/login"
              }
              replace
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
