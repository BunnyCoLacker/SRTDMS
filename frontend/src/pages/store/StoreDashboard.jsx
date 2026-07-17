import { Routes, Route, Navigate } from "react-router-dom";
import Shell from "../../components/Shell.jsx";
import BorrowersPage from "./BorrowersPage.jsx";
import BorrowerDetailPage from "./BorrowerDetailPage.jsx";
import OverduePage from "./OverduePage.jsx";
import TransactionsPage from "./TransactionsPage.jsx";

const navItems = [
  { to: "/store/borrowers", label: "Borrowers", end: true },
  { to: "/store/overdue", label: "Overdue" },
  { to: "/store/transactions", label: "Transactions" },
];

export default function StoreDashboard() {
  return (
    <Shell navItems={navItems} eyebrow="Store Owner">
      <Routes>
        <Route index element={<Navigate to="borrowers" replace />} />
        <Route path="borrowers" element={<BorrowersPage />} />
        <Route path="borrowers/:id" element={<BorrowerDetailPage />} />
        <Route path="overdue" element={<OverduePage />} />
        <Route path="transactions" element={<TransactionsPage />} />
      </Routes>
    </Shell>
  );
}
