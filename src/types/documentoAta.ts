import type { UsuarioResponse } from "./usuario";

export interface DocumentoAta {
  id: number;
  nomeOriginal: string;
  contentType: string;
  tamanho: number;
  dataUpload: string;
  usuarioUpload: UsuarioResponse;
}
