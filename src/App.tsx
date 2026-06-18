import { NavLink, Outlet, Route, Routes } from "react-router-dom";
import { Home, Coffee, BookOpen, ClipboardList } from "lucide-react";
import { useT } from "./i18n";
import AccountButton from "./components/AccountButton";
import LangToggle from "./components/LangToggle";

import Dashboard from "./pages/Dashboard";
import Beans from "./pages/Beans";
import Recipes from "./pages/Recipes";
import Brews from "./pages/Brews";
import Session from "./pages/Session";
import BeanEdit from "./pages/BeanEdit";
import RecipeEdit from "./pages/RecipeEdit";
import LogEdit from "./pages/LogEdit";

export default function App() {
  return (
    <Routes>
      {/* Main tabbed app shell */}
      <Route element={<TabLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/beans" element={<Beans />} />
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/logs" element={<Brews />} />
      </Route>

      {/* Full-screen form routes (no tab chrome) */}
      <Route path="/beans/new" element={<BeanEdit />} />
      <Route path="/beans/:id/edit" element={<BeanEdit />} />
      <Route path="/recipes/new" element={<RecipeEdit />} />
      <Route path="/recipes/:id/edit" element={<RecipeEdit />} />
      <Route path="/logs/new" element={<LogEdit />} />
      <Route path="/logs/:id/edit" element={<LogEdit />} />

      {/* Public shared session */}
      <Route path="/s/:logId" element={<Session />} />
    </Routes>
  );
}

function TabLayout() {
  const t = useT();
  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col">
      <header className="safe-top sticky top-0 z-sticky border-b border-cream/10 bg-espresso/90 backdrop-blur-md">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gold text-espresso-900">
            <Coffee className="h-5 w-5" strokeWidth={2.4} />
          </div>
          <div className="leading-none">
            <p className="font-display text-xl font-semibold tracking-tight text-cream">Dialed</p>
            <p className="kicker mt-1 text-[0.6rem]">{t("app.tagline")}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <LangToggle />
            <AccountButton />
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 pb-28 pt-5">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}

function BottomNav() {
  const t = useT();
  const items = [
    { to: "/", label: t("nav.home"), icon: Home, end: true },
    { to: "/beans", label: t("nav.beans"), icon: Coffee, end: false },
    { to: "/recipes", label: t("nav.recipes"), icon: BookOpen, end: false },
    { to: "/logs", label: t("nav.brews"), icon: ClipboardList, end: false },
  ];
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-nav border-t border-cream/10 bg-espresso-900/95 backdrop-blur-lg">
      <div className="mx-auto grid max-w-lg grid-cols-4">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className="flex flex-col items-center gap-1 py-2 text-2xs font-medium"
          >
            {({ isActive }) => (
              <>
                <span
                  className={`flex h-9 w-12 items-center justify-center rounded-lg transition-colors duration-150 ${
                    isActive ? "bg-gold/15 text-gold" : "text-cream-mute"
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2.4 : 2} />
                </span>
                <span className={isActive ? "text-gold" : "text-cream-mute"}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
