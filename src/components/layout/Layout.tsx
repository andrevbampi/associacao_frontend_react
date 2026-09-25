import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import "./Layout.css";

const LINKS = [
  { to: "/", label: "Início", fim: true, icone: "🏠" },
  { to: "/comandas", label: "Comandas", icone: "🧾" },
];

const LINKS_CADASTROS = [
  { to: "/pessoas", label: "Pessoas", icone: "👤" },
  { to: "/usuarios", label: "Usuários", icone: "🔑" },
  { to: "/membros", label: "Membros", icone: "🪪" },
  { to: "/status-membro", label: "Status de Membro", icone: "🏷️" },
  { to: "/tipos-evento", label: "Tipos de Evento", icone: "📌" },
  { to: "/produtos", label: "Produtos", icone: "🛒" },
  { to: "/categorias-produto", label: "Categorias de Produto", icone: "🗂️" },
];

export function Layout() {
  const [menuAberto, setMenuAberto] = useState(false);
  const { usuario, logout } = useAuth();
  const { showToast } = useToast();

  function handleLogout() {
    logout();
    showToast("info", "Sessão encerrada.");
  }

  return (
    <div className="layout">
      <header className="topbar">
        <button
          type="button"
          className="menu-toggle"
          aria-label="Abrir menu de navegação"
          onClick={() => setMenuAberto((aberto) => !aberto)}
        >
          ☰
        </button>
        <span className="topbar-titulo">Associação</span>
      </header>

      <div className="layout-corpo">
        <nav className={`sidebar ${menuAberto ? "sidebar-aberta" : ""}`}>
          <div className="sidebar-marca">
            <span className="sidebar-marca-icone">🌿</span>
            <span>Associação</span>
          </div>
          <ul className="sidebar-lista">
            {LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.fim}
                  className={({ isActive }) => `sidebar-link ${isActive ? "sidebar-link-ativo" : ""}`}
                  onClick={() => setMenuAberto(false)}
                >
                  <span className="sidebar-link-icone">{link.icone}</span>
                  {link.label}
                </NavLink>
              </li>
            ))}

            <li className="sidebar-secao">Cadastros</li>
            {LINKS_CADASTROS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) => `sidebar-link ${isActive ? "sidebar-link-ativo" : ""}`}
                  onClick={() => setMenuAberto(false)}
                >
                  <span className="sidebar-link-icone">{link.icone}</span>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="sidebar-rodape">
            <div className="sidebar-usuario">
              <span className="sidebar-usuario-icone">👤</span>
              <div>
                <div className="sidebar-usuario-nome">{usuario?.pessoa?.nome ?? usuario?.login}</div>
                <div className="sidebar-usuario-login">@{usuario?.login}</div>
              </div>
            </div>
            <button type="button" className="sidebar-sair" onClick={handleLogout}>
              ⏻ Sair
            </button>
          </div>
        </nav>

        {menuAberto && <div className="sidebar-overlay" onClick={() => setMenuAberto(false)} />}

        <main className="conteudo">
          <div className="conteudo-container">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
