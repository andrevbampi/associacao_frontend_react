import { api } from "./api";
import type { MembroRequest, MembroResponse } from "../types/membro";

export const membroService = {
  async listar(): Promise<MembroResponse[]> {
    const { data } = await api.get<MembroResponse[]>("/membro/");
    return data;
  },

  async criar(membro: MembroRequest): Promise<MembroResponse> {
    const { data } = await api.post<MembroResponse>("/membro/", membro);
    return data;
  },

  async atualizar(membro: MembroRequest): Promise<MembroResponse> {
    const { data } = await api.put<MembroResponse>("/membro/", membro);
    return data;
  },

  async remover(id: number): Promise<void> {
    await api.delete(`/membro/${id}`);
  },
};
