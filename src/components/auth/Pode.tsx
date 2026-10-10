import type { ReactNode } from "react";
import { useAuth } from "../../context/AuthContext";

interface PodeProps {
  /** Basta ter UMA das permissões informadas. */
  permissao: string | string[];
  children: ReactNode;
}

/** Renderiza os filhos somente se o usuário tiver a(s) permissão(ões). */
export function Pode({ permissao, children }: PodeProps) {
  const { podeAlgum } = useAuth();
  const lista = Array.isArray(permissao) ? permissao : [permissao];
  return podeAlgum(...lista) ? <>{children}</> : null;
}
