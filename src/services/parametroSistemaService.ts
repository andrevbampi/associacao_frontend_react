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

  async uploadLogo(arquivo: File): Promise<void> {
    const formData = new FormData();
    formData.append("arquivo", arquivo);
    await api.put("/parametro-sistema/logo", formData, { headers: { "Content-Type": "multipart/form-data" } });
  },

  async removerLogo(): Promise<void> {
    await api.delete("/parametro-sistema/logo");
  },
};
