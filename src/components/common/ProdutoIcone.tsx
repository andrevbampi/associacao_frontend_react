import { ImagemAutenticada } from "./ImagemAutenticada";
import type { Produto } from "../../types/produto";

type ProdutoResumo = Pick<Produto, "id" | "descricao" | "temFoto">;

interface ProdutoIconeProps {
  produto: ProdutoResumo;
  className?: string;
}

export function ProdutoIcone({ produto, className = "avatar-mini" }: ProdutoIconeProps) {
  if (produto.temFoto) {
    return (
      <ImagemAutenticada
        src={`/produto/${produto.id}/foto`}
        alt={produto.descricao}
        className={className}
        placeholder={<span className={`avatar-mini-icone ${className}`}>📦</span>}
      />
    );
  }
  return <span className={`avatar-mini-icone ${className}`}>📦</span>;
}
