import type { Pessoa } from "./pessoa";
import type { UsuarioResponse } from "./usuario";

export interface AtaResponse {
  id: number;
  dataAta: string;
  pessoaRedator: Pessoa | null;
  nomeRedator: string | null;
  titulo: string | null;
  conteudo: string;
  dataHoraCadastro: string;
  usuarioCadastro: UsuarioResponse;
  dataHoraUltimaAlteracao: string;
  usuarioUltimaAlteracao: UsuarioResponse;
}

export interface AtaRequest {
  id?: number;
  dataAta: string;
  idPessoaRedator: number | "";
  nomeRedator: string;
  titulo: string;
  conteudo: string;
}

export type AtaFormData = AtaRequest;

export const ataVazia: AtaFormData = {
  dataAta: "",
  idPessoaRedator: "",
  nomeRedator: "",
  titulo: "",
  conteudo: "",
};
