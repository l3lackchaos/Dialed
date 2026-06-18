import { NavLink, Outlet, Route, Routes } from "react-router-dom";
import { BookOpen, Coffee } from "lucide-react";
import { useT } from "./i18n";
import AccountButton from "./components/AccountButton";
import LangToggle from "./components/LangToggle";
import ThemeToggle from "./components/ThemeToggle";

import Recipes from "./pages/Recipes";
import Tastings from "./pages/Tastings";
import RecipeEdit from "./pages/RecipeEdit";
import RecipeDetail from "./pages/RecipeDetail";
import Session from "./pages/Session";

export default function App() {
  return (
    <Routes>
      <Route element={<TabLayout />}>
        <Route path="/" element={<Recipes />} />
        <Route path="/tastings" element={<Tastings />} />
      </Route>
      <Route path="/r/new" element={<RecipeEdit />} />
      <Route path="/r/:id" element={<RecipeDetail />} />
      <Route path="/r/:id/edit" element={<RecipeEdit />} />
      <Route path="/s/:id" element={<Session />} />
    </Routes>
  );
}

function TabLayout() {
  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col">
      <header className="safe-top sticky top-0 z-40 border-b border-cream/10 bg-espresso/90 backdrop-blur-md">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold text-espresso-900">
            <Coffee className="h-5 w-5" strokeWidth={2.4} />
          </div>
          <p className="font-display text-xl font-semibold text-cream">Dialed</p>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
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
    { to: "/", label: t("nav.recipes"), icon: BookOpen, end: true },
    { to: "/tastings", label: t("nav.tastings"), icon: Coffee, end: false },
  ];
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-cream/10 bg-espresso-800/95 backdrop-blur-lg">
      <div className="mx-auto grid max-w-lg grid-cols-2">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className="flex flex-col items-center gap-1 py-2.5">
            {({ isActive }) => (
              <>
                <Icon className={`h-6 w-6 transition-colors ${isActive ? "text-gold" : "text-cream-mute"}`} strokeWidth={isActive ? 2.4 : 2} />
                <span className={`text-xs font-medium ${isActive ? "text-gold" : "text-cream-mute"}`}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
