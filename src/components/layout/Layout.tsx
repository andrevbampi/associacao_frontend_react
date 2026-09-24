import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import "./Layout.css";

const LINKS = [
  { to: "/", label: "Início", fim: true, icone: "🏠" },
  { to: "/pessoas", label: "Pessoas", icone: "👤" },
  { to: "/usuarios", label: "Usuários", icone: "🔑" },
  { to: "/membros", label: "Membros", icone: "🪪" },
  { to: "/status-membro", label: "Status de Membro", icone: "🏷️" },
];

export function Layout() {
  const [menuAberto, setMenuAberto] = useState(false);

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
          </ul>
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
