import { api } from "./api";
import type { UsuarioRequest, UsuarioResponse } from "../types/usuario";

export interface UsuarioFiltro {
  nomePessoa?: string;
  ativo?: boolean;
}

export const usuarioService = {
  async listar(filtro?: UsuarioFiltro): Promise<UsuarioResponse[]> {
    const { data } = await api.get<UsuarioResponse[]>("/usuario/", { params: filtro });
    return data;
  },

  async criar(usuario: UsuarioRequest): Promise<UsuarioResponse> {
    const { data } = await api.post<UsuarioResponse>("/usuario/", usuario);
    return data;
  },

  async atualizar(usuario: UsuarioRequest): Promise<UsuarioResponse> {
    const { data } = await api.put<UsuarioResponse>("/usuario/", usuario);
    return data;
  },

  async remover(id: number): Promise<void> {
    await api.delete(`/usuario/${id}`);
  },
};
