// src/routes/RoleRedirect.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const RoleRedirect = () => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />; // landing page if not logged in
  }

  if (role === "manufacturer") {
    return <Navigate to="/manufacturer/dashboard" replace />;
  }

  if (role === "recycler") {
    return <Navigate to="/recycler/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
};

export default RoleRedirect;
