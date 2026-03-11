import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../state/auth";
import { useCart } from "../state/cart";
import { Button } from "../components/ui/Button";
import { cn } from "../lib/utils";

function NavItem({
  to,
  label,
  end,
}: {
  to: string;
  label: string;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "rounded-xl px-3 py-2 text-sm font-medium transition",
          isActive
            ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100"
            : "text-slate-700 hover:bg-slate-100"
        )
      }
    >
      {label}
    </NavLink>
  );
}

export function AppLayout() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-2xl bg-indigo-600 text-white shadow-sm">
              LB
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">
                Local Business Ordering
              </div>
              <div className="text-xs text-slate-500">
                {user?.role === "customer"
                  ? "Customer"
                  : user?.role === "shopOwner"
                    ? "Shop Owner"
                    : "Admin"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-medium text-slate-900">
                {user?.name}
              </div>
              <div className="text-xs text-slate-500">{user?.email}</div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                logout();
                navigate("/login", { replace: true });
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[240px_1fr]">
        <aside className="md:sticky md:top-[72px] md:self-start">
          <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
            <nav className="flex flex-col gap-1">
              {user?.role === "customer" ? (
                <>
                  <NavItem to="/shops" label="Shops" end />
                  <NavItem to="/cart" label={`Cart (${items.length})`} />
                  <NavItem to="/orders" label="My orders" />
                </>
              ) : null}
              {user?.role === "shopOwner" ? (
                <>
                  <div className="my-2 border-t border-slate-100" />
                  <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Owner
                  </div>
                  <NavItem to="/owner/shops" label="My shops" />
                  <NavItem to="/owner/orders" label="All orders" />
                </>
              ) : null}
              {user?.role === "admin" ? (
                <>
                  <div className="my-2 border-t border-slate-100" />
                  <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Admin
                  </div>
                  <NavItem to="/admin/shops" label="Verify shops" />
                </>
              ) : null}
            </nav>
          </div>
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

