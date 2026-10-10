import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader";
import { Loading } from "../../components/common/Loading";
import { Alert } from "../../components/common/Alert";
import { DataTable } from "../../components/common/DataTable";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { ataService } from "../../services/ataService";
import { extrairMensagemErro } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import type { AtaResponse } from "../../types/ata";
import { formatarData, formatarDataHora } from "../../utils/formatters";
import { useAuth } from "../../context/AuthContext";

export function AtaListPage() {
  const { pode } = useAuth();
  const { showToast } = useToast();
  const [atas, setAtas] = useState<AtaResponse[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [paraExcluir, setParaExcluir] = useState<AtaResponse | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setAtas(await ataService.listar());
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
      await ataService.remover(paraExcluir.id);
      showToast("success", "Ata removida com sucesso.");
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
      <PageHeader titulo="Atas" subtitulo="Atas de reunião, com documentos anexados." acaoLink={pode("ata:criar") ? "/atas/nova" : undefined} acaoTexto="Nova ata" />

      {erro && <Alert mensagem={erro} />}

      {carregando ? (
        <Loading texto="Carregando atas..." />
      ) : (
        <DataTable
          data={atas}
          keyExtractor={(item) => item.id}
          mensagemVazia="Nenhuma ata cadastrada ainda."
          columns={[
            { header: "Data", render: (item) => formatarData(item.dataAta) },
            { header: "Título", render: (item) => item.titulo || "-" },
            { header: "Redator", render: (item) => item.pessoaRedator?.nome ?? item.nomeRedator ?? "-" },
            { header: "Última alteração", render: (item) => formatarDataHora(item.dataHoraUltimaAlteracao) },
            {
              header: "",
              className: "col-acoes",
              render: (item) => (
                <>
                  {pode("ata:editar") && (<Link to={`/atas/${item.id}/editar`} className="btn btn-secundario btn-sm btn-icone" title="Editar" aria-label={`Editar ata ${item.id}`}>
                    ✎
                  </Link>)}{" "}
                  {pode("ata:excluir") && (<button
                    type="button"
                    className="btn btn-perigo btn-sm btn-icone"
                    title="Excluir"
                    aria-label={`Excluir ata ${item.id}`}
                    onClick={() => setParaExcluir(item)}
                  >
                    🗑
                  </button>)}
                </>
              ),
            },
          ]}
        />
      )}

      <ConfirmDialog
        aberto={paraExcluir !== null}
        titulo="Excluir ata"
        mensagem="Tem certeza de que deseja excluir esta ata? Se houver documentos anexados, exclua-os primeiro."
        carregando={excluindo}
        onCancelar={() => setParaExcluir(null)}
        onConfirmar={confirmarExclusao}
      />
    </div>
  );
}
