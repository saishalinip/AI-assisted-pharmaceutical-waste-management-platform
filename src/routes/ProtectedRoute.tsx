// src/routes/ProtectedRoute.tsx
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  role: "manufacturer" | "recycler";
  children: ReactNode;
}

const ProtectedRoute = ({ role, children }: ProtectedRouteProps) => {
  const { user, role: userRole, loading } = useAuth();

  if (loading) {
    return <div className="p-10 text-center">Checking authentication...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (userRole !== role) {
    return <div className="p-10 text-center text-red-500">Unauthorized</div>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
