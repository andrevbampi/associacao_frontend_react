import { Fragment, useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useParametros } from "../../context/ParametrosContext";
import { useTheme } from "../../context/ThemeContext";
import { ImagemAutenticada } from "../common/ImagemAutenticada";
import { apiBaseUrl } from "../../services/api";
import "./Layout.css";

const LINKS = [
  { to: "/", label: "Início", fim: true, icone: "🏠" },
  { to: "/comandas", label: "Comandas", icone: "🧾", permissao: "comanda:visualizar" },
  { to: "/estoque", label: "Estoque", icone: "📦", permissao: "estoque:visualizar" },
  { to: "/financeiro", label: "Financeiro", icone: "💰", permissao: "financeiro:visualizar" },
];

const LINKS_RELATORIOS = [
  { to: "/relatorios/consumo-produtos", label: "Consumo de Produtos", icone: "📊", permissao: "relatorio:consumo-produtos" },
  { to: "/relatorios/livro-caixa", label: "Livro Caixa", icone: "📒", permissao: "relatorio:livro-caixa" },
];

// Entidades que a associação gerencia no dia a dia.
const LINKS_CADASTROS = [
  { to: "/pessoas", label: "Pessoas", icone: "👤", permissao: "pessoa:visualizar" },
  { to: "/usuarios", label: "Usuários", icone: "🔑", permissao: "usuario:visualizar" },
  { to: "/membros", label: "Membros", icone: "🪪", permissao: "membro:visualizar" },
  { to: "/produtos", label: "Produtos", icone: "🛒", permissao: "produto:visualizar" },
  { to: "/atas", label: "Atas", icone: "📄", permissao: "ata:visualizar" },
];

// Tabelas de apoio e configuração — mexidas raramente, separadas dos
// cadastros do dia a dia para não misturar as duas coisas numa lista só.
const LINKS_CONFIGURACOES = [
  { to: "/status-membro", label: "Status de Membro", icone: "🏷️", permissao: "status-membro:visualizar" },
  { to: "/tipos-evento", label: "Tipos de Evento", icone: "📌", permissao: "tipo-evento:visualizar" },
  { to: "/categorias-produto", label: "Categorias de Produto", icone: "📁", permissao: "categoria-produto:visualizar" },
  { to: "/categorias-financeiras", label: "Categorias Financeiras", icone: "🏦", permissao: "categoria-financeira:visualizar" },
  { to: "/caixas", label: "Caixas", icone: "🗄️", permissao: "caixa:visualizar" },
  { to: "/parametros", label: "Parâmetros do Sistema", icone: "⚙️", permissao: "parametro:visualizar" },
  { to: "/grupos", label: "Grupos de Acesso", icone: "🛡️", permissao: "grupo:visualizar" },
  { to: "/auditoria-acesso", label: "Auditoria de Acesso", icone: "🕵️", permissao: "auditoria:visualizar" },
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
  /** Permissão necessária para o item aparecer no menu. */
  permissao: string;
  fim?: boolean;
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
  const { usuario, logout, pode } = useAuth();
  const { showToast } = useToast();
  const { nomeAssociacao, logoUrl } = useParametros();
  const { tema, alternarTema } = useTheme();

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
            {LINKS.filter((link) => link.to === "/" || pode(link.permissao ?? "")).map((link) => (
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

            {SECOES_MENU.map((secao) => ({ ...secao, links: secao.links.filter((link) => pode(link.permissao)) }))
              .filter((secao) => secao.links.length > 0)
              .map((secao) => (
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
            <NavLink to="/alterar-senha" className="sidebar-tema" onClick={() => setMenuAberto(false)}>
              🔒 Alterar senha
            </NavLink>
            <button type="button" className="sidebar-tema" onClick={alternarTema}>
              {tema === "dark" ? "☀️ Modo claro" : "🌙 Modo escuro"}
            </button>
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
