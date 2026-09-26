export interface RelatorioConsumoProdutoLinha {
  mes: string | null;
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
  agruparPorPessoa?: boolean;
  agruparPorStatus?: boolean;
}
