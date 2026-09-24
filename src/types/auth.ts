import type { UsuarioResponse } from "./usuario";

export interface LoginRequest {
  login: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  tipoToken: string;
  usuario: UsuarioResponse;
}
