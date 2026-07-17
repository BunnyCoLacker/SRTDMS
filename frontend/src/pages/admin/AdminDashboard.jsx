import { Routes, Route, Navigate } from "react-router-dom";
import Shell from "../../components/Shell.jsx";
import UsersPage from "./UsersPage.jsx";
import StoragesPage from "./StoragesPage.jsx";
import ReportsPage from "./ReportsPage.jsx";

const navItems = [
  { to: "/admin/users", label: "Users", end: true },
  { to: "/admin/storages", label: "Storages" },
  { to: "/admin/reports", label: "User Reports" },
];

export default function AdminDashboard() {
  return (
    <Shell navItems={navItems} eyebrow="Admin Console">
      <Routes>
        <Route index element={<Navigate to="users" replace />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="storages" element={<StoragesPage />} />
        <Route path="reports" element={<ReportsPage />} />
      </Routes>
    </Shell>
  );
}
