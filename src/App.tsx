import AdminPermissions from "./pages/admin/AdminPermissions";
import CMSPage from "./pages/CMSPage";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { TopNavBar } from "./components/TopNavBar";
import { Footer } from "./components/Footer";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import GiftBoxDetail from "./pages/GiftBoxDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Wishlist from "./pages/Wishlist";
import Account from "./pages/Account";
import CustomBoxBuilder from "./pages/CustomBoxBuilder";
import AdminLayout from "./layouts/AdminLayout";
import AdminSetup from "./pages/admin/AdminSetup";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminProductForm from "./pages/admin/AdminProductForm";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminGiftBoxes from "./pages/admin/AdminGiftBoxes";
import AdminGiftBoxForm from "./pages/admin/AdminGiftBoxForm";
import AdminBanners from "./pages/admin/AdminBanners";
import AdminCMS from "./pages/admin/AdminCMS";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminDeliveryCharges from "./pages/admin/AdminDeliveryCharges";
import AdminReports from "./pages/admin/AdminReports";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs";
import AdminSettings from "./pages/admin/AdminSettings";

function CustomerLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <TopNavBar />
      <main className="flex-1 pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function PlaceholderPage({ name, phase }: { name: string, phase: number }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center">
      <h2 className="text-2xl font-bold mb-2">{name}</h2>
      <p className="text-on-surface-variant">Coming in Phase {phase}.</p>
    </div>
  );
}


import { useEffect } from 'react';
import { auth } from './lib/firebase';
import { useAuthStore } from './store/useAuthStore';

export default function App() {
  useEffect(() => {
    const unsubscribe = auth.onIdTokenChanged(async (user) => {
      if (user) {
        const token = await user.getIdToken();
        useAuthStore.setState({ token, isAuthenticated: true });
      } else {
        useAuthStore.setState({ token: null, user: null, isAuthenticated: false });
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CustomerLayout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="gift-boxes/:id" element={<GiftBoxDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="account" element={<Account />} />
          <Route path="login" element={<Account />} />
          <Route path="builder" element={<CustomBoxBuilder />} />
          <Route path=":slug" element={<CMSPage />} />
        </Route>
        
        <Route path="/admin/setup" element={<AdminSetup />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<AdminProductForm />} />
          <Route path="products/:id/edit" element={<AdminProductForm />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="gift-boxes" element={<AdminGiftBoxes />} />
          <Route path="gift-boxes/new" element={<AdminGiftBoxForm />} />
          <Route path="gift-boxes/:id/edit" element={<AdminGiftBoxForm />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="delivery" element={<AdminDeliveryCharges />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="banners" element={<AdminBanners />} />
          <Route path="cms" element={<AdminCMS />} />
                    <Route path="settings" element={<AdminSettings />} />
          <Route path="settings-ai" element={<PlaceholderPage name="AI Settings" phase={6} />} />
          <Route path="settings-payment" element={<PlaceholderPage name="Payment Settings" phase={6} />} />
          <Route path="security" element={<PlaceholderPage name="Security" phase={7} />} />
          <Route path="analytics" element={<AdminReports />} />
          <Route path="permissions" element={<AdminPermissions />} />
          <Route path="audit-logs" element={<AdminAuditLogs />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
