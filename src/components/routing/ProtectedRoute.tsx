import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

export const ProtectedRoute: React.FC = () => {
  const { token } = useAuth();

  if (!token) return <Navigate to="/" />;
  return <Outlet />;
}; 