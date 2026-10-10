import { Link } from "react-router-dom";
import { PageHeader } from "../components/common/PageHeader";

export function SemPermissaoPage() {
  return (
    <div>
      <PageHeader titulo="Acesso negado" subtitulo="Você não tem permissão para acessar esta área." />
      <div className="form-card">
        <p>Se você precisa deste acesso, peça a um administrador para incluir seu usuário em um grupo com a permissão necessária.</p>
        <p>
          <Link to="/" className="btn btn-secundario">
            Voltar ao início
          </Link>
        </p>
      </div>
    </div>
  );
}
