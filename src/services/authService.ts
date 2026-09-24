import { api } from "./api";
import type { LoginRequest, LoginResponse } from "../types/auth";
import type { UsuarioResponse } from "../types/usuario";

export const authService = {
  async login(credenciais: LoginRequest): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>("/auth/login", credenciais);
    return data;
  },

  async me(): Promise<UsuarioResponse> {
    const { data } = await api.get<UsuarioResponse>("/auth/me");
    return data;
  },
};
