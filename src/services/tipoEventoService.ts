import { api } from "./api";
import type { TipoEvento, TipoEventoFormData } from "../types/tipoEvento";

export const tipoEventoService = {
  async listar(): Promise<TipoEvento[]> {
    const { data } = await api.get<TipoEvento[]>("/tipo-evento/");
    return data;
  },

  async criar(tipoEvento: TipoEventoFormData): Promise<TipoEvento> {
    const { data } = await api.post<TipoEvento>("/tipo-evento/", tipoEvento);
    return data;
  },

  async atualizar(tipoEvento: TipoEventoFormData): Promise<TipoEvento> {
    const { data } = await api.put<TipoEvento>("/tipo-evento/", tipoEvento);
    return data;
  },

  async remover(id: number): Promise<void> {
    await api.delete(`/tipo-evento/${id}`);
  },
};
