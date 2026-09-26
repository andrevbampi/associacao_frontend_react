import { api } from "./api";
import type { DocumentoPessoa } from "../types/documentoPessoa";

export const documentoPessoaService = {
  async listar(idPessoa: number): Promise<DocumentoPessoa[]> {
    const { data } = await api.get<DocumentoPessoa[]>(`/pessoa/${idPessoa}/documentos`);
    return data;
  },

  async upload(idPessoa: number, arquivo: File): Promise<DocumentoPessoa> {
    const formData = new FormData();
    formData.append("arquivo", arquivo);
    const { data } = await api.post<DocumentoPessoa>(`/pessoa/${idPessoa}/documentos`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  // Baixa via axios (não um <a href> direto) porque o endpoint exige o token JWT.
  async baixar(id: number, nomeOriginal: string): Promise<void> {
    const resposta = await api.get(`/documento-pessoa/${id}/download`, { responseType: "blob" });
    const url = URL.createObjectURL(resposta.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = nomeOriginal;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  },

  async remover(id: number): Promise<void> {
    await api.delete(`/documento-pessoa/${id}`);
  },
};
