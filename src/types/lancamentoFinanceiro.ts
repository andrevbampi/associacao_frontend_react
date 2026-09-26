import type { CategoriaFinanceira } from "./categoriaFinanceira";
import type { Caixa } from "./caixa";
import type { FormaPagamento } from "./formaPagamento";
import type { MembroResponse } from "./membro";
import type { Pessoa } from "./pessoa";
import type { UsuarioResponse } from "./usuario";

export type TipoLancamento = "ENTRADA" | "SAIDA";

export const TIPO_LANCAMENTO_LABEL: Record<TipoLancamento, string> = {
  ENTRADA: "Entrada",
  SAIDA: "Saída",
};

export interface LancamentoFinanceiroResponse {
  id: number;
  categoriaFinanceira: CategoriaFinanceira;
  caixa: Caixa;
  tipo: TipoLancamento;
  valor: number;
  data: string;
  descricao: string | null;
  pessoa: Pessoa | null;
  membro: MembroResponse | null;
  idComanda: number | null;
  usuario: UsuarioResponse;
  observacao: string | null;
  pago: boolean;
  dataPagamento: string | null;
  formaPagamento: FormaPagamento | null;
}

export interface LancamentoFinanceiroRequest {
  id?: number;
  idCategoriaFinanceira: number;
  idCaixa: number;
  tipo: TipoLancamento;
  valor: number;
  data: string;
  descricao?: string | null;
  idPessoa?: number | null;
  idMembro?: number | null;
  idComanda?: number | null;
  observacao?: string | null;
  pago: boolean;
  formaPagamento?: FormaPagamento | null;
}

export interface LancamentoFinanceiroFormData {
  id?: number;
  idCategoriaFinanceira: number | "";
  idCaixa: number | "";
  tipo: TipoLancamento;
  valor: number | "";
  data: string;
  descricao: string;
  idPessoa: number | "";
  idMembro: number | "";
  observacao: string;
  pago: boolean;
  formaPagamento: FormaPagamento | "";
}

export const lancamentoFinanceiroVazio: LancamentoFinanceiroFormData = {
  idCategoriaFinanceira: "",
  idCaixa: "",
  tipo: "ENTRADA",
  valor: "",
  data: new Date().toISOString().substring(0, 10),
  descricao: "",
  idPessoa: "",
  idMembro: "",
  observacao: "",
  pago: false,
  formaPagamento: "",
};

export interface ResumoFinanceiro {
  saldoAtual: number;
  totalEntradasPeriodo: number;
  totalSaidasPeriodo: number;
}

export interface ResumoCaixa {
  caixa: Caixa;
  saldoAtual: number;
}
