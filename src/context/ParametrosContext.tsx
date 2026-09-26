import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { publicConfigService } from "../services/publicConfigService";
import { useAuth } from "./AuthContext";

const NOME_ASSOCIACAO_PADRAO = "Associação";

interface ParametrosContextValue {
  nomeAssociacao: string;
  logoUrl: string | null;
  recarregar: () => Promise<void>;
}

const ParametrosContext = createContext<ParametrosContextValue | undefined>(undefined);

// Carrega o nome/logo da associação uma vez, assim que o usuário está
// autenticado. Reaproveita o endpoint público (GET /api/public/config): os
// dados são os mesmos que a tela de login usa, então não faz sentido ter
// dois jeitos diferentes de buscá-los.
export function ParametrosProvider({ children }: { children: ReactNode }) {
  const { autenticado } = useAuth();
  const [nomeAssociacao, setNomeAssociacao] = useState(NOME_ASSOCIACAO_PADRAO);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const recarregar = useCallback(async () => {
    try {
      const config = await publicConfigService.buscar();
      setNomeAssociacao(config.nomeAssociacao?.trim() ? config.nomeAssociacao : NOME_ASSOCIACAO_PADRAO);
      setLogoUrl(config.logoUrl ?? null);
    } catch {
      // Se falhar, mantém o nome padrão — não é crítico para o restante do sistema.
    }
  }, []);

  useEffect(() => {
    if (autenticado) {
      recarregar();
    } else {
      setNomeAssociacao(NOME_ASSOCIACAO_PADRAO);
      setLogoUrl(null);
    }
  }, [autenticado, recarregar]);

  return <ParametrosContext.Provider value={{ nomeAssociacao, logoUrl, recarregar }}>{children}</ParametrosContext.Provider>;
}

export function useParametros() {
  const context = useContext(ParametrosContext);
  if (!context) {
    throw new Error("useParametros precisa ser usado dentro de um ParametrosProvider.");
  }
  return context;
}
