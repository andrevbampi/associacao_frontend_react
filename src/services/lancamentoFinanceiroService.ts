import { api } from "./api";
import type {
  LancamentoFinanceiroFormData,
  LancamentoFinanceiroResponse,
  ResumoFinanceiro,
  TipoLancamento,
} from "../types/lancamentoFinanceiro";
import type { FormaPagamento } from "../types/formaPagamento";

export interface LancamentoFinanceiroFiltro {
  dataInicio?: string;
  dataFim?: string;
  idCategoriaFinanceira?: number;
  tipo?: TipoLancamento | "";
  pago?: boolean;
}

function paraRequest(lancamento: LancamentoFinanceiroFormData) {
  return {
    id: lancamento.id,
    idCategoriaFinanceira: lancamento.idCategoriaFinanceira === "" ? 0 : Number(lancamento.idCategoriaFinanceira),
    tipo: lancamento.tipo,
    valor: lancamento.valor === "" ? 0 : Number(lancamento.valor),
    data: lancamento.data,
    descricao: lancamento.descricao || null,
    idPessoa: lancamento.idPessoa === "" ? null : Number(lancamento.idPessoa),
    idMembro: lancamento.idMembro === "" ? null : Number(lancamento.idMembro),
    observacao: lancamento.observacao || null,
    pago: lancamento.pago,
    formaPagamento: lancamento.formaPagamento || null,
  };
}

export const lancamentoFinanceiroService = {
  async listar(filtro?: LancamentoFinanceiroFiltro): Promise<LancamentoFinanceiroResponse[]> {
    const { data } = await api.get<LancamentoFinanceiroResponse[]>("/lancamento-financeiro/", { params: filtro });
    return data;
  },

  async resumo(dataInicio?: string, dataFim?: string): Promise<ResumoFinanceiro> {
    const { data } = await api.get<ResumoFinanceiro>("/lancamento-financeiro/resumo", { params: { dataInicio, dataFim } });
    return data;
  },

  async criar(lancamento: LancamentoFinanceiroFormData): Promise<LancamentoFinanceiroResponse> {
    const { data } = await api.post<LancamentoFinanceiroResponse>("/lancamento-financeiro/", paraRequest(lancamento));
    return data;
  },

  async atualizar(lancamento: LancamentoFinanceiroFormData): Promise<LancamentoFinanceiroResponse> {
    const { data } = await api.put<LancamentoFinanceiroResponse>("/lancamento-financeiro/", paraRequest(lancamento));
    return data;
  },

  async registrarPagamento(id: number, formaPagamento?: FormaPagamento | ""): Promise<LancamentoFinanceiroResponse> {
    const { data } = await api.put<LancamentoFinanceiroResponse>(`/lancamento-financeiro/${id}/pagamento`, {
      formaPagamento: formaPagamento || null,
    });
    return data;
  },

  async remover(id: number): Promise<void> {
    await api.delete(`/lancamento-financeiro/${id}`);
  },
};
