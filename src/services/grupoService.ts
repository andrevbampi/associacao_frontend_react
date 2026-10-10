import { api } from "./api";
import type { Grupo, GrupoRequest, PermissaoItem } from "../types/acesso";

export const grupoService = {
  async listar(): Promise<Grupo[]> {
    const { data } = await api.get<Grupo[]>("/grupo/");
    return data;
  },

  async buscar(id: number): Promise<Grupo> {
    const { data } = await api.get<Grupo>(`/grupo/${id}`);
    return data;
  },

  async listarPermissoes(): Promise<PermissaoItem[]> {
    const { data } = await api.get<PermissaoItem[]>("/grupo/permissoes");
    return data;
  },

  async criar(grupo: GrupoRequest): Promise<Grupo> {
    const { data } = await api.post<Grupo>("/grupo/", grupo);
    return data;
  },

  async atualizar(grupo: GrupoRequest): Promise<Grupo> {
    const { data } = await api.put<Grupo>("/grupo/", grupo);
    return data;
  },

  async remover(id: number): Promise<void> {
    await api.delete(`/grupo/${id}`);
  },
};
