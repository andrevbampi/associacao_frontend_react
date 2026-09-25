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
import { ComandaListPage } from "./pages/comanda/ComandaListPage";
import { ComandaAbrirPage } from "./pages/comanda/ComandaAbrirPage";
import { ComandaDetailPage } from "./pages/comanda/ComandaDetailPage";
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

          <Route path="comandas" element={<ComandaListPage />} />
          <Route path="comandas/nova" element={<ComandaAbrirPage />} />
          <Route path="comandas/:id" element={<ComandaDetailPage />} />

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
