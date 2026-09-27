import { Fragment, useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useParametros } from "../../context/ParametrosContext";
import { ImagemAutenticada } from "../common/ImagemAutenticada";
import { apiBaseUrl } from "../../services/api";
import "./Layout.css";

const LINKS = [
  { to: "/", label: "Início", fim: true, icone: "🏠" },
  { to: "/comandas", label: "Comandas", icone: "🧾" },
  { to: "/estoque", label: "Estoque", icone: "📦" },
  { to: "/financeiro", label: "Financeiro", icone: "💰" },
];

const LINKS_RELATORIOS = [
  { to: "/relatorios/consumo-produtos", label: "Consumo de Produtos", icone: "📊" },
  { to: "/relatorios/livro-caixa", label: "Livro Caixa", icone: "📒" },
];

// Entidades que a associação gerencia no dia a dia.
const LINKS_CADASTROS = [
  { to: "/pessoas", label: "Pessoas", icone: "👤" },
  { to: "/usuarios", label: "Usuários", icone: "🔑" },
  { to: "/membros", label: "Membros", icone: "🪪" },
  { to: "/produtos", label: "Produtos", icone: "🛒" },
  { to: "/atas", label: "Atas", icone: "📄" },
];

// Tabelas de apoio e configuração — mexidas raramente, separadas dos
// cadastros do dia a dia para não misturar as duas coisas numa lista só.
const LINKS_CONFIGURACOES = [
  { to: "/status-membro", label: "Status de Membro", icone: "🏷️" },
  { to: "/tipos-evento", label: "Tipos de Evento", icone: "📌" },
  { to: "/categorias-produto", label: "Categorias de Produto", icone: "📁" },
  { to: "/categorias-financeiras", label: "Categorias Financeiras", icone: "🏦" },
  { to: "/caixas", label: "Caixas", icone: "🗄️" },
  { to: "/parametros", label: "Parâmetros do Sistema", icone: "⚙️" },
];

const SECOES_MENU = [
  { titulo: "Relatórios", links: LINKS_RELATORIOS },
  { titulo: "Cadastros", links: LINKS_CADASTROS },
  { titulo: "Configurações", links: LINKS_CONFIGURACOES },
];

interface LinkMenu {
  to: string;
  label: string;
  icone: string;
}

function SecaoMenu({ titulo, links, onNavegar }: { titulo: string; links: LinkMenu[]; onNavegar: () => void }) {
  return (
    <Fragment>
      <li className="sidebar-secao">{titulo}</li>
      {links.map((link) => (
        <li key={link.to}>
          <NavLink
            to={link.to}
            className={({ isActive }) => `sidebar-link ${isActive ? "sidebar-link-ativo" : ""}`}
            onClick={onNavegar}
          >
            <span className="sidebar-link-icone">{link.icone}</span>
            {link.label}
          </NavLink>
        </li>
      ))}
    </Fragment>
  );
}

export function Layout() {
  const [menuAberto, setMenuAberto] = useState(false);
  const { usuario, logout } = useAuth();
  const { showToast } = useToast();
  const { nomeAssociacao, logoUrl } = useParametros();

  function handleLogout() {
    logout();
    showToast("info", "Sessão encerrada.");
  }

  // Trava o scroll da página por trás enquanto o menu mobile está aberto —
  // sem isso, um arraste que começasse sobre o overlay podia rolar o
  // conteúdo de baixo em vez de (ou além de) navegar dentro do menu.
  useEffect(() => {
    if (!menuAberto) return;
    const overflowOriginal = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflowOriginal;
    };
  }, [menuAberto]);

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
        <span className="topbar-titulo">{nomeAssociacao}</span>
      </header>

      <div className="layout-corpo">
        <nav className={`sidebar ${menuAberto ? "sidebar-aberta" : ""}`}>
          <div className="sidebar-marca">
            {logoUrl ? (
              <img src={`${apiBaseUrl}${logoUrl}`} alt="Logo" className="sidebar-marca-logo" />
            ) : (
              <span className="sidebar-marca-icone">🌿</span>
            )}
            <span>{nomeAssociacao}</span>
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

            {SECOES_MENU.map((secao) => (
              <SecaoMenu key={secao.titulo} titulo={secao.titulo} links={secao.links} onNavegar={() => setMenuAberto(false)} />
            ))}
          </ul>

          <div className="sidebar-rodape">
            <div className="sidebar-usuario">
              {usuario?.pessoa?.temFoto ? (
                <ImagemAutenticada
                  src={`/pessoa/${usuario.pessoa.id}/foto`}
                  alt="Foto do usuário"
                  className="sidebar-usuario-foto"
                  placeholder={<span className="sidebar-usuario-icone">👤</span>}
                />
              ) : (
                <span className="sidebar-usuario-icone">👤</span>
              )}
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
