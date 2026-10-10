export interface PermissaoItem {
  codigo: string;
  modulo: string;
  descricao: string;
}

export interface Grupo {
  id: number;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  administrador: boolean;
  permissoes: string[];
  totalUsuarios: number;
}

export interface GrupoRequest {
  id?: number;
  nome: string;
  descricao: string;
  ativo: boolean;
  administrador: boolean;
  permissoes: string[];
}

export type EfeitoPermissao = "PERMITIR" | "NEGAR";

export interface ExcecaoPermissao {
  codigo: string;
  efeito: EfeitoPermissao;
}

export interface PermissaoEfetiva {
  codigo: string;
  origem: string;
}

export interface UsuarioAcesso {
  idUsuario: number;
  login: string;
  idsGrupos: number[];
  excecoes: ExcecaoPermissao[];
  permissoesEfetivas: PermissaoEfetiva[];
}

export interface UsuarioAcessoRequest {
  idsGrupos: number[];
  excecoes: ExcecaoPermissao[];
}

export interface AuditoriaAcesso {
  id: number;
  dataHora: string;
  login: string;
  acao: string;
  entidade: string;
  idEntidade: number | null;
  descricao: string;
}
