import { api } from "./api";
import type {
  RelatorioConsumoProdutoFiltro,
  RelatorioConsumoProdutoResponse,
  RelatorioLivroCaixaFiltro,
  RelatorioLivroCaixaResponse,
} from "../types/relatorio";

export const relatorioService = {
  async consumoProdutos(filtro: RelatorioConsumoProdutoFiltro): Promise<RelatorioConsumoProdutoResponse> {
    const { data } = await api.get<RelatorioConsumoProdutoResponse>("/relatorio/consumo-produtos", { params: filtro });
    return data;
  },

  async livroCaixa(filtro: RelatorioLivroCaixaFiltro): Promise<RelatorioLivroCaixaResponse> {
    const { data } = await api.get<RelatorioLivroCaixaResponse>("/relatorio/livro-caixa", { params: filtro });
    return data;
  },
};
