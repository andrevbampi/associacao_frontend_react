import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { RotaProtegida } from "./components/auth/RotaProtegida";
import { LoginPage } from "./pages/LoginPage";
import { Dashboard } from "./pages/Dashboard";
import { PessoaListPage } from "./pages/pessoa/PessoaListPage";
import { PessoaFormPage } from "./pages/pessoa/PessoaFormPage";
import { UsuarioListPage } from "./pages/usuario/UsuarioListPage";
import { UsuarioFormPage } from "./pages/usuario/UsuarioFormPage";
import { MembroListPage } from "./pages/membro/MembroListPage";
import { MembroFormPage } from "./pages/membro/MembroFormPage";
import { MembroDetailPage } from "./pages/membro/MembroDetailPage";
import { StatusMembroListPage } from "./pages/statusMembro/StatusMembroListPage";
import { StatusMembroFormPage } from "./pages/statusMembro/StatusMembroFormPage";
import { TipoEventoListPage } from "./pages/tipoEvento/TipoEventoListPage";
import { TipoEventoFormPage } from "./pages/tipoEvento/TipoEventoFormPage";
import { ProdutoListPage } from "./pages/produto/ProdutoListPage";
import { ProdutoFormPage } from "./pages/produto/ProdutoFormPage";
import { CategoriaProdutoListPage } from "./pages/categoriaProduto/CategoriaProdutoListPage";
import { CategoriaProdutoFormPage } from "./pages/categoriaProduto/CategoriaProdutoFormPage";
import { ComandaListPage } from "./pages/comanda/ComandaListPage";
import { ComandaAbrirPage } from "./pages/comanda/ComandaAbrirPage";
import { ComandaDetailPage } from "./pages/comanda/ComandaDetailPage";
import { EstoqueConsultaPage } from "./pages/estoque/EstoqueConsultaPage";
import { MovimentoEstoqueFormPage } from "./pages/estoque/MovimentoEstoqueFormPage";
import { MovimentoEstoqueListPage } from "./pages/estoque/MovimentoEstoqueListPage";
import { CategoriaFinanceiraListPage } from "./pages/categoriaFinanceira/CategoriaFinanceiraListPage";
import { CategoriaFinanceiraFormPage } from "./pages/categoriaFinanceira/CategoriaFinanceiraFormPage";
import { LancamentoFinanceiroListPage } from "./pages/financeiro/LancamentoFinanceiroListPage";
import { LancamentoFinanceiroFormPage } from "./pages/financeiro/LancamentoFinanceiroFormPage";
import { CaixaListPage } from "./pages/caixa/CaixaListPage";
import { CaixaFormPage } from "./pages/caixa/CaixaFormPage";
import { ParametroSistemaPage } from "./pages/parametroSistema/ParametroSistemaPage";
import { AtaListPage } from "./pages/ata/AtaListPage";
import { AtaFormPage } from "./pages/ata/AtaFormPage";
import { RelatorioConsumoProdutosPage } from "./pages/relatorio/RelatorioConsumoProdutosPage";
import { RelatorioLivroCaixaPage } from "./pages/relatorio/RelatorioLivroCaixaPage";
import { GrupoListPage } from "./pages/grupo/GrupoListPage";
import { GrupoFormPage } from "./pages/grupo/GrupoFormPage";
import { UsuarioAcessoPage } from "./pages/usuario/UsuarioAcessoPage";
import { AuditoriaAcessoPage } from "./pages/auditoriaAcesso/AuditoriaAcessoPage";
import { NotFoundPage } from "./pages/NotFoundPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />

          <Route element={<RotaProtegida permissao="pessoa:visualizar" />}>
            <Route path="pessoas" element={<PessoaListPage />} />
          </Route>

          <Route element={<RotaProtegida permissao="pessoa:criar" />}>
            <Route path="pessoas/nova" element={<PessoaFormPage />} />
          </Route>

          <Route element={<RotaProtegida permissao="pessoa:editar" />}>
            <Route path="pessoas/:id/editar" element={<PessoaFormPage />} />
          </Route>

          <Route element={<RotaProtegida permissao="usuario:visualizar" />}>
            <Route path="usuarios" element={<UsuarioListPage />} />
          </Route>

          <Route element={<RotaProtegida permissao="usuario:criar" />}>
            <Route path="usuarios/novo" element={<UsuarioFormPage />} />
          </Route>

          <Route element={<RotaProtegida permissao="usuario:editar" />}>
            <Route path="usuarios/:id/editar" element={<UsuarioFormPage />} />
          </Route>

          <Route element={<RotaProtegida permissao="membro:visualizar" />}>
            <Route path="membros" element={<MembroListPage />} />
            <Route path="membros/:id" element={<MembroDetailPage />} />
          </Route>

          <Route element={<RotaProtegida permissao="membro:criar" />}>
            <Route path="membros/novo" element={<MembroFormPage />} />
          </Route>

          <Route element={<RotaProtegida permissao="membro:editar" />}>
            <Route path="membros/:id/editar" element={<MembroFormPage />} />
          </Route>

          <Route element={<RotaProtegida permissao="status-membro:visualizar" />}>
            <Route path="status-membro" element={<StatusMembroListPage />} />
          </Route>

          <Route element={<RotaProtegida permissao="status-membro:criar" />}>
            <Route path="status-membro/novo" element={<StatusMembroFormPage />} />
          </Route>

          <Route element={<RotaProtegida permissao="status-membro:editar" />}>
            <Route path="status-membro/:id/editar" element={<StatusMembroFormPage />} />
          </Route>

          <Route element={<RotaProtegida permissao="tipo-evento:visualizar" />}>
            <Route path="tipos-evento" element={<TipoEventoListPage />} />
          </Route>

          <Route element={<RotaProtegida permissao="tipo-evento:criar" />}>
            <Route path="tipos-evento/novo" element={<TipoEventoFormPage />} />
          </Route>

          <Route element={<RotaProtegida permissao="tipo-evento:editar" />}>
            <Route path="tipos-evento/:id/editar" element={<TipoEventoFormPage />} />
          </Route>

          <Route element={<RotaProtegida permissao="produto:visualizar" />}>
            <Route path="produtos" element={<ProdutoListPage />} />
          </Route>

          <Route element={<RotaProtegida permissao="produto:criar" />}>
            <Route path="produtos/novo" element={<ProdutoFormPage />} />
          </Route>

          <Route element={<RotaProtegida permissao="produto:editar" />}>
            <Route path="produtos/:id/editar" element={<ProdutoFormPage />} />
          </Route>

          <Route element={<RotaProtegida permissao="categoria-produto:visualizar" />}>
            <Route path="categorias-produto" element={<CategoriaProdutoListPage />} />
          </Route>

          <Route element={<RotaProtegida permissao="categoria-produto:criar" />}>
            <Route path="categorias-produto/nova" element={<CategoriaProdutoFormPage />} />
          </Route>

          <Route element={<RotaProtegida permissao="categoria-produto:editar" />}>
            <Route path="categorias-produto/:id/editar" element={<CategoriaProdutoFormPage />} />
          </Route>

          <Route element={<RotaProtegida permissao="comanda:visualizar" />}>
            <Route path="comandas" element={<ComandaListPage />} />
            <Route path="comandas/:id" element={<ComandaDetailPage />} />
          </Route>

          <Route element={<RotaProtegida permissao="comanda:abrir" />}>
            <Route path="comandas/nova" element={<ComandaAbrirPage />} />
          </Route>

          <Route element={<RotaProtegida permissao="estoque:visualizar" />}>
            <Route path="estoque" element={<EstoqueConsultaPage />} />
            <Route path="estoque/movimentos" element={<MovimentoEstoqueListPage />} />
          </Route>

          <Route element={<RotaProtegida permissao="estoque:movimentar" />}>
            <Route path="estoque/nova" element={<MovimentoEstoqueFormPage />} />
          </Route>

          <Route element={<RotaProtegida permissao="categoria-financeira:visualizar" />}>
            <Route path="categorias-financeiras" element={<CategoriaFinanceiraListPage />} />
          </Route>

          <Route element={<RotaProtegida permissao="categoria-financeira:criar" />}>
            <Route path="categorias-financeiras/nova" element={<CategoriaFinanceiraFormPage />} />
          </Route>

          <Route element={<RotaProtegida permissao="categoria-financeira:editar" />}>
            <Route path="categorias-financeiras/:id/editar" element={<CategoriaFinanceiraFormPage />} />
          </Route>

          <Route element={<RotaProtegida permissao="financeiro:visualizar" />}>
            <Route path="financeiro" element={<LancamentoFinanceiroListPage />} />
          </Route>

          <Route element={<RotaProtegida permissao="financeiro:criar" />}>
            <Route path="financeiro/novo" element={<LancamentoFinanceiroFormPage />} />
          </Route>

          <Route element={<RotaProtegida permissao="financeiro:editar" />}>
            <Route path="financeiro/:id/editar" element={<LancamentoFinanceiroFormPage />} />
          </Route>

          <Route element={<RotaProtegida permissao="caixa:visualizar" />}>
            <Route path="caixas" element={<CaixaListPage />} />
          </Route>

          <Route element={<RotaProtegida permissao="caixa:criar" />}>
            <Route path="caixas/novo" element={<CaixaFormPage />} />
          </Route>

          <Route element={<RotaProtegida permissao="caixa:editar" />}>
            <Route path="caixas/:id/editar" element={<CaixaFormPage />} />
          </Route>

          <Route element={<RotaProtegida permissao="parametro:visualizar" />}>
            <Route path="parametros" element={<ParametroSistemaPage />} />
          </Route>

          <Route element={<RotaProtegida permissao="ata:visualizar" />}>
            <Route path="atas" element={<AtaListPage />} />
          </Route>

          <Route element={<RotaProtegida permissao="ata:criar" />}>
            <Route path="atas/nova" element={<AtaFormPage />} />
          </Route>

          <Route element={<RotaProtegida permissao="ata:editar" />}>
            <Route path="atas/:id/editar" element={<AtaFormPage />} />
          </Route>

          <Route element={<RotaProtegida permissao="relatorio:consumo-produtos" />}>
            <Route path="relatorios/consumo-produtos" element={<RelatorioConsumoProdutosPage />} />
          </Route>

          <Route element={<RotaProtegida permissao="relatorio:livro-caixa" />}>
            <Route path="relatorios/livro-caixa" element={<RelatorioLivroCaixaPage />} />
          </Route>

          <Route element={<RotaProtegida permissao="usuario:gerenciar-acesso" />}>
            <Route path="usuarios/:id/acesso" element={<UsuarioAcessoPage />} />
          </Route>

          <Route element={<RotaProtegida permissao="grupo:visualizar" />}>
            <Route path="grupos" element={<GrupoListPage />} />
          </Route>

          <Route element={<RotaProtegida permissao="grupo:criar" />}>
            <Route path="grupos/novo" element={<GrupoFormPage />} />
          </Route>

          <Route element={<RotaProtegida permissao="grupo:editar" />}>
            <Route path="grupos/:id/editar" element={<GrupoFormPage />} />
          </Route>

          <Route element={<RotaProtegida permissao="auditoria:visualizar" />}>
            <Route path="auditoria-acesso" element={<AuditoriaAcessoPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
