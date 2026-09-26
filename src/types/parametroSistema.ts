export interface ParametroSistema {
  id: number;
  chave: string;
  valor: string | null;
  descricao: string | null;
}

export interface ParametroSistemaRequest {
  id: number;
  valor: string | null;
  descricao: string | null;
}

export const CHAVE_NOME_ASSOCIACAO = "NOME_ASSOCIACAO";
export const CHAVE_DOCUMENTO_ASSOCIACAO = "DOCUMENTO_ASSOCIACAO";
export const CHAVE_ENDERECO_ASSOCIACAO = "ENDERECO_ASSOCIACAO";
export const CHAVE_TELEFONE_ASSOCIACAO = "TELEFONE_ASSOCIACAO";
export const CHAVE_EMAIL_ASSOCIACAO = "EMAIL_ASSOCIACAO";
export const CHAVE_CAIXA_COMANDA = "CAIXA_COMANDA";

export const LABEL_PARAMETRO: Record<string, string> = {
  [CHAVE_NOME_ASSOCIACAO]: "Nome da associação",
  [CHAVE_DOCUMENTO_ASSOCIACAO]: "Documento (CNPJ/CPF) da associação",
  [CHAVE_ENDERECO_ASSOCIACAO]: "Endereço da associação",
  [CHAVE_TELEFONE_ASSOCIACAO]: "Telefone da associação",
  [CHAVE_EMAIL_ASSOCIACAO]: "E-mail da associação",
  [CHAVE_CAIXA_COMANDA]: "Caixa padrão das comandas",
};
