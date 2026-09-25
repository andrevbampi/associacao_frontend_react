import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader";
import { Loading } from "../../components/common/Loading";
import { Alert } from "../../components/common/Alert";
import { DataTable } from "../../components/common/DataTable";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { tipoEventoService } from "../../services/tipoEventoService";
import { extrairMensagemErro } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import type { TipoEvento } from "../../types/tipoEvento";

export function TipoEventoListPage() {
  const { showToast } = useToast();
  const [tipos, setTipos] = useState<TipoEvento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [paraExcluir, setParaExcluir] = useState<TipoEvento | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setTipos(await tipoEventoService.listar());
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
      await tipoEventoService.remover(paraExcluir.id);
      showToast("success", `Tipo de evento "${paraExcluir.descricao}" removido com sucesso.`);
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
      <PageHeader
        titulo="Tipos de Evento"
        subtitulo="Categorias usadas para classificar o histórico dos membros."
        acaoLink="/tipos-evento/novo"
        acaoTexto="Novo tipo"
      />

      {erro && <Alert mensagem={erro} />}

      {carregando ? (
        <Loading texto="Carregando tipos de evento..." />
      ) : (
        <DataTable
          data={tipos}
          keyExtractor={(item) => item.id}
          mensagemVazia="Nenhum tipo de evento cadastrado ainda."
          columns={[
            { header: "Descrição", render: (item) => item.descricao },
            {
              header: "",
              className: "col-acoes",
              render: (item) => (
                <>
                  <Link to={`/tipos-evento/${item.id}/editar`} className="btn btn-secundario btn-sm btn-icone" title="Editar" aria-label={`Editar ${item.descricao}`}>
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
        titulo="Excluir tipo de evento"
        mensagem={`Tem certeza de que deseja excluir o tipo de evento "${paraExcluir?.descricao}"?`}
        carregando={excluindo}
        onCancelar={() => setParaExcluir(null)}
        onConfirmar={confirmarExclusao}
      />
    </div>
  );
}
