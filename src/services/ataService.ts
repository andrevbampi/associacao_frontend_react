import { api } from "./api";
import type { AtaRequest, AtaResponse } from "../types/ata";

export const ataService = {
  async listar(): Promise<AtaResponse[]> {
    const { data } = await api.get<AtaResponse[]>("/ata/");
    return data;
  },

  async criar(ata: AtaRequest): Promise<AtaResponse> {
    const { data } = await api.post<AtaResponse>("/ata/", ata);
    return data;
  },

  async atualizar(ata: AtaRequest): Promise<AtaResponse> {
    const { data } = await api.put<AtaResponse>("/ata/", ata);
    return data;
  },

  async remover(id: number): Promise<void> {
    await api.delete(`/ata/${id}`);
  },
};
