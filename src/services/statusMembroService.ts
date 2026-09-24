import { api } from "./api";
import type { StatusMembro, StatusMembroFormData } from "../types/statusMembro";

export const statusMembroService = {
  async listar(): Promise<StatusMembro[]> {
    const { data } = await api.get<StatusMembro[]>("/status-membro/");
    return data;
  },

  async criar(status: StatusMembroFormData): Promise<StatusMembro> {
    const { data } = await api.post<StatusMembro>("/status-membro/", status);
    return data;
  },

  async atualizar(status: StatusMembroFormData): Promise<StatusMembro> {
    const { data } = await api.put<StatusMembro>("/status-membro/", status);
    return data;
  },

  async remover(id: number): Promise<void> {
    await api.delete(`/status-membro/${id}`);
  },
};
