import { api } from "./api";
import type { Pessoa, PessoaFormData } from "../types/pessoa";

export interface PessoaFiltro {
  nome?: string;
  tipo?: number;
  semUsuario?: boolean;
  semMembro?: boolean;
}

export const pessoaService = {
  async listar(filtro?: PessoaFiltro): Promise<Pessoa[]> {
    const { data } = await api.get<Pessoa[]>("/pessoa/", { params: filtro });
    return data;
  },

  async criar(pessoa: PessoaFormData): Promise<Pessoa> {
    const { data } = await api.post<Pessoa>("/pessoa/", pessoa);
    return data;
  },

  async atualizar(pessoa: PessoaFormData): Promise<Pessoa> {
    const { data } = await api.put<Pessoa>("/pessoa/", pessoa);
    return data;
  },

  async remover(id: number): Promise<void> {
    await api.delete(`/pessoa/${id}`);
  },

  async uploadFoto(id: number, arquivo: File): Promise<void> {
    const formData = new FormData();
    formData.append("arquivo", arquivo);
    await api.put(`/pessoa/${id}/foto`, formData, { headers: { "Content-Type": "multipart/form-data" } });
  },

  async removerFoto(id: number): Promise<void> {
    await api.delete(`/pessoa/${id}/foto`);
  },
};
