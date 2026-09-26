import type { UsuarioResponse } from "./usuario";

export interface DocumentoPessoa {
  id: number;
  nomeOriginal: string;
  contentType: string;
  tamanho: number;
  dataUpload: string;
  usuarioUpload: UsuarioResponse;
}
