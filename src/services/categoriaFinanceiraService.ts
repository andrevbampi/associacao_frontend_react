import { api } from "./api";
import type { CategoriaFinanceira, CategoriaFinanceiraFormData } from "../types/categoriaFinanceira";

export const categoriaFinanceiraService = {
  async listar(): Promise<CategoriaFinanceira[]> {
    const { data } = await api.get<CategoriaFinanceira[]>("/categoria-financeira/");
    return data;
  },

  async criar(categoria: CategoriaFinanceiraFormData): Promise<CategoriaFinanceira> {
    const { data } = await api.post<CategoriaFinanceira>("/categoria-financeira/", categoria);
    return data;
  },

  async atualizar(categoria: CategoriaFinanceiraFormData): Promise<CategoriaFinanceira> {
    const { data } = await api.put<CategoriaFinanceira>("/categoria-financeira/", categoria);
    return data;
  },

  async remover(id: number): Promise<void> {
    await api.delete(`/categoria-financeira/${id}`);
  },
};
