import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import Modal from "../../components/Modal.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";

const emptyForm = { name: "", description: "", allowedUsers: [] };

export default function StoragesPage() {
  const [storages, setStorages] = useState([]);
  const [storeOwners, setStoreOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const [storageRes, userRes] = await Promise.all([api.get("/storages"), api.get("/users")]);
    setStorages(storageRes.data);
    setStoreOwners(userRes.data.filter((u) => u.role === "store_owner"));
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({
      name: s.name,
      description: s.description || "",
      allowedUsers: s.allowedUsers.map((u) => u._id || u),
    });
    setError("");
    setModalOpen(true);
  };

  const toggleUser = (id) => {
    setForm((f) => ({
      ...f,
      allowedUsers: f.allowedUsers.includes(id)
        ? f.allowedUsers.filter((u) => u !== id)
        : [...f.allowedUsers, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editing) {
        await api.put(`/storages/${editing._id}`, form);
      } else {
        await api.post("/storages", form);
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  const toggleActive = async (s) => {
    await api.put(`/storages/${s._id}`, { isActive: !s.isActive });
    fetchData();
  };

  const handleDelete = async (s) => {
    if (!confirm(`Delete storage "${s.name}"? Store owners will lose access.`)) return;
    await api.delete(`/storages/${s._id}`);
    fetchData();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="font-display text-2xl text-ink">Storages</h2>
          <p className="text-sm text-muted">
            Create a named storage domain and choose which store owners may access it.
          </p>
        </div>
        <button className="btn-gold" onClick={openCreate}>+ New storage</button>
      </div>

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : storages.length === 0 ? (
        <div className="card p-8 text-center text-muted">No storages yet. Create one to get started.</div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {storages.map((s) => (
            <div key={s._id} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-lg text-ink">{s.name}</h3>
                  {s.description && <p className="text-sm text-muted mt-0.5">{s.description}</p>}
                </div>
                <StatusBadge status={s.isActive ? "active" : "cancelled"} />
              </div>
              <div className="mt-4">
                <p className="text-xs uppercase tracking-wide text-muted font-semibold mb-1.5">Allowed users</p>
                {s.allowedUsers.length === 0 ? (
                  <p className="text-sm text-muted">No users assigned yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {s.allowedUsers.map((u) => (
                      <span key={u._id} className="badge bg-ledger-50 text-ledger-700">{u.name}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-4 flex gap-2">
                <button className="btn-outline !py-1.5 !px-3 text-xs" onClick={() => openEdit(s)}>Edit</button>
                <button
                  className="btn-outline !py-1.5 !px-3 text-xs"
                  onClick={() => toggleActive(s)}
                >
                  {s.isActive ? "Deactivate" : "Activate"}
                </button>
                <button className="btn-ghost !py-1.5 !px-3 text-xs !text-rust" onClick={() => handleDelete(s)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit storage" : "New storage"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-sm text-rust bg-rust/5 border border-rust/30 rounded-md px-3 py-2">{error}</div>}
          <div>
            <label className="label">Storage name</label>
            <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Aling Nena's Store" />
          </div>
          <div>
            <label className="label">Description (optional)</label>
            <input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="label">Users allowed to access this storage</label>
            {storeOwners.length === 0 ? (
              <p className="text-sm text-muted">No store owner accounts yet — create one first.</p>
            ) : (
              <div className="max-h-40 overflow-y-auto border border-ink/10 rounded-md divide-y divide-ink/5">
                {storeOwners.map((u) => (
                  <label key={u.id} className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-ledger-50">
                    <input
                      type="checkbox"
                      checked={form.allowedUsers.includes(u.id)}
                      onChange={() => toggleUser(u.id)}
                    />
                    <span>{u.name}</span>
                    <span className="text-muted text-xs">({u.email})</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <button type="submit" className="btn-primary w-full">{editing ? "Save changes" : "Create storage"}</button>
        </form>
      </Modal>
    </div>
  );
}
