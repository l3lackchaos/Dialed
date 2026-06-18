import { NavLink, Route, Routes } from "react-router-dom";
import { LayoutDashboard, Coffee, BookOpen, ClipboardList } from "lucide-react";
import Dashboard from "./pages/Dashboard";
import Beans from "./pages/Beans";
import Recipes from "./pages/Recipes";
import BrewLogs from "./pages/BrewLogs";
import Session from "./pages/Session";
import AccountButton from "./components/AccountButton";

const NAV = [
  { to: "/", label: "Home", icon: LayoutDashboard, end: true },
  { to: "/beans", label: "Beans", icon: Coffee, end: false },
  { to: "/recipes", label: "Recipes", icon: BookOpen, end: false },
  { to: "/logs", label: "Brews", icon: ClipboardList, end: false },
];

export default function App() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col">
      <BrandBar />

      <main className="flex-1 px-4 pb-28 pt-4 sm:px-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/beans" element={<Beans />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/logs" element={<BrewLogs />} />
          <Route path="/s/:logId" element={<Session />} />
        </Routes>
      </main>

      <BottomNav />
    </div>
  );
}

function BrandBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-gold/10 bg-espresso/80 backdrop-blur-md">
      <div className="flex items-center gap-3 px-4 py-3.5 sm:px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-sheen text-espresso-900 shadow-gold">
          <Coffee className="h-5 w-5" strokeWidth={2.4} />
        </div>
        <div className="leading-none">
          <h1 className="font-display text-xl font-semibold tracking-tight text-cream">
            Dialed
          </h1>
          <p className="mt-0.5 text-[0.65rem] uppercase tracking-[0.25em] text-gold/70">
            Pour-Over Notebook
          </p>
        </div>
        <div className="ml-auto">
          <AccountButton />
        </div>
      </div>
    </header>
  );
}

function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-gold/15 bg-espresso-900/90 backdrop-blur-lg safe-bottom">
      <div className="mx-auto grid max-w-3xl grid-cols-4">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-2.5 text-[0.7rem] font-medium transition-colors ${
                isActive ? "text-gold" : "text-cream-mute hover:text-cream-dim"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                    isActive ? "bg-gold/15 text-gold" : "text-current"
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2.4 : 2} />
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
