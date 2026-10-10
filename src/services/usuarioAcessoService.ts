import { api } from "./api";
import type { UsuarioAcesso, UsuarioAcessoRequest } from "../types/acesso";

export const usuarioAcessoService = {
  async obter(idUsuario: number): Promise<UsuarioAcesso> {
    const { data } = await api.get<UsuarioAcesso>(`/usuario/${idUsuario}/acesso`);
    return data;
  },

  async salvar(idUsuario: number, request: UsuarioAcessoRequest): Promise<UsuarioAcesso> {
    const { data } = await api.put<UsuarioAcesso>(`/usuario/${idUsuario}/acesso`, request);
    return data;
  },
};
