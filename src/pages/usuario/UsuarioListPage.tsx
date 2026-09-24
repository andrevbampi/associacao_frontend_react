import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader";
import { Loading } from "../../components/common/Loading";
import { Alert } from "../../components/common/Alert";
import { DataTable } from "../../components/common/DataTable";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { usuarioService } from "../../services/usuarioService";
import { extrairMensagemErro } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import type { UsuarioResponse } from "../../types/usuario";

export function UsuarioListPage() {
  const { showToast } = useToast();
  const [usuarios, setUsuarios] = useState<UsuarioResponse[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [paraExcluir, setParaExcluir] = useState<UsuarioResponse | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setUsuarios(await usuarioService.listar());
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function confirmarExclusao() {
    if (!paraExcluir) return;
    setExcluindo(true);
    try {
      await usuarioService.remover(paraExcluir.id);
      showToast("success", `Usuário "${paraExcluir.login}" removido com sucesso.`);
      setParaExcluir(null);
      carregar();
    } catch (error) {
      showToast("error", extrairMensagemErro(error));
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <div>
      <PageHeader titulo="Usuários" subtitulo="Contas de acesso vinculadas a uma pessoa." acaoLink="/usuarios/novo" acaoTexto="Novo usuário" />

      {erro && <Alert mensagem={erro} />}

      {carregando ? (
        <Loading texto="Carregando usuários..." />
      ) : (
        <DataTable
          data={usuarios}
          keyExtractor={(usuario) => usuario.id}
          mensagemVazia="Nenhum usuário cadastrado ainda."
          columns={[
            { header: "Login", render: (usuario) => usuario.login },
            { header: "Pessoa", render: (usuario) => usuario.pessoa?.nome ?? "-" },
            {
              header: "Status",
              render: (usuario) => (
                <span className={`badge ${usuario.ativo ? "badge-verde" : "badge-cinza"}`}>
                  {usuario.ativo ? "Ativo" : "Inativo"}
                </span>
              ),
            },
            {
              header: "",
              className: "col-acoes",
              render: (usuario) => (
                <>
                  <Link to={`/usuarios/${usuario.id}/editar`} className="btn btn-secundario btn-sm btn-icone" title="Editar" aria-label={`Editar ${usuario.login}`}>
                    ✎
                  </Link>{" "}
                  <button
                    type="button"
                    className="btn btn-perigo btn-sm btn-icone"
                    title="Excluir"
                    aria-label={`Excluir ${usuario.login}`}
                    onClick={() => setParaExcluir(usuario)}
                  >
                    🗑
                  </button>
                </>
              ),
            },
          ]}
        />
      )}

      <ConfirmDialog
        aberto={paraExcluir !== null}
        titulo="Excluir usuário"
        mensagem={`Tem certeza de que deseja excluir o usuário "${paraExcluir?.login}"?`}
        carregando={excluindo}
        onCancelar={() => setParaExcluir(null)}
        onConfirmar={confirmarExclusao}
      />
    </div>
  );
}
