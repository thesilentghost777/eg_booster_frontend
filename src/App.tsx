import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Public pages
import WelcomePage from "@/pages/WelcomePage";

// Auth pages
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";

// User pages
import { UserLayout } from "@/components/layout/UserLayout";
import DashboardPage from "@/pages/user/DashboardPage";
import ServicesPage from "@/pages/user/ServicesPage";
import WalletPage from "@/pages/user/WalletPage";
import WheelPage from "@/pages/user/WheelPage";
import ProfilePage from "@/pages/user/ProfilePage";
import OrdersPage from "@/pages/user/OrdersPage";
import OrderDetailPage from "@/pages/user/OrderDetailPage";
import ReferralPage from "@/pages/user/ReferralPage";
import SupportPage from "@/pages/user/SupportPage";
import TransferPage from "@/pages/user/TransferPage";
import FreeViewsPage from "@/pages/user/FreeViewsPage";

// Admin pages
import { AdminLayout } from "@/components/layout/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminOrdersPage from "@/pages/admin/AdminOrdersPage";
import AdminUsersPage from "@/pages/admin/AdminUsersPage";
import AdminServicesPage from "@/pages/admin/AdminServicesPage";
import AdminSettingsPage from "@/pages/admin/AdminSettingsPage";
import AdminWheelPage from "@/pages/admin/AdminWheelPage";
import AdminSupportPage from "@/pages/admin/AdminSupportPage";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <WelcomePage />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />

      {/* Protected user routes */}
      <Route element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/wheel" element={<WheelPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/order/:id" element={<OrderDetailPage />} />
        <Route path="/referral" element={<ReferralPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/transfer" element={<TransferPage />} />
        <Route path="/free-views" element={<FreeViewsPage />} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="services" element={<AdminServicesPage />} />
        <Route path="wheel" element={<AdminWheelPage />} />
        <Route path="support" element={<AdminSupportPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        {/* Configuration du Toaster pour notifications mobiles */}
        <Toaster 
          position="top-center"
          expand={true}
          richColors
          closeButton
          toastOptions={{
            style: {
              margin: '10px',
              padding: '16px',
              fontSize: '14px',
              maxWidth: '90vw',
            },
            duration: 4000,
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;