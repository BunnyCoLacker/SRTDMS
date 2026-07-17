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
    return <Navigate to={user.role === "admin" ? "/admin" : "/store"} replace />;
  }
  return children;
};

function App() {
  const { user, loading } = useAuth();

  if (loading) return <Splash />;

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to={user.role === "admin" ? "/admin" : "/store"} replace /> : <Login />}
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
        element={<Navigate to={user ? (user.role === "admin" ? "/admin" : "/store") : "/login"} replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
