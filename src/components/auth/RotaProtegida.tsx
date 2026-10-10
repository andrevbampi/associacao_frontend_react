import { Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { SemPermissaoPage } from "../../pages/SemPermissaoPage";

interface RotaProtegidaProps {
  /** Basta ter UMA das permissões informadas. */
  permissao: string | string[];
}

/** Rota-layout: só mostra as rotas filhas se o usuário tiver a permissão. */
export function RotaProtegida({ permissao }: RotaProtegidaProps) {
  const { podeAlgum } = useAuth();
  const lista = Array.isArray(permissao) ? permissao : [permissao];
  return podeAlgum(...lista) ? <Outlet /> : <SemPermissaoPage />;
}
