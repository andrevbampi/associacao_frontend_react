import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { authService } from "../services/authService";
import { authStorage } from "../utils/authStorage";
import { onUnauthorized } from "../utils/authEvents";
import { extrairMensagemErro } from "../services/api";
import type { UsuarioResponse } from "../types/usuario";

interface AuthContextValue {
  usuario: UsuarioResponse | null;
  autenticado: boolean;
  carregando: boolean;
  mensagemSessao: string | null;
  login: (login: string, senha: string) => Promise<void>;
  logout: () => void;
  limparMensagemSessao: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioResponse | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [mensagemSessao, setMensagemSessao] = useState<string | null>(null);

  const logout = useCallback(() => {
    authStorage.limpar();
    setUsuario(null);
  }, []);

  // Ao abrir o app, tenta restaurar a sessão a partir do token salvo,
  // confirmando com o back-end que ele ainda é válido (GET /auth/me).
  useEffect(() => {
    const tokenSalvo = authStorage.getToken();
    const usuarioSalvo = authStorage.getUsuario();

    if (!tokenSalvo) {
      setCarregando(false);
      return;
    }

    // Mostra os dados salvos imediatamente (sem esperar a rede) e confirma
    // em segundo plano; se o token não for mais válido, authService.me()
    // dispara 401 -> onUnauthorized -> logout().
    if (usuarioSalvo) {
      setUsuario(usuarioSalvo);
    }

    authService
      .me()
      .then((atual) => {
        setUsuario(atual);
        authStorage.salvar(tokenSalvo, atual);
      })
      .catch(() => {
        // onUnauthorized já cuida de limpar a sessão nesse caso.
      })
      .finally(() => setCarregando(false));
  }, []);

  useEffect(() => {
    return onUnauthorized(() => {
      const haviaSessao = authStorage.getToken() !== null;
      logout();
      if (haviaSessao) {
        setMensagemSessao("Sua sessão expirou. Faça login novamente.");
      }
    });
  }, [logout]);

  const login = useCallback(async (loginInformado: string, senha: string) => {
    try {
      const resposta = await authService.login({ login: loginInformado, senha });
      authStorage.salvar(resposta.token, resposta.usuario);
      setUsuario(resposta.usuario);
      setMensagemSessao(null);
    } catch (error) {
      throw new Error(extrairMensagemErro(error));
    }
  }, []);

  const limparMensagemSessao = useCallback(() => setMensagemSessao(null), []);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        autenticado: usuario !== null,
        carregando,
        mensagemSessao,
        login,
        logout,
        limparMensagemSessao,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth precisa ser usado dentro de um AuthProvider.");
  }
  return context;
}
