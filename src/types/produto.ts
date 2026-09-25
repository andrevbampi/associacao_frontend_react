import type { CategoriaProduto } from "./categoriaProduto";

export interface Produto {
  id: number;
  descricao: string;
  preco: number;
  precoMembro: number;
  categoria: CategoriaProduto;
  ativo: boolean;
}

export interface ProdutoFormData {
  id?: number;
  descricao: string;
  preco: number | "";
  precoMembro: number | "";
  idCategoria: number | "";
  ativo: boolean;
}

export const produtoVazio: ProdutoFormData = {
  descricao: "",
  preco: "",
  precoMembro: "",
  idCategoria: "",
  ativo: true,
};
