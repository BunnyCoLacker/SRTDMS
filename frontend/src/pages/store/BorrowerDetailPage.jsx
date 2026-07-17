import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/axios.js";
import Modal from "../../components/Modal.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";

const peso = (n) => `₱${Number(n || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
const fmtDate = (d) => new Date(d).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" });

const daysSince = (d) => Math.floor((Date.now() - new Date(d).getTime()) / 86400000);

export default function BorrowerDetailPage() {
  const { id } = useParams();
  const [borrower, setBorrower] = useState(null);
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [debtModalOpen, setDebtModalOpen] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(null); // holds debt being paid
  const [debtForm, setDebtForm] = useState({ productName: "", quantity: 1, unitPrice: "", dateBorrowed: "", dueInDays: 30 });
  const [payAmount, setPayAmount] = useState("");
  const [error, setError] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    const [borrowersRes, debtsRes] = await Promise.all([
      api.get("/borrowers"),
      api.get("/debts", { params: { borrowerId: id } }),
    ]);
    const b = borrowersRes.data.find((x) => x._id === id);
    setBorrower(b || null);
    setDebts(debtsRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAddDebt = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/debts", { ...debtForm, borrowerId: id, unitPrice: Number(debtForm.unitPrice) });
      setDebtModalOpen(false);
      setDebtForm({ productName: "", quantity: 1, unitPrice: "", dateBorrowed: "", dueInDays: 30 });
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.put(`/debts/${payModalOpen._id}/pay`, { amount: Number(payAmount) });
      setPayModalOpen(null);
      setPayAmount("");
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  if (loading) return <p className="text-muted">Loading…</p>;
  if (!borrower) return <p className="text-muted">Borrower not found. <Link to="/store/borrowers" className="text-ledger-700 underline">Go back</Link></p>;

  return (
    <div>
      <Link to="/store/borrowers" className="text-sm text-ledger-700 hover:underline">← All borrowers</Link>

      <div className="flex flex-wrap items-start justify-between gap-3 mt-3 mb-6">
        <div>
          <h2 className="font-display text-2xl text-ink flex items-center gap-2">
            {borrower.name} <StatusBadge status={borrower.status} />
          </h2>
          {borrower.contactNumber && <p className="text-sm text-muted mt-1">{borrower.contactNumber}</p>}
        </div>
        {borrower.status === "active" && (
          <button className="btn-gold" onClick={() => setDebtModalOpen(true)}>+ Add debt</button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mb-6">
        <div className="card p-3 sm:p-5">
          <p className="text-xs uppercase tracking-wide text-muted font-semibold">Total debt</p>
          <p className="font-display text-lg sm:text-2xl text-ink mt-1">{peso(borrower.totalDebt)}</p>
        </div>
        <div className="card p-3 sm:p-5">
          <p className="text-xs uppercase tracking-wide text-muted font-semibold">Total paid</p>
          <p className="font-display text-lg sm:text-2xl text-ledger-600 mt-1">{peso(borrower.totalPaid)}</p>
        </div>
        <div className="card p-3 sm:p-5">
          <p className="text-xs uppercase tracking-wide text-muted font-semibold">Balance</p>
          <p className={`font-display text-lg sm:text-2xl mt-1 ${borrower.balance > 0 ? "text-rust" : "text-ledger-600"}`}>{peso(borrower.balance)}</p>
        </div>
      </div>

      <h3 className="font-display text-lg text-ink mb-3">Debt records</h3>
      {debts.length === 0 ? (
        <div className="card p-8 text-center text-muted">No debt recorded yet.</div>
      ) : (
        <div className="card overflow-hidden">
         <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-ledger-50 text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Balance</th>
                <th className="px-4 py-3">Borrowed</th>
                <th className="px-4 py-3">Days since</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {debts.map((d) => (
                <tr key={d._id} className="border-t border-ink/5">
                  <td className="px-4 py-3 font-medium">{d.productName}</td>
                  <td className="px-4 py-3">{d.quantity}</td>
                  <td className="px-4 py-3">{peso(d.totalAmount)}</td>
                  <td className="px-4 py-3">{peso(d.balance ?? d.totalAmount - d.amountPaid)}</td>
                  <td className="px-4 py-3 text-muted">{fmtDate(d.dateBorrowed)}</td>
                  <td className="px-4 py-3 text-muted">{daysSince(d.dateBorrowed)}d</td>
                  <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                  <td className="px-4 py-3 text-right">
                    {d.status !== "paid" && (
                      <button className="btn-outline !py-1 !px-3 text-xs" onClick={() => setPayModalOpen(d)}>Pay</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
         </div>
        </div>
      )}

      <Modal open={debtModalOpen} onClose={() => setDebtModalOpen(false)} title="Add debt record">
        <form onSubmit={handleAddDebt} className="space-y-4">
          {error && <div className="text-sm text-rust bg-rust/5 border border-rust/30 rounded-md px-3 py-2">{error}</div>}
          <div>
            <label className="label">Product name</label>
            <input className="input" required value={debtForm.productName} onChange={(e) => setDebtForm({ ...debtForm, productName: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Quantity</label>
              <input type="number" min="1" className="input" required value={debtForm.quantity} onChange={(e) => setDebtForm({ ...debtForm, quantity: e.target.value })} />
            </div>
            <div>
              <label className="label">Unit price (₱)</label>
              <input type="number" min="0" step="0.01" className="input" required value={debtForm.unitPrice} onChange={(e) => setDebtForm({ ...debtForm, unitPrice: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Date borrowed</label>
              <input type="date" className="input" value={debtForm.dateBorrowed} onChange={(e) => setDebtForm({ ...debtForm, dateBorrowed: e.target.value })} />
            </div>
            <div>
              <label className="label">Due in (days)</label>
              <input type="number" min="1" className="input" value={debtForm.dueInDays} onChange={(e) => setDebtForm({ ...debtForm, dueInDays: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full">Add debt</button>
        </form>
      </Modal>

      <Modal open={!!payModalOpen} onClose={() => setPayModalOpen(null)} title={`Pay — ${payModalOpen?.productName || ""}`}>
        {payModalOpen && (
          <form onSubmit={handlePay} className="space-y-4">
            {error && <div className="text-sm text-rust bg-rust/5 border border-rust/30 rounded-md px-3 py-2">{error}</div>}
            <p className="text-sm text-muted">
              Remaining balance: <span className="font-semibold text-ink">{peso(payModalOpen.balance ?? payModalOpen.totalAmount - payModalOpen.amountPaid)}</span>
            </p>
            <div>
              <label className="label">Amount to pay (₱)</label>
              <input type="number" min="0.01" step="0.01" className="input" required value={payAmount} onChange={(e) => setPayAmount(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="btn-outline flex-1"
                onClick={() => setPayAmount(String(payModalOpen.balance ?? payModalOpen.totalAmount - payModalOpen.amountPaid))}
              >
                Pay full balance
              </button>
              <button type="submit" className="btn-primary flex-1">Confirm payment</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
