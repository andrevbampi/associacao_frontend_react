import { api } from "./api";
import type { Produto, ProdutoFormData } from "../types/produto";

export interface ProdutoFiltro {
  descricao?: string;
  idCategoria?: number;
  ativo?: boolean;
}

function paraRequest(produto: ProdutoFormData) {
  return {
    id: produto.id,
    descricao: produto.descricao,
    preco: produto.preco,
    precoMembro: produto.precoMembro,
    idCategoria: produto.idCategoria === "" ? 0 : Number(produto.idCategoria),
    ativo: produto.ativo,
    estoqueAtual: produto.estoqueAtual === "" ? 0 : Number(produto.estoqueAtual),
    estoqueMinimo: produto.estoqueMinimo === "" ? null : Number(produto.estoqueMinimo),
    controlaEstoque: produto.controlaEstoque,
  };
}

export const produtoService = {
  async listar(filtro?: ProdutoFiltro): Promise<Produto[]> {
    const { data } = await api.get<Produto[]>("/produto/", { params: filtro });
    return data;
  },

  async criar(produto: ProdutoFormData): Promise<Produto> {
    const { data } = await api.post<Produto>("/produto/", paraRequest(produto));
    return data;
  },

  async atualizar(produto: ProdutoFormData): Promise<Produto> {
    const { data } = await api.put<Produto>("/produto/", paraRequest(produto));
    return data;
  },

  async remover(id: number): Promise<void> {
    await api.delete(`/produto/${id}`);
  },

  async uploadFoto(id: number, arquivo: File): Promise<void> {
    const formData = new FormData();
    formData.append("arquivo", arquivo);
    await api.put(`/produto/${id}/foto`, formData, { headers: { "Content-Type": "multipart/form-data" } });
  },

  async removerFoto(id: number): Promise<void> {
    await api.delete(`/produto/${id}/foto`);
  },
};
