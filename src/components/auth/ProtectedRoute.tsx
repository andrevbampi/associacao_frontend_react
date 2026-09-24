import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Loading } from "../common/Loading";

export function ProtectedRoute() {
  const { autenticado, carregando } = useAuth();
  const location = useLocation();

  if (carregando) {
    return <Loading texto="Verificando sessão..." />;
  }

  if (!autenticado) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
