import type { Pessoa } from "./pessoa";
import type { StatusMembro } from "./statusMembro";

export interface MembroResponse {
  id: number;
  pessoa: Pessoa;
  status: StatusMembro;
  ativo: boolean;
  dataInclusao: string;
  dataSaida: string | null;
}

export interface MembroRequest {
  id?: number;
  idPessoa: number;
  idStatus: number;
  ativo: boolean;
  dataInclusao?: string | null;
  dataSaida?: string | null;
}

export interface MembroFormData {
  id?: number;
  idPessoa: number | "";
  idStatus: number | "";
  ativo: boolean;
  dataInclusao: string;
  dataSaida: string;
}

export const membroVazio: MembroFormData = {
  idPessoa: "",
  idStatus: "",
  ativo: true,
  dataInclusao: "",
  dataSaida: "",
};
