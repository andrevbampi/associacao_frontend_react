import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader";
import { Loading } from "../../components/common/Loading";
import { Alert } from "../../components/common/Alert";
import { DataTable } from "../../components/common/DataTable";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { statusMembroService } from "../../services/statusMembroService";
import { extrairMensagemErro } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import type { StatusMembro } from "../../types/statusMembro";

export function StatusMembroListPage() {
  const { showToast } = useToast();
  const [status, setStatus] = useState<StatusMembro[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [paraExcluir, setParaExcluir] = useState<StatusMembro | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setStatus(await statusMembroService.listar());
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
      await statusMembroService.remover(paraExcluir.id);
      showToast("success", `Status "${paraExcluir.descricao}" removido com sucesso.`);
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
      <PageHeader titulo="Status de Membro" subtitulo="Situações que um membro pode assumir na associação." acaoLink="/status-membro/novo" acaoTexto="Novo status" />

      {erro && <Alert mensagem={erro} />}

      {carregando ? (
        <Loading texto="Carregando status..." />
      ) : (
        <DataTable
          data={status}
          keyExtractor={(item) => item.id}
          mensagemVazia="Nenhum status cadastrado ainda."
          columns={[
            { header: "Descrição", render: (item) => item.descricao },
            {
              header: "",
              className: "col-acoes",
              render: (item) => (
                <>
                  <Link to={`/status-membro/${item.id}/editar`} className="btn btn-secundario btn-sm btn-icone" title="Editar" aria-label={`Editar ${item.descricao}`}>
                    ✎
                  </Link>{" "}
                  <button
                    type="button"
                    className="btn btn-perigo btn-sm btn-icone"
                    title="Excluir"
                    aria-label={`Excluir ${item.descricao}`}
                    onClick={() => setParaExcluir(item)}
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
        titulo="Excluir status"
        mensagem={`Tem certeza de que deseja excluir o status "${paraExcluir?.descricao}"?`}
        carregando={excluindo}
        onCancelar={() => setParaExcluir(null)}
        onConfirmar={confirmarExclusao}
      />
    </div>
  );
}
