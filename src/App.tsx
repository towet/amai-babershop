import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/dashboard/Login";
import ManagerDashboard from "./pages/dashboard/ManagerDashboard";
import BarberDashboard from "./pages/dashboard/BarberDashboard";
import BarbersManagement from "./pages/dashboard/BarbersManagement";
import AppointmentsManagement from "./pages/dashboard/AppointmentsManagement";
import ClientsManagement from "./pages/dashboard/ClientsManagement";
import WalkInManagement from "./pages/dashboard/WalkInManagement";
import Reports from "./pages/dashboard/Reports";
import ReviewsManagement from "./pages/dashboard/ReviewsManagement";
import Settings from "./pages/dashboard/Settings";
import Profile from "./pages/dashboard/Profile";
import DatabaseQuery from "./pages/admin/DatabaseQuery";
import ProtectedRoute from "./components/dashboard/ProtectedRoute";
import { AuthProvider } from "./lib/auth/auth-context";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            
            {/* Dashboard Routes */}
            <Route path="/dashboard">
              {/* Login Route */}
              <Route path="login" element={<Login />} />
              
              {/* Dashboard Home - Redirect based on role */}
              <Route path="" element={<ProtectedRoute>
                <Navigate to="/dashboard/manager" replace />
              </ProtectedRoute>} />
              
              {/* Manager Routes */}
              <Route path="manager" element={
                <ProtectedRoute allowedRoles={["manager"]}>
                  <ManagerDashboard />
                </ProtectedRoute>
              } />
              
              {/* Barber Management */}
              <Route path="barbers" element={
                <ProtectedRoute allowedRoles={["manager"]}>
                  <BarbersManagement />
                </ProtectedRoute>
              } />
              
              {/* Appointments Management */}
              <Route path="appointments" element={
                <ProtectedRoute allowedRoles={["manager", "barber"]}>
                  <AppointmentsManagement />
                </ProtectedRoute>
              } />
              
              {/* Clients Management */}
              <Route path="clients" element={
                <ProtectedRoute allowedRoles={["manager"]}>
                  <ClientsManagement />
                </ProtectedRoute>
              } />
              
              {/* Walk-in Management */}
              <Route path="walk-in" element={
                <ProtectedRoute allowedRoles={["manager"]}>
                  <WalkInManagement />
                </ProtectedRoute>
              } />
              
              {/* Alias for walk-ins route (for both singular and plural paths) */}
              <Route path="walk-ins" element={
                <ProtectedRoute allowedRoles={["manager"]}>
                  <WalkInManagement />
                </ProtectedRoute>
              } />
              
              {/* Reports */}
              <Route path="reports" element={
                <ProtectedRoute allowedRoles={["manager"]}>
                  <Reports />
                </ProtectedRoute>
              } />
              
              {/* Database Query Tool */}
              <Route path="database" element={
                <ProtectedRoute allowedRoles={["manager"]}>
                  <DatabaseQuery />
                </ProtectedRoute>
              } />
              
              {/* Reviews Management */}
              <Route path="reviews" element={
                <ProtectedRoute allowedRoles={["manager"]}>
                  <ReviewsManagement />
                </ProtectedRoute>
              } />

              {/* Settings */}
              <Route path="settings" element={
                <ProtectedRoute allowedRoles={["manager"]}>
                  <Settings />
                </ProtectedRoute>
              } />
              
              {/* Profile Route - Available for both roles */}
              <Route path="profile" element={
                <ProtectedRoute allowedRoles={["manager", "barber"]}>
                  <Profile />
                </ProtectedRoute>
              } />
              
              {/* Barber Routes */}
              <Route path="barber" element={
                <ProtectedRoute allowedRoles={["barber"]}>
                  <BarberDashboard />
                </ProtectedRoute>
              } />
            </Route>
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
