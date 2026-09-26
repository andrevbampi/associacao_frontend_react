import type { Produto } from "./produto";
import type { UsuarioResponse } from "./usuario";

export type TipoMovimentoEstoque = "ENTRADA" | "SAIDA" | "AJUSTE";
export type OrigemMovimentoEstoque = "COMPRA" | "VENDA" | "AJUSTE_MANUAL" | "INVENTARIO" | "OUTRO";

export const TIPOS_MOVIMENTO: TipoMovimentoEstoque[] = ["ENTRADA", "SAIDA", "AJUSTE"];
export const TIPO_MOVIMENTO_LABEL: Record<TipoMovimentoEstoque, string> = {
  ENTRADA: "Entrada",
  SAIDA: "Saída",
  AJUSTE: "Ajuste (define o estoque)",
};

// VENDA é gerada automaticamente pela comanda; não aparece como opção manual.
export const ORIGENS_MOVIMENTO_MANUAL: OrigemMovimentoEstoque[] = ["COMPRA", "AJUSTE_MANUAL", "INVENTARIO", "OUTRO"];
export const ORIGEM_MOVIMENTO_LABEL: Record<OrigemMovimentoEstoque, string> = {
  COMPRA: "Compra",
  VENDA: "Venda",
  AJUSTE_MANUAL: "Ajuste manual",
  INVENTARIO: "Inventário",
  OUTRO: "Outro",
};

export interface MovimentoEstoqueResponse {
  id: number;
  produto: Produto;
  tipo: TipoMovimentoEstoque;
  quantidade: number;
  estoqueAnterior: number;
  estoquePosterior: number;
  dataHora: string;
  usuario: UsuarioResponse;
  observacao: string | null;
  origem: OrigemMovimentoEstoque;
  idOrigem: number | null;
}

export interface MovimentoEstoqueFormData {
  idProduto: number | "";
  tipo: TipoMovimentoEstoque;
  quantidade: number | "";
  observacao: string;
  origem: OrigemMovimentoEstoque;
  gerarLancamentoFinanceiro: boolean;
  idCategoriaFinanceira: number | "";
  valorLancamento: number | "";
}

export const movimentoEstoqueVazio: MovimentoEstoqueFormData = {
  idProduto: "",
  tipo: "ENTRADA",
  quantidade: "",
  observacao: "",
  origem: "AJUSTE_MANUAL",
  gerarLancamentoFinanceiro: false,
  idCategoriaFinanceira: "",
  valorLancamento: "",
};
