import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./state/auth";
import { AppLayout } from "./ui/AppLayout";
import { LoginPage } from "./views/auth/LoginPage";
import { RegisterPage } from "./views/auth/RegisterPage";
import { ShopsPage } from "./views/customer/ShopsPage";
import { ShopProductsPage } from "./views/customer/ShopProductsPage";
import { CartPage } from "./views/customer/CartPage";
import { MyOrdersPage } from "./views/customer/MyOrdersPage";
import { OwnerShopsPage } from "./views/owner/OwnerShopsPage";
import { OwnerProductsPage } from "./views/owner/OwnerProductsPage";
import { OwnerOrdersPage } from "./views/owner/OwnerOrdersPage";
import { AdminShopsPage } from "./views/admin/AdminShopsPage";
import type { Role } from "./lib/types";
import { Spinner } from "./components/ui/Spinner";
import { ForbiddenPage } from "./views/system/ForbiddenPage";
import { NotFoundPage } from "./views/system/NotFoundPage";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { token, isReady } = useAuth();
  if (!isReady) {
    return (
      <div className="grid min-h-dvh place-items-center bg-slate-50 px-4">
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-600 text-white shadow-sm">
            LB
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
            <Spinner size="sm" />
            Loading…
          </div>
        </div>
      </div>
    );
  }
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function homeForRole(role: Role | undefined) {
  switch (role) {
    case "shopOwner":
      return "/owner/shops";
    case "admin":
      return "/admin/shops";
    default:
      return "/shops";
  }
}

function RequireRole({
  roles,
  children,
}: {
  roles: Role[];
  children: React.ReactNode;
}) {
  const { user, isReady } = useAuth();
  if (!isReady) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/forbidden" replace />;
  return children;
}

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forbidden" element={<ForbiddenPage />} />

      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to={homeForRole(user?.role)} replace />} />

        {/* Customer */}
        <Route
          path="/shops"
          element={
            <RequireRole roles={["customer"]}>
              <ShopsPage />
            </RequireRole>
          }
        />
        <Route
          path="/shops/:shopId"
          element={
            <RequireRole roles={["customer"]}>
              <ShopProductsPage />
            </RequireRole>
          }
        />
        <Route
          path="/cart"
          element={
            <RequireRole roles={["customer"]}>
              <CartPage />
            </RequireRole>
          }
        />
        <Route
          path="/orders"
          element={
            <RequireRole roles={["customer"]}>
              <MyOrdersPage />
            </RequireRole>
          }
        />

        {/* Shop owner */}
        <Route
          path="/owner/shops"
          element={
            <RequireRole roles={["shopOwner"]}>
              <OwnerShopsPage />
            </RequireRole>
          }
        />
        <Route
          path="/owner/shops/:shopId/products"
          element={
            <RequireRole roles={["shopOwner"]}>
              <OwnerProductsPage />
            </RequireRole>
          }
        />
        <Route
          path="/owner/shops/:shopId/orders"
          element={
            <RequireRole roles={["shopOwner"]}>
              <OwnerOrdersPage />
            </RequireRole>
          }
        />

        {/* Admin */}
        <Route
          path="/admin/shops"
          element={
            <RequireRole roles={["admin"]}>
              <AdminShopsPage />
            </RequireRole>
          }
        />
      </Route>

      <Route
        path="*"
        element={
          user ? (
            <NotFoundPage />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

export default App;
