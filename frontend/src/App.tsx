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

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { token, isReady } = useAuth();
  if (!isReady) return null;
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/shops" replace />} />

        {/* Customer */}
        <Route path="/shops" element={<ShopsPage />} />
        <Route path="/shops/:shopId" element={<ShopProductsPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/orders" element={<MyOrdersPage />} />

        {/* Shop owner */}
        <Route path="/owner/shops" element={<OwnerShopsPage />} />
        <Route path="/owner/shops/:shopId/products" element={<OwnerProductsPage />} />
        <Route path="/owner/shops/:shopId/orders" element={<OwnerOrdersPage />} />

        {/* Admin */}
        <Route path="/admin/shops" element={<AdminShopsPage />} />
      </Route>

      <Route
        path="*"
        element={
          user ? <Navigate to="/shops" replace /> : <Navigate to="/login" replace />
        }
      />
    </Routes>
  );
}

export default App;
