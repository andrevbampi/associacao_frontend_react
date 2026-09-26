import { api } from "./api";
import type { Caixa, CaixaFormData } from "../types/caixa";

export const caixaService = {
  async listar(): Promise<Caixa[]> {
    const { data } = await api.get<Caixa[]>("/caixa/");
    return data;
  },

  async criar(caixa: CaixaFormData): Promise<Caixa> {
    const { data } = await api.post<Caixa>("/caixa/", caixa);
    return data;
  },

  async atualizar(caixa: CaixaFormData): Promise<Caixa> {
    const { data } = await api.put<Caixa>("/caixa/", caixa);
    return data;
  },

  async remover(id: number): Promise<void> {
    await api.delete(`/caixa/${id}`);
  },
};
