import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader";
import { Loading } from "../../components/common/Loading";
import { Alert } from "../../components/common/Alert";
import { DataTable } from "../../components/common/DataTable";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { membroService } from "../../services/membroService";
import { extrairMensagemErro } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import type { MembroResponse } from "../../types/membro";
import { formatarData } from "../../utils/formatters";

export function MembroListPage() {
  const { showToast } = useToast();
  const [membros, setMembros] = useState<MembroResponse[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [paraExcluir, setParaExcluir] = useState<MembroResponse | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setMembros(await membroService.listar());
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
      await membroService.remover(paraExcluir.id);
      showToast("success", `Membro "${paraExcluir.pessoa?.nome}" removido com sucesso.`);
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
      <PageHeader titulo="Membros" subtitulo="Pessoas associadas, com status e período de vínculo." acaoLink="/membros/novo" acaoTexto="Novo membro" />

      {erro && <Alert mensagem={erro} />}

      {carregando ? (
        <Loading texto="Carregando membros..." />
      ) : (
        <DataTable
          data={membros}
          keyExtractor={(item) => item.id}
          mensagemVazia="Nenhum membro cadastrado ainda."
          columns={[
            { header: "Pessoa", render: (item) => item.pessoa?.nome ?? "-" },
            { header: "Status", render: (item) => item.status?.descricao ?? "-" },
            { header: "Inclusão", render: (item) => formatarData(item.dataInclusao) },
            { header: "Saída", render: (item) => formatarData(item.dataSaida) },
            {
              header: "Situação",
              render: (item) => (
                <span className={`badge ${item.ativo ? "badge-verde" : "badge-cinza"}`}>
                  {item.ativo ? "Ativo" : "Inativo"}
                </span>
              ),
            },
            {
              header: "",
              className: "col-acoes",
              render: (item) => (
                <>
                  <Link to={`/membros/${item.id}/editar`} className="btn btn-secundario btn-sm btn-icone" title="Editar" aria-label={`Editar membro ${item.pessoa?.nome}`}>
                    ✎
                  </Link>{" "}
                  <button
                    type="button"
                    className="btn btn-perigo btn-sm btn-icone"
                    title="Excluir"
                    aria-label={`Excluir membro ${item.pessoa?.nome}`}
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
        titulo="Excluir membro"
        mensagem={`Tem certeza de que deseja excluir o vínculo de membro de "${paraExcluir?.pessoa?.nome}"?`}
        carregando={excluindo}
        onCancelar={() => setParaExcluir(null)}
        onConfirmar={confirmarExclusao}
      />
    </div>
  );
}
