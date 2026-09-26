import { api } from "./api";
import type { MovimentoEstoqueFormData, MovimentoEstoqueResponse, OrigemMovimentoEstoque, TipoMovimentoEstoque } from "../types/estoque";

export interface MovimentoEstoqueFiltro {
  idProduto?: number;
  tipo?: TipoMovimentoEstoque | "";
  origem?: OrigemMovimentoEstoque | "";
  dataInicio?: string;
  dataFim?: string;
}

function paraRequest(movimento: MovimentoEstoqueFormData) {
  return {
    idProduto: movimento.idProduto === "" ? 0 : Number(movimento.idProduto),
    tipo: movimento.tipo,
    quantidade: movimento.quantidade === "" ? 0 : Number(movimento.quantidade),
    observacao: movimento.observacao || null,
    origem: movimento.origem,
    gerarLancamentoFinanceiro: movimento.gerarLancamentoFinanceiro,
    idCategoriaFinanceira: movimento.idCategoriaFinanceira === "" ? 0 : Number(movimento.idCategoriaFinanceira),
    valorLancamento: movimento.valorLancamento === "" ? null : Number(movimento.valorLancamento),
  };
}

export const estoqueService = {
  async listarMovimentos(filtro?: MovimentoEstoqueFiltro): Promise<MovimentoEstoqueResponse[]> {
    const { data } = await api.get<MovimentoEstoqueResponse[]>("/estoque/movimentos", { params: filtro });
    return data;
  },

  async lancar(movimento: MovimentoEstoqueFormData): Promise<MovimentoEstoqueResponse> {
    const { data } = await api.post<MovimentoEstoqueResponse>("/estoque/movimentos", paraRequest(movimento));
    return data;
  },
};
