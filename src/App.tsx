import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
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
import { NotFoundPage } from "./pages/NotFoundPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />

          <Route path="pessoas" element={<PessoaListPage />} />
          <Route path="pessoas/nova" element={<PessoaFormPage />} />
          <Route path="pessoas/:id/editar" element={<PessoaFormPage />} />

          <Route path="usuarios" element={<UsuarioListPage />} />
          <Route path="usuarios/novo" element={<UsuarioFormPage />} />
          <Route path="usuarios/:id/editar" element={<UsuarioFormPage />} />

          <Route path="membros" element={<MembroListPage />} />
          <Route path="membros/novo" element={<MembroFormPage />} />
          <Route path="membros/:id" element={<MembroDetailPage />} />
          <Route path="membros/:id/editar" element={<MembroFormPage />} />

          <Route path="status-membro" element={<StatusMembroListPage />} />
          <Route path="status-membro/novo" element={<StatusMembroFormPage />} />
          <Route path="status-membro/:id/editar" element={<StatusMembroFormPage />} />

          <Route path="tipos-evento" element={<TipoEventoListPage />} />
          <Route path="tipos-evento/novo" element={<TipoEventoFormPage />} />
          <Route path="tipos-evento/:id/editar" element={<TipoEventoFormPage />} />

          <Route path="produtos" element={<ProdutoListPage />} />
          <Route path="produtos/novo" element={<ProdutoFormPage />} />
          <Route path="produtos/:id/editar" element={<ProdutoFormPage />} />

          <Route path="categorias-produto" element={<CategoriaProdutoListPage />} />
          <Route path="categorias-produto/nova" element={<CategoriaProdutoFormPage />} />
          <Route path="categorias-produto/:id/editar" element={<CategoriaProdutoFormPage />} />

          <Route path="comandas" element={<ComandaListPage />} />
          <Route path="comandas/nova" element={<ComandaAbrirPage />} />
          <Route path="comandas/:id" element={<ComandaDetailPage />} />

          <Route path="estoque" element={<EstoqueConsultaPage />} />
          <Route path="estoque/nova" element={<MovimentoEstoqueFormPage />} />
          <Route path="estoque/movimentos" element={<MovimentoEstoqueListPage />} />

          <Route path="categorias-financeiras" element={<CategoriaFinanceiraListPage />} />
          <Route path="categorias-financeiras/nova" element={<CategoriaFinanceiraFormPage />} />
          <Route path="categorias-financeiras/:id/editar" element={<CategoriaFinanceiraFormPage />} />

          <Route path="financeiro" element={<LancamentoFinanceiroListPage />} />
          <Route path="financeiro/novo" element={<LancamentoFinanceiroFormPage />} />
          <Route path="financeiro/:id/editar" element={<LancamentoFinanceiroFormPage />} />

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
