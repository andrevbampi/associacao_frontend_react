import { ImagemAutenticada } from "./ImagemAutenticada";
import { TIPO_PESSOA_FISICA, SEXO_MASCULINO, SEXO_FEMININO, type Pessoa } from "../../types/pessoa";

type PessoaResumo = Pick<Pessoa, "id" | "nome" | "tipo" | "sexo" | "temFoto">;

interface PessoaIconeProps {
  pessoa: PessoaResumo;
  className?: string;
}

// Ícone genérico quando a pessoa não tem foto cadastrada: varia conforme
// tipo (física/jurídica) e, para física, o sexo.
function iconeGenerico(pessoa: PessoaResumo): string {
  if (pessoa.tipo !== TIPO_PESSOA_FISICA) return "🏢";
  if (pessoa.sexo === SEXO_MASCULINO) return "👨";
  if (pessoa.sexo === SEXO_FEMININO) return "👩";
  return "👤";
}

export function PessoaIcone({ pessoa, className = "avatar-mini" }: PessoaIconeProps) {
  if (pessoa.temFoto) {
    return (
      <ImagemAutenticada
        src={`/pessoa/${pessoa.id}/foto`}
        alt={pessoa.nome}
        className={className}
        placeholder={<span className={`avatar-mini-icone ${className}`}>{iconeGenerico(pessoa)}</span>}
      />
    );
  }
  return <span className={`avatar-mini-icone ${className}`}>{iconeGenerico(pessoa)}</span>;
}
