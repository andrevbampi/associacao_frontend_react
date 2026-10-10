import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader";
import { Loading } from "../../components/common/Loading";
import { Alert } from "../../components/common/Alert";
import { DataTable } from "../../components/common/DataTable";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { grupoService } from "../../services/grupoService";
import { extrairMensagemErro } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import type { Grupo } from "../../types/acesso";

export function GrupoListPage() {
  const { pode } = useAuth();
  const { showToast } = useToast();
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [paraExcluir, setParaExcluir] = useState<Grupo | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setGrupos(await grupoService.listar());
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
      await grupoService.remover(paraExcluir.id);
      showToast("success", `Grupo "${paraExcluir.nome}" removido com sucesso.`);
      setParaExcluir(null);
      carregar();
    } catch (error) {
      showToast("error", extrairMensagemErro(error));
      setParaExcluir(null);
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <div>
      <PageHeader
        titulo="Grupos de Acesso"
        subtitulo="Conjuntos de permissões. Cada usuário pode pertencer a vários grupos."
        acaoLink={pode("grupo:criar") ? "/grupos/novo" : undefined}
        acaoTexto="Novo grupo"
      />

      {erro && <Alert mensagem={erro} />}

      {carregando ? (
        <Loading texto="Carregando grupos..." />
      ) : (
        <DataTable
          data={grupos}
          keyExtractor={(grupo) => grupo.id}
          mensagemVazia="Nenhum grupo cadastrado."
          columns={[
            { header: "Nome", render: (grupo) => grupo.nome },
            { header: "Descrição", render: (grupo) => grupo.descricao ?? "-" },
            {
              header: "Tipo",
              render: (grupo) =>
                grupo.administrador ? <span className="badge badge-vermelho">Administrador</span> : <span className="badge badge-cinza">Comum</span>,
            },
            { header: "Permissões", render: (grupo) => (grupo.administrador ? "Todas" : grupo.permissoes.length) },
            { header: "Usuários", render: (grupo) => grupo.totalUsuarios },
            {
              header: "Status",
              render: (grupo) => <span className={`badge ${grupo.ativo ? "badge-verde" : "badge-cinza"}`}>{grupo.ativo ? "Ativo" : "Inativo"}</span>,
            },
            {
              header: "",
              className: "col-acoes",
              render: (grupo) => (
                <>
                  {pode("grupo:editar") && (
                    <Link to={`/grupos/${grupo.id}/editar`} className="btn btn-secundario btn-sm btn-icone" title="Editar" aria-label={`Editar ${grupo.nome}`}>
                      ✎
                    </Link>
                  )}{" "}
                  {pode("grupo:excluir") && (
                    <button
                      type="button"
                      className="btn btn-perigo btn-sm btn-icone"
                      title="Excluir"
                      aria-label={`Excluir ${grupo.nome}`}
                      onClick={() => setParaExcluir(grupo)}
                    >
                      🗑
                    </button>
                  )}
                </>
              ),
            },
          ]}
        />
      )}

      <ConfirmDialog
        aberto={paraExcluir !== null}
        titulo="Excluir grupo"
        mensagem={`Tem certeza de que deseja excluir o grupo "${paraExcluir?.nome}"?`}
        carregando={excluindo}
        onCancelar={() => setParaExcluir(null)}
        onConfirmar={confirmarExclusao}
      />
    </div>
  );
}
