import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";
import Modal from "../../components/Modal.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";

const peso = (n) => `₱${Number(n || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

export default function BorrowersPage() {
  const [borrowers, setBorrowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", contactNumber: "", notes: "" });
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("active");

  const fetchBorrowers = async () => {
    setLoading(true);
    const { data } = await api.get("/borrowers");
    setBorrowers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchBorrowers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/borrowers", form);
      setModalOpen(false);
      setForm({ name: "", contactNumber: "", notes: "" });
      fetchBorrowers();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleCancel = async (b) => {
    if (!confirm(`Cancel borrower "${b.name}"? Their record will be kept but marked cancelled.`)) return;
    await api.put(`/borrowers/${b._id}/cancel`);
    fetchBorrowers();
  };

  const visible = borrowers.filter((b) => (filter === "all" ? true : b.status === filter));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="font-display text-2xl text-ink">Borrowers</h2>
          <p className="text-sm text-muted">Everyone currently keeping a tab in this store.</p>
        </div>
        <button className="btn-gold" onClick={() => setModalOpen(true)}>+ New borrower</button>
      </div>

      <div className="flex gap-2 mb-4">
        {["active", "cancelled", "all"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`btn-outline !py-1.5 !px-3 text-xs capitalize ${filter === f ? "!bg-ledger-700 !text-paper" : ""}`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : visible.length === 0 ? (
        <div className="card p-8 text-center text-muted">No {filter !== "all" ? filter : ""} borrowers yet.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((b) => (
            <Link
              key={b._id}
              to={`/store/borrowers/${b._id}`}
              className="card p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all block"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-display text-lg text-ink">{b.name}</h3>
                <StatusBadge status={b.status} />
              </div>
              {b.contactNumber && <p className="text-xs text-muted mb-3">{b.contactNumber}</p>}
              <div className="flex items-end justify-between mt-3">
                <div>
                  <p className="text-xs uppercase text-muted font-semibold">Balance</p>
                  <p className={`font-display text-xl ${b.balance > 0 ? "text-rust" : "text-ledger-600"}`}>
                    {peso(b.balance)}
                  </p>
                </div>
                {b.overdueCount > 0 && (
                  <span className="badge bg-rust/10 text-rust">{b.overdueCount} overdue</span>
                )}
              </div>
              {b.status === "active" && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleCancel(b);
                  }}
                  className="btn-ghost !text-rust !px-0 mt-3 text-xs"
                >
                  Cancel borrower
                </button>
              )}
            </Link>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New borrower">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-sm text-rust bg-rust/5 border border-rust/30 rounded-md px-3 py-2">{error}</div>}
          <div>
            <label className="label">Borrower name</label>
            <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Contact number (optional)</label>
            <input className="input" value={form.contactNumber} onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} />
          </div>
          <div>
            <label className="label">Notes (optional)</label>
            <textarea className="input" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <button type="submit" className="btn-primary w-full">Add borrower</button>
        </form>
      </Modal>
    </div>
  );
}
