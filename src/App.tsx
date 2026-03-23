// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import RoleRedirect from "./routes/RoleRedirect";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";

// Manufacturer
import ManufacturerDashboard from "./pages/manufacturer/ManufacturerDashboard";
import WasteUploadPage from "./pages/manufacturer/WasteUploadPage";
import RecyclerListPage from "./pages/manufacturer/RecyclerListPage";
import RecyclerDetailPage from "./pages/manufacturer/RecyclerDetailPage";
import CompareRecyclersPage from "./pages/manufacturer/CompareRecyclersPage";
import CompanyProfilePage from "./pages/manufacturer/CompanyProfilePage";
import ManageUsersPage from "./pages/manufacturer/ManageUsersPage";
import RequestsPage from "./pages/manufacturer/RequestsPage";
import ManufacturerRequestDetailsPage from "./pages/manufacturer/RequestDetailsPage";
import RecyclingRecordsPage from "./pages/manufacturer/RecyclingRecordsPage";

// 🔥 ADD THIS IMPORT (already present, just confirming)
import RequestDetailsPage from "./pages/manufacturer/RequestDetailsPage";

// Recycler
import RecyclerDashboard from "./pages/recycler/RecyclerDashboard";
import PricingConfigPage from "./pages/recycler/PricingConfigPage";
import EditProfilePage from "./pages/recycler/EditProfilePage";
import RecyclerRequestDetailsPage from "./pages/recycler/RequestDetailsPage";
import RecyclerRecordsPage from "./pages/recycler/RecordsPage";

import NotFound from "./pages/NotFound";
import ProtectedRoute from "./routes/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/redirect" element={<RoleRedirect />} />

        {/* Manufacturer Protected Routes */}
        <Route
          path="/manufacturer/dashboard"
          element={
            <ProtectedRoute role="manufacturer">
              <ManufacturerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manufacturer/upload"
          element={
            <ProtectedRoute role="manufacturer">
              <WasteUploadPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manufacturer/recyclers"
          element={
            <ProtectedRoute role="manufacturer">
              <RecyclerListPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manufacturer/recycler/:id"
          element={
            <ProtectedRoute role="manufacturer">
              <RecyclerDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manufacturer/compare"
          element={
            <ProtectedRoute role="manufacturer">
              <CompareRecyclersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manufacturer/profile"
          element={
            <ProtectedRoute role="manufacturer">
              <CompanyProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manufacturer/users"
          element={
            <ProtectedRoute role="manufacturer">
              <ManageUsersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manufacturer/requests"
          element={
            <ProtectedRoute role="manufacturer">
              <RequestsPage />
            </ProtectedRoute>
          }
        />

        {/* ✅ VIEW REQUEST DETAILS (already existed) */}
        <Route
          path="/manufacturer/requests/:id"
          element={
            <ProtectedRoute role="manufacturer">
              <ManufacturerRequestDetailsPage />
            </ProtectedRoute>
          }
        />

        {/* ✅ CREATE REQUEST (THIS WAS MISSING – FIX FOR 404) */}
        <Route
          path="/manufacturer/request/:recyclerId"
          element={
            <ProtectedRoute role="manufacturer">
              <RequestDetailsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manufacturer/records"
          element={
            <ProtectedRoute role="manufacturer">
              <RecyclingRecordsPage />
            </ProtectedRoute>
          }
        />

        {/* Recycler Protected Routes */}
        <Route
          path="/recycler/dashboard"
          element={
            <ProtectedRoute role="recycler">
              <RecyclerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recycler/pricing"
          element={
            <ProtectedRoute role="recycler">
              <PricingConfigPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recycler/profile"
          element={
            <ProtectedRoute role="recycler">
              <EditProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recycler/requests/:id"
          element={
            <ProtectedRoute role="recycler">
              <RecyclerRequestDetailsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recycler/records"
          element={
            <ProtectedRoute role="recycler">
              <RecyclerRecordsPage />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
