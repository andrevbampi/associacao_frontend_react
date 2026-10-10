import type { Pessoa } from "./pessoa";

export interface UsuarioResponse {
  id: number;
  login: string;
  pessoa: Pessoa;
  ativo: boolean;
  /** Só vem preenchido no login e em /auth/me (permissões efetivas da sessão). */
  permissoes?: string[];
}

export interface UsuarioRequest {
  id?: number;
  login: string;
  senha: string;
  idPessoa: number;
  ativo: boolean;
}

export interface UsuarioFormData {
  id?: number;
  login: string;
  senha: string;
  idPessoa: number | "";
  ativo: boolean;
}

export const usuarioVazio: UsuarioFormData = {
  login: "",
  senha: "",
  idPessoa: "",
  ativo: true,
};
