import { api } from "./api";
import type {
  ComandaAberturaRequest,
  ComandaFechamentoRequest,
  ComandaResponse,
  ItemComandaRequest,
  StatusComanda,
} from "../types/comanda";

export const comandaService = {
  async listar(status?: StatusComanda): Promise<ComandaResponse[]> {
    const { data } = await api.get<ComandaResponse[]>("/comanda/", { params: status ? { status } : undefined });
    return data;
  },

  async buscarPorId(id: number): Promise<ComandaResponse> {
    const { data } = await api.get<ComandaResponse>(`/comanda/${id}`);
    return data;
  },

  async abrir(request: ComandaAberturaRequest): Promise<ComandaResponse> {
    const { data } = await api.post<ComandaResponse>("/comanda/", request);
    return data;
  },

  async adicionarItem(idComanda: number, request: ItemComandaRequest): Promise<ComandaResponse> {
    const { data } = await api.post<ComandaResponse>(`/comanda/${idComanda}/itens`, request);
    return data;
  },

  async alterarItem(idComanda: number, idItem: number, request: ItemComandaRequest): Promise<ComandaResponse> {
    const { data } = await api.put<ComandaResponse>(`/comanda/${idComanda}/itens/${idItem}`, request);
    return data;
  },

  async removerItem(idComanda: number, idItem: number): Promise<ComandaResponse> {
    const { data } = await api.delete<ComandaResponse>(`/comanda/${idComanda}/itens/${idItem}`);
    return data;
  },

  async fechar(idComanda: number, request: ComandaFechamentoRequest): Promise<ComandaResponse> {
    const { data } = await api.put<ComandaResponse>(`/comanda/${idComanda}/fechar`, request);
    return data;
  },

  async cancelar(idComanda: number): Promise<ComandaResponse> {
    const { data } = await api.put<ComandaResponse>(`/comanda/${idComanda}/cancelar`, {});
    return data;
  },
};
