import { useEffect, useState } from "react";
import api from "../../api/axios.js";

const peso = (n) => `₱${Number(n || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
const fmtDateTime = (d) =>
  new Date(d).toLocaleString("en-PH", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

const TYPE_STYLES = {
  debt_created: "bg-gold-100 text-gold-600",
  payment: "bg-ledger-100 text-ledger-700",
  debt_cancelled: "bg-rust/10 text-rust",
  borrower_cancelled: "bg-ink/5 text-muted",
};

const TYPE_LABELS = {
  debt_created: "Debt added",
  payment: "Payment",
  debt_cancelled: "Debt cancelled",
  borrower_cancelled: "Borrower cancelled",
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const { data } = await api.get("/transactions", { params: typeFilter ? { type: typeFilter } : {} });
    setTransactions(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="font-display text-2xl text-ink">Transactions</h2>
          <p className="text-sm text-muted">Review every debt and payment recorded in this storage.</p>
        </div>
        <select className="input !w-48" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All types</option>
          <option value="debt_created">Debt added</option>
          <option value="payment">Payments</option>
          <option value="debt_cancelled">Debt cancelled</option>
          <option value="borrower_cancelled">Borrower cancelled</option>
        </select>
      </div>

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : transactions.length === 0 ? (
        <div className="card p-8 text-center text-muted">No transactions yet.</div>
      ) : (
        <div className="card overflow-hidden">
         <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-ledger-50 text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Borrower</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">By</th>
                <th className="px-4 py-3">When</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t._id} className="border-t border-ink/5">
                  <td className="px-4 py-3">
                    <span className={`badge ${TYPE_STYLES[t.type] || "bg-ink/5 text-muted"}`}>{TYPE_LABELS[t.type] || t.type}</span>
                  </td>
                  <td className="px-4 py-3 font-medium">{t.borrower?.name}</td>
                  <td className="px-4 py-3 text-muted">{t.description}</td>
                  <td className="px-4 py-3">{t.amount ? peso(t.amount) : "—"}</td>
                  <td className="px-4 py-3 text-muted">{t.performedBy?.name}</td>
                  <td className="px-4 py-3 text-muted">{fmtDateTime(t.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
         </div>
        </div>
      )}
    </div>
  );
}
