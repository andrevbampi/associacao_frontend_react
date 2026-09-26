import type { Pessoa } from "./pessoa";
import type { Produto } from "./produto";
import type { FormaPagamento } from "./formaPagamento";

export type StatusComanda = "ABERTA" | "FECHADA" | "CANCELADA";

export interface ItemComandaResponse {
  id: number;
  produto: Produto;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

export interface ComandaResponse {
  id: number;
  pessoa: Pessoa | null;
  nomeTemporario: string | null;
  dataAbertura: string;
  dataFechamento: string | null;
  status: StatusComanda;
  valorTotal: number;
  pago: boolean;
  dataPagamento: string | null;
  formaPagamento: FormaPagamento | null;
  observacao: string | null;
  // Só vem preenchido no GET de uma comanda específica.
  itens: ItemComandaResponse[] | null;
}

export interface ComandaAberturaRequest {
  idPessoa?: number | null;
  nomeTemporario?: string | null;
  observacao?: string | null;
}

export interface ItemComandaRequest {
  idProduto: number;
  quantidade: number;
}

export interface ComandaFechamentoRequest {
  pago: boolean;
  formaPagamento?: FormaPagamento | null;
  idCaixa?: number | null;
}

export interface ComandaPagamentoRequest {
  formaPagamento?: FormaPagamento | null;
  idCaixa?: number | null;
}
