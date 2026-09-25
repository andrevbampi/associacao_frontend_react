import { api } from "./api";
import type { HistoricoMembroRequest, HistoricoMembroResponse } from "../types/historicoMembro";

export const historicoMembroService = {
  async listarPorMembro(idMembro: number): Promise<HistoricoMembroResponse[]> {
    const { data } = await api.get<HistoricoMembroResponse[]>(`/historico-membro/membro/${idMembro}`);
    return data;
  },

  async criar(request: HistoricoMembroRequest): Promise<HistoricoMembroResponse> {
    const { data } = await api.post<HistoricoMembroResponse>("/historico-membro/", request);
    return data;
  },

  async atualizar(request: HistoricoMembroRequest): Promise<HistoricoMembroResponse> {
    const { data } = await api.put<HistoricoMembroResponse>("/historico-membro/", request);
    return data;
  },

  async remover(id: number): Promise<void> {
    await api.delete(`/historico-membro/${id}`);
  },
};
