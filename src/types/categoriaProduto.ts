export interface CategoriaProduto {
  id: number;
  descricao: string;
}

export type CategoriaProdutoFormData = Omit<CategoriaProduto, "id"> & { id?: number };

export const categoriaProdutoVazia: CategoriaProdutoFormData = {
  descricao: "",
};
