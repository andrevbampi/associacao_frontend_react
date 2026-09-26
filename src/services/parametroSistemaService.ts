import { api } from "./api";
import type { ParametroSistema, ParametroSistemaRequest } from "../types/parametroSistema";

export const parametroSistemaService = {
  async listar(): Promise<ParametroSistema[]> {
    const { data } = await api.get<ParametroSistema[]>("/parametro-sistema/");
    return data;
  },

  async atualizar(parametro: ParametroSistemaRequest): Promise<ParametroSistema> {
    const { data } = await api.put<ParametroSistema>("/parametro-sistema/", parametro);
    return data;
  },
};
