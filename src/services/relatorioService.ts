import { api } from "./api";
import type { RelatorioConsumoProdutoFiltro, RelatorioConsumoProdutoResponse } from "../types/relatorio";

export const relatorioService = {
  async consumoProdutos(filtro: RelatorioConsumoProdutoFiltro): Promise<RelatorioConsumoProdutoResponse> {
    const { data } = await api.get<RelatorioConsumoProdutoResponse>("/relatorio/consumo-produtos", { params: filtro });
    return data;
  },
};
