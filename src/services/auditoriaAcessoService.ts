import { api } from "./api";
import type { AuditoriaAcesso } from "../types/acesso";

export interface AuditoriaAcessoFiltro {
  dataInicio?: string;
  dataFim?: string;
  entidade?: string;
  login?: string;
}

export const auditoriaAcessoService = {
  async listar(filtro?: AuditoriaAcessoFiltro): Promise<AuditoriaAcesso[]> {
    const { data } = await api.get<AuditoriaAcesso[]>("/auditoria-acesso/", { params: filtro });
    return data;
  },
};
