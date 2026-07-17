const STYLES = {
  online: "bg-ledger-100 text-ledger-700",
  offline: "bg-ink/5 text-muted",
  active: "bg-ledger-100 text-ledger-700",
  cancelled: "bg-ink/5 text-muted",
  paid: "bg-ledger-100 text-ledger-700",
  partial: "bg-gold-100 text-gold-600",
  unpaid: "bg-ink/5 text-ink/70",
  overdue: "bg-rust/10 text-rust",
};

const LABELS = {
  online: "● Online",
  offline: "● Offline",
};

export default function StatusBadge({ status }) {
  const style = STYLES[status] || "bg-ink/5 text-muted";
  const label = LABELS[status] || status;
  return <span className={`badge ${style}`}>{label}</span>;
}
