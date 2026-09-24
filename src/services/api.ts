import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

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
