import type { CategoriaProduto } from "./categoriaProduto";

export interface Produto {
  id: number;
  descricao: string;
  preco: number;
  precoMembro: number;
  categoria: CategoriaProduto;
  ativo: boolean;
  estoqueAtual: number;
  estoqueMinimo: number | null;
  controlaEstoque: boolean;
  // Estoque atual menos o que já está reservado em comandas abertas.
  estoqueDisponivel: number;
  temFoto: boolean;
}

export interface ProdutoFormData {
  id?: number;
  descricao: string;
  preco: number | "";
  precoMembro: number | "";
  idCategoria: number | "";
  ativo: boolean;
  estoqueAtual: number | "";
  estoqueMinimo: number | "";
  controlaEstoque: boolean;
}

export const produtoVazio: ProdutoFormData = {
  descricao: "",
  preco: "",
  precoMembro: "",
  idCategoria: "",
  ativo: true,
  estoqueAtual: 0,
  estoqueMinimo: "",
  controlaEstoque: true,
};
