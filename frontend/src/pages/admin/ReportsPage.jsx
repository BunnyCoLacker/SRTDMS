import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import StatusBadge from "../../components/StatusBadge.jsx";

const timeAgo = (dateStr) => {
  if (!dateStr) return "Never";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export default function ReportsPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    const { data } = await api.get("/users/report");
    setReport(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchReport();
    const interval = setInterval(fetchReport, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p className="text-muted">Loading…</p>;

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-2xl text-ink">User activity report</h2>
        <p className="text-sm text-muted">Live status refreshes automatically every 15 seconds.</p>
      </div>

      <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mb-6">
        <div className="card p-3 sm:p-5">
          <p className="text-xs uppercase tracking-wide text-muted font-semibold">Total users</p>
          <p className="font-display text-xl sm:text-3xl text-ink mt-1">{report.totalUsers}</p>
        </div>
        <div className="card p-3 sm:p-5">
          <p className="text-xs uppercase tracking-wide text-muted font-semibold">Online</p>
          <p className="font-display text-xl sm:text-3xl text-ledger-600 mt-1">{report.online}</p>
        </div>
        <div className="card p-3 sm:p-5">
          <p className="text-xs uppercase tracking-wide text-muted font-semibold">Offline</p>
          <p className="font-display text-xl sm:text-3xl text-muted mt-1">{report.offline}</p>
        </div>
      </div>

      <div className="card overflow-hidden">
       <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-ledger-50 text-left text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Last seen</th>
              <th className="px-4 py-3">Assigned storages</th>
            </tr>
          </thead>
          <tbody>
            {report.users.map((u) => (
              <tr key={u.id} className="border-t border-ink/5">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 capitalize text-muted">{u.role.replace("_", " ")}</td>
                <td className="px-4 py-3"><StatusBadge status={u.isOnline ? "online" : "offline"} /></td>
                <td className="px-4 py-3 text-muted">{timeAgo(u.lastSeen)}</td>
                <td className="px-4 py-3">
                  {u.assignedStorages.length === 0 ? (
                    <span className="text-muted">—</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {u.assignedStorages.map((s) => (
                        <span key={s.id} className="badge bg-ledger-50 text-ledger-700">{s.name}</span>
                      ))}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
       </div>
      </div>
    </div>
  );
}
