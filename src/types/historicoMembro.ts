import type { MembroResponse } from "./membro";
import type { TipoEvento } from "./tipoEvento";
import type { UsuarioResponse } from "./usuario";

export interface HistoricoMembroResponse {
  id: number;
  membro: MembroResponse;
  tipoEvento: TipoEvento;
  descricao: string;
  data: string;
  usuarioRegistro: UsuarioResponse;
  observacao: string | null;
  ativo: boolean;
}

export interface HistoricoMembroRequest {
  id?: number;
  idMembro: number;
  idTipoEvento: number;
  descricao: string;
  observacao?: string | null;
  ativo: boolean;
}

export interface HistoricoMembroFormData {
  id?: number;
  idTipoEvento: number | "";
  descricao: string;
  observacao: string;
  ativo: boolean;
}

export const historicoMembroVazio: HistoricoMembroFormData = {
  idTipoEvento: "",
  descricao: "",
  observacao: "",
  ativo: true,
};
