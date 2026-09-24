import type { UsuarioResponse } from "../types/usuario";

const TOKEN_KEY = "associacao.token";
const USUARIO_KEY = "associacao.usuario";

/**
 * Acesso ao localStorage isolado num único lugar, para que tanto o
 * axios (api.ts) quanto o AuthContext leiam/gravem sempre da mesma forma.
 * Cada leitura/escrita é protegida com try/catch: em modo privado ou com o
 * armazenamento bloqueado, o app deve continuar funcionando (só não persiste
 * a sessão entre recarregamentos).
 */
export const authStorage = {
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  getUsuario(): UsuarioResponse | null {
    try {
      const bruto = localStorage.getItem(USUARIO_KEY);
      return bruto ? (JSON.parse(bruto) as UsuarioResponse) : null;
    } catch {
      return null;
    }
  },

  salvar(token: string, usuario: UsuarioResponse): void {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario));
    } catch {
      // Ambiente sem localStorage disponível: a sessão simplesmente não
      // sobrevive a um recarregamento de página.
    }
  },

  limpar(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USUARIO_KEY);
    } catch {
      // Nada a fazer.
    }
  },
};
