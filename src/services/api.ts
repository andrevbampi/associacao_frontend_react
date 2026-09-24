import axios from "axios";
import { authStorage } from "../utils/authStorage";
import { emitUnauthorized } from "../utils/authEvents";

const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Envia o token JWT automaticamente em toda requisição, quando houver um salvo.
api.interceptors.request.use((config) => {
  const token = authStorage.getToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

// Se qualquer requisição autenticada voltar 401 (token expirado, inválido ou
// ausente), avisa o AuthContext para encerrar a sessão. A própria tentativa
// de login é excluída: um 401 nela é só "login ou senha errados", não uma
// sessão expirada.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const rota = axios.isAxiosError(error) ? error.config?.url ?? "" : "";
    if (axios.isAxiosError(error) && error.response?.status === 401 && !rota.includes("/auth/login")) {
      emitUnauthorized();
    }
    return Promise.reject(error);
  }
);

/**
 * O back-end (Spring Boot) devolve erros de regra de negócio como texto puro
 * no corpo da resposta (BusinessRuleException -> HTTP 400). Erros de infra
 * (ex.: 500, timeout, servidor fora do ar) chegam em outros formatos.
 * Esta função tenta extrair sempre a mensagem mais amigável possível.
 */
export function extrairMensagemErro(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.code === "ERR_NETWORK") {
      return "Não foi possível conectar ao servidor. Verifique se o back-end está rodando em " + baseURL + ".";
    }

    const data = error.response?.data;

    if (typeof data === "string" && data.trim().length > 0) {
      return data;
    }

    if (data && typeof data === "object") {
      const possivel = data as Record<string, unknown>;
      if (typeof possivel.message === "string" && possivel.message.trim().length > 0) {
        return possivel.message;
      }
      if (typeof possivel.error === "string" && possivel.error.trim().length > 0) {
        return possivel.error;
      }
    }

    if (error.response?.status) {
      return `Erro inesperado (HTTP ${error.response.status}).`;
    }

    return error.message || "Erro inesperado de comunicação com o servidor.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Erro inesperado.";
}
