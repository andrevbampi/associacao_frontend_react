export const TIPO_PESSOA_FISICA = 1;
export const TIPO_PESSOA_JURIDICA = 2;

export type TipoPessoa = typeof TIPO_PESSOA_FISICA | typeof TIPO_PESSOA_JURIDICA;

export const TIPO_PESSOA_LABEL: Record<TipoPessoa, string> = {
  [TIPO_PESSOA_FISICA]: "Física",
  [TIPO_PESSOA_JURIDICA]: "Jurídica",
};

export interface Pessoa {
  id: number;
  tipo: TipoPessoa;
  nome: string;
  documento: string;
  dataNascimento: string | null;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
}

export type PessoaFormData = Omit<Pessoa, "id"> & { id?: number };

export const pessoaVazia: PessoaFormData = {
  tipo: TIPO_PESSOA_FISICA,
  nome: "",
  documento: "",
  dataNascimento: null,
  telefone: "",
  email: "",
  endereco: "",
};
