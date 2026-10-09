export interface RelatorioConsumoProdutoLinha {
  mes: string | null;
  dia: string | null;
  pessoa: string | null;
  idProduto: number;
  produto: string;
  categoriaProduto: string | null;
  status: "ABERTA" | "FECHADA" | null;
  quantidadeTotal: number;
  valorTotal: number;
}

export interface RelatorioConsumoProdutoResponse {
  linhas: RelatorioConsumoProdutoLinha[];
  quantidadeTotalGeral: number;
  valorTotalGeral: number;
}

export interface RelatorioConsumoProdutoFiltro {
  apenasPessoasCadastradas?: boolean;
  idPessoa?: number;
  nomeTemporario?: string;
  dataAberturaInicio?: string;
  dataAberturaFim?: string;
  idProduto?: number;
  idCategoriaProduto?: number;
  status?: "ABERTA" | "FECHADA";
  agruparPorMes?: boolean;
  agruparPorDia?: boolean;
  agruparPorPessoa?: boolean;
  agruparPorStatus?: boolean;
}

export type TipoLinhaLivroCaixa = "DETALHE" | "COMANDAS" | "MENSALIDADES";

export interface RelatorioLivroCaixaLinha {
  tipoLinha: TipoLinhaLivroCaixa;
  caixa: string | null;
  mes: string | null;
  data: string | null;
  descricao: string;
  categoria: string | null;
  valorEntrada: number;
  valorSaida: number;
  observacao: string | null;
}

export interface RelatorioLivroCaixaAcumulado {
  caixa: string | null;
  totalEntradas: number;
  totalSaidas: number;
  saldo: number;
}

export interface RelatorioLivroCaixaResponse {
  linhas: RelatorioLivroCaixaLinha[];
  totalEntradasGeral: number;
  totalSaidasGeral: number;
  saldoGeral: number;
  dataAcumuladoAte: string;
  acumuladoGeral: RelatorioLivroCaixaAcumulado;
  acumuladosPorCaixa: RelatorioLivroCaixaAcumulado[];
}

export interface RelatorioLivroCaixaFiltro {
  idCaixa?: number;
  dataInicio?: string;
  dataFim?: string;
  agruparPorCaixa?: boolean;
  agruparPorMes?: boolean;
}
