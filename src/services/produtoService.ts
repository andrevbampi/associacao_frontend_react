import { api } from "./api";
import type { Produto, ProdutoFormData } from "../types/produto";

export const produtoService = {
  async listar(): Promise<Produto[]> {
    const { data } = await api.get<Produto[]>("/produto/");
    return data;
  },

  async criar(produto: ProdutoFormData): Promise<Produto> {
    const { data } = await api.post<Produto>("/produto/", produto);
    return data;
  },

  async atualizar(produto: ProdutoFormData): Promise<Produto> {
    const { data } = await api.put<Produto>("/produto/", produto);
    return data;
  },

  async remover(id: number): Promise<void> {
    await api.delete(`/produto/${id}`);
  },
};
