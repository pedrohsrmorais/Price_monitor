import { Navigate } from "react-router-dom";
import { isAuthenticated } from "@/components/auth/isAuthenticated";

//src/components/auth/ProtectedRoute.tsx
export function ProtectedRoute({ children }: { children: JSX.Element }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
