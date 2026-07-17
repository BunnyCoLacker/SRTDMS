import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import Modal from "../../components/Modal.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";

const emptyForm = { name: "", email: "", password: "", role: "store_owner" };

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await api.get("/users");
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (u) => {
    setEditing(u);
    setForm({ name: u.name, email: u.email, password: "", role: u.role });
    setError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editing) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await api.put(`/users/${editing.id}`, payload);
      } else {
        await api.post("/users", form);
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  const toggleActive = async (u) => {
    await api.put(`/users/${u.id}`, { isActive: !u.isActive });
    fetchUsers();
  };

  const handleDelete = async (u) => {
    if (!confirm(`Delete user "${u.name}"? This cannot be undone.`)) return;
    await api.delete(`/users/${u.id}`);
    fetchUsers();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="font-display text-2xl text-ink">Users</h2>
          <p className="text-sm text-muted">Create and manage admin and store owner accounts.</p>
        </div>
        <button className="btn-gold" onClick={openCreate}>+ New user</button>
      </div>

      <div className="card overflow-hidden">
       <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-ledger-50 text-left text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-muted">Loading…</td></tr>
            )}
            {!loading && users.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-muted">No users yet.</td></tr>
            )}
            {users.map((u) => (
              <tr key={u.id} className="border-t border-ink/5">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-muted">{u.email}</td>
                <td className="px-4 py-3 capitalize">{u.role.replace("_", " ")}</td>
                <td className="px-4 py-3"><StatusBadge status={u.isOnline ? "online" : "offline"} /></td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleActive(u)}
                    className={`badge ${u.isActive ? "bg-ledger-100 text-ledger-700" : "bg-rust/10 text-rust"}`}
                  >
                    {u.isActive ? "Enabled" : "Disabled"}
                  </button>
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button className="btn-ghost !px-2" onClick={() => openEdit(u)}>Edit</button>
                  <button className="btn-ghost !px-2 !text-rust" onClick={() => handleDelete(u)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
       </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit user" : "New user"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-sm text-rust bg-rust/5 border border-rust/30 rounded-md px-3 py-2">{error}</div>}
          <div>
            <label className="label">Full name</label>
            <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="label">{editing ? "New password (optional)" : "Password"}</label>
            <input type="password" className="input" required={!editing} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div>
            <label className="label">Role</label>
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="store_owner">Store owner</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" className="btn-primary w-full">{editing ? "Save changes" : "Create user"}</button>
        </form>
      </Modal>
    </div>
  );
}
