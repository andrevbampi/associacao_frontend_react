import { api } from "./api";
import type { UsuarioRequest, UsuarioResponse } from "../types/usuario";

export const usuarioService = {
  async listar(): Promise<UsuarioResponse[]> {
    const { data } = await api.get<UsuarioResponse[]>("/usuario/");
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
