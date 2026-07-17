import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="5" y1="5" x2="19" y2="19" />
    <line x1="19" y1="5" x2="5" y2="19" />
  </svg>
);

function SidebarContent({ navItems, eyebrow, storage, user, logout, onNavigate }) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-gold-300 font-semibold">{eyebrow}</p>
        <h1 className="font-display text-xl mt-1">Utang Ledger</h1>
        {storage && (
          <p className="text-xs text-ledger-200 mt-2 truncate">
            Storage: <span className="text-gold-300">{storage.name}</span>
          </p>
        )}
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive ? "bg-ledger-700 text-paper" : "text-ledger-100/80 hover:bg-ledger-700/60"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-ledger-100/10">
        <p className="text-sm font-medium truncate">{user?.name}</p>
        <p className="text-xs text-ledger-200 truncate mb-3">{user?.email}</p>
        <button onClick={logout} className="btn-outline w-full !text-paper !border-paper/30 hover:!bg-ledger-700">
          Sign out
        </button>
      </div>
    </div>
  );
}

export default function Shell({ navItems, eyebrow, children }) {
  const { user, storage, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-paper flex flex-col md:flex-row">
      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between bg-ledger-800 text-paper px-4 py-3">
        <button onClick={() => setDrawerOpen(true)} aria-label="Open menu" className="p-1 -ml-1">
          <MenuIcon />
        </button>
        <div className="text-center">
          <h1 className="font-display text-lg leading-none">Utang Ledger</h1>
          {storage && <p className="text-[11px] text-gold-300 mt-0.5 truncate max-w-[180px]">{storage.name}</p>}
        </div>
        <div className="w-7" />
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setDrawerOpen(false)} />
          <div className="relative w-72 max-w-[80%] bg-ledger-800 text-paper shadow-xl">
            <button
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
              className="absolute top-4 right-4 text-ledger-100/80 hover:text-paper"
            >
              <CloseIcon />
            </button>
            <SidebarContent
              navItems={navItems}
              eyebrow={eyebrow}
              storage={storage}
              user={user}
              logout={logout}
              onNavigate={() => setDrawerOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 bg-ledger-800 text-paper flex-col md:sticky md:top-0 md:h-screen">
        <SidebarContent navItems={navItems} eyebrow={eyebrow} storage={storage} user={user} logout={logout} />
      </aside>

      <main className="flex-1 min-w-0 pb-20 md:pb-0">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8">{children}</div>
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-ledger-800 border-t border-ledger-100/10 flex">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex-1 text-center py-2.5 text-xs font-medium ${
                isActive ? "text-gold-300" : "text-ledger-100/70"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
