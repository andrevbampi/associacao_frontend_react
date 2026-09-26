export type TipoCategoriaFinanceira = "RECEITA" | "DESPESA";

export const TIPO_CATEGORIA_FINANCEIRA_LABEL: Record<TipoCategoriaFinanceira, string> = {
  RECEITA: "Receita",
  DESPESA: "Despesa",
};

export interface CategoriaFinanceira {
  id: number;
  descricao: string;
  tipo: TipoCategoriaFinanceira;
}

export type CategoriaFinanceiraFormData = Omit<CategoriaFinanceira, "id"> & { id?: number };

export const categoriaFinanceiraVazia: CategoriaFinanceiraFormData = {
  descricao: "",
  tipo: "RECEITA",
};
