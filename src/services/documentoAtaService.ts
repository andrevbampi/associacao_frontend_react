import { api } from "./api";
import type { DocumentoAta } from "../types/documentoAta";

export const documentoAtaService = {
  async listar(idAta: number): Promise<DocumentoAta[]> {
    const { data } = await api.get<DocumentoAta[]>(`/ata/${idAta}/documentos`);
    return data;
  },

  async upload(idAta: number, arquivo: File): Promise<DocumentoAta> {
    const formData = new FormData();
    formData.append("arquivo", arquivo);
    const { data } = await api.post<DocumentoAta>(`/ata/${idAta}/documentos`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  // Baixa via axios (não um <a href> direto) porque o endpoint exige o token JWT.
  async baixar(id: number, nomeOriginal: string): Promise<void> {
    const resposta = await api.get(`/documento-ata/${id}/download`, { responseType: "blob" });
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
    await api.delete(`/documento-ata/${id}`);
  },
};
