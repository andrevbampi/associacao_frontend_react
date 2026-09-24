import { Link } from "react-router-dom";
import "./PageHeader.css";

interface PageHeaderProps {
  titulo: string;
  subtitulo?: string;
  acaoLink?: string;
  acaoTexto?: string;
}

export function PageHeader({ titulo, subtitulo, acaoLink, acaoTexto }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div>
        <h1>{titulo}</h1>
        {subtitulo && <p>{subtitulo}</p>}
      </div>
      {acaoLink && acaoTexto && (
        <Link to={acaoLink} className="btn btn-primario">
          + {acaoTexto}
        </Link>
      )}
    </div>
  );
}
