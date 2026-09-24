import { api } from "./api";
import type { Pessoa, PessoaFormData } from "../types/pessoa";

export const pessoaService = {
  async listar(): Promise<Pessoa[]> {
    const { data } = await api.get<Pessoa[]>("/pessoa/");
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
};
