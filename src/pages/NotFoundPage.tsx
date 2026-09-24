import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
      <h1>404</h1>
      <p>Página não encontrada.</p>
      <Link to="/" className="btn btn-primario">
        Voltar ao início
      </Link>
    </div>
  );
}
