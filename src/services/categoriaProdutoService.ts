import { api } from "./api";
import type { CategoriaProduto, CategoriaProdutoFormData } from "../types/categoriaProduto";

export const categoriaProdutoService = {
  async listar(): Promise<CategoriaProduto[]> {
    const { data } = await api.get<CategoriaProduto[]>("/categoria-produto/");
    return data;
  },

  async criar(categoria: CategoriaProdutoFormData): Promise<CategoriaProduto> {
    const { data } = await api.post<CategoriaProduto>("/categoria-produto/", categoria);
    return data;
  },

  async atualizar(categoria: CategoriaProdutoFormData): Promise<CategoriaProduto> {
    const { data } = await api.put<CategoriaProduto>("/categoria-produto/", categoria);
    return data;
  },

  async remover(id: number): Promise<void> {
    await api.delete(`/categoria-produto/${id}`);
  },
};
