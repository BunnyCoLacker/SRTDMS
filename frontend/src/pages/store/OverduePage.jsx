import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";

const peso = (n) => `₱${Number(n || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
const fmtDate = (d) => new Date(d).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" });
const daysOverdue = (d) => Math.floor((Date.now() - new Date(d).getTime()) / 86400000);

export default function OverduePage() {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/debts/overdue").then(({ data }) => {
      setDebts(data);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-2xl text-ink">Overdue debts</h2>
        <p className="text-sm text-muted">Debts past their due date, sorted by the most overdue first.</p>
      </div>

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : debts.length === 0 ? (
        <div className="card p-8 text-center text-muted">Nothing overdue right now. 🎉</div>
      ) : (
        <div className="card overflow-hidden">
         <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-ledger-50 text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Borrower</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Balance</th>
                <th className="px-4 py-3">Due date</th>
                <th className="px-4 py-3">Overdue by</th>
                <th className="px-4 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {debts.map((d) => (
                <tr key={d._id} className="border-t border-ink/5">
                  <td className="px-4 py-3 font-medium">{d.borrower?.name}</td>
                  <td className="px-4 py-3">{d.productName}</td>
                  <td className="px-4 py-3 text-rust font-semibold">{peso(d.totalAmount - d.amountPaid)}</td>
                  <td className="px-4 py-3 text-muted">{fmtDate(d.dueDate)}</td>
                  <td className="px-4 py-3">
                    <span className="badge bg-rust/10 text-rust">{daysOverdue(d.dueDate)} days</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/store/borrowers/${d.borrower?._id}`} className="btn-outline !py-1 !px-3 text-xs">
                      View
                    </Link>
                  </td>
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
