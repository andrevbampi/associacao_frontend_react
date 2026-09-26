import { api } from "./api";
import type { PublicConfig } from "../types/publicConfig";

// Endpoint público (sem token) usado pela tela de login. Como o mesmo cliente
// axios é usado, o interceptor pode anexar um token salvo de uma sessão
// anterior — inofensivo aqui, pois o back-end libera esta rota para todos.
export const publicConfigService = {
  async buscar(): Promise<PublicConfig> {
    const { data } = await api.get<PublicConfig>("/public/config");
    return data;
  },
};
