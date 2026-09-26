export interface Caixa {
  id: number;
  nome: string;
  ativo: boolean;
  observacao: string | null;
}

export type CaixaFormData = Omit<Caixa, "id"> & { id?: number };

export const caixaVazio: CaixaFormData = {
  nome: "",
  ativo: true,
  observacao: "",
};
