import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { parametroSistemaService } from "../services/parametroSistemaService";
import { CHAVE_NOME_ASSOCIACAO } from "../types/parametroSistema";
import { useAuth } from "./AuthContext";

const NOME_ASSOCIACAO_PADRAO = "Associação";

interface ParametrosContextValue {
  nomeAssociacao: string;
  recarregar: () => Promise<void>;
}

const ParametrosContext = createContext<ParametrosContextValue | undefined>(undefined);

// Carrega os parâmetros do sistema (ex.: nome da associação) uma vez, assim
// que o usuário está autenticado — a rota /parametro-sistema exige token.
export function ParametrosProvider({ children }: { children: ReactNode }) {
  const { autenticado } = useAuth();
  const [nomeAssociacao, setNomeAssociacao] = useState(NOME_ASSOCIACAO_PADRAO);

  const recarregar = useCallback(async () => {
    try {
      const parametros = await parametroSistemaService.listar();
      const nome = parametros.find((p) => p.chave === CHAVE_NOME_ASSOCIACAO)?.valor;
      setNomeAssociacao(nome && nome.trim() ? nome : NOME_ASSOCIACAO_PADRAO);
    } catch {
      // Se falhar, mantém o nome padrão — não é crítico para o restante do sistema.
    }
  }, []);

  useEffect(() => {
    if (autenticado) {
      recarregar();
    } else {
      setNomeAssociacao(NOME_ASSOCIACAO_PADRAO);
    }
  }, [autenticado, recarregar]);

  return <ParametrosContext.Provider value={{ nomeAssociacao, recarregar }}>{children}</ParametrosContext.Provider>;
}

export function useParametros() {
  const context = useContext(ParametrosContext);
  if (!context) {
    throw new Error("useParametros precisa ser usado dentro de um ParametrosProvider.");
  }
  return context;
}
