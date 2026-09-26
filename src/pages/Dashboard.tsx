import { Link } from "react-router-dom";
import { useParametros } from "../context/ParametrosContext";
import "./Dashboard.css";

const CARDS = [
  {
    to: "/pessoas",
    icone: "👤",
    titulo: "Pessoas",
    descricao: "Cadastro de pessoas físicas e jurídicas, base para usuários e membros.",
  },
  {
    to: "/usuarios",
    icone: "🔑",
    titulo: "Usuários",
    descricao: "Contas de acesso ao sistema, vinculadas a uma pessoa.",
  },
  {
    to: "/membros",
    icone: "🪪",
    titulo: "Membros",
    descricao: "Pessoas associadas, com status e datas de inclusão/saída.",
  },
  {
    to: "/status-membro",
    icone: "🏷️",
    titulo: "Status de Membro",
    descricao: "Situações que um membro pode ter (ex.: ativo, inadimplente).",
  },
];

export function Dashboard() {
  const { nomeAssociacao } = useParametros();

  return (
    <div>
      <div className="dashboard-intro">
        <h1>Bem-vindo(a) à {nomeAssociacao} 🌿</h1>
        <p>Escolha uma área para gerenciar os dados da associação.</p>
      </div>
      <div className="dashboard-grid">
        {CARDS.map((card) => (
          <Link key={card.to} to={card.to} className="dashboard-card">
            <span className="dashboard-card-icone">{card.icone}</span>
            <div>
              <h2>{card.titulo}</h2>
              <p>{card.descricao}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
