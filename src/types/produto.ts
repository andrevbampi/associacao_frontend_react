export interface Produto {
  id: number;
  descricao: string;
  preco: number;
  precoMembro: number;
  ativo: boolean;
}

export interface ProdutoFormData {
  id?: number;
  descricao: string;
  preco: number | "";
  precoMembro: number | "";
  ativo: boolean;
}

export const produtoVazio: ProdutoFormData = {
  descricao: "",
  preco: "",
  precoMembro: "",
  ativo: true,
};
