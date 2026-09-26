import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader";
import { Loading } from "../../components/common/Loading";
import { Alert } from "../../components/common/Alert";
import { DataTable } from "../../components/common/DataTable";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { caixaService } from "../../services/caixaService";
import { extrairMensagemErro } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import type { Caixa } from "../../types/caixa";

export function CaixaListPage() {
  const { showToast } = useToast();
  const [caixas, setCaixas] = useState<Caixa[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [paraExcluir, setParaExcluir] = useState<Caixa | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setCaixas(await caixaService.listar());
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
      await caixaService.remover(paraExcluir.id);
      showToast("success", `Caixa "${paraExcluir.nome}" removido com sucesso.`);
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
      <PageHeader titulo="Caixas" subtitulo="Caixas usados para registrar entradas e saídas financeiras." acaoLink="/caixas/novo" acaoTexto="Novo caixa" />

      {erro && <Alert mensagem={erro} />}

      {carregando ? (
        <Loading texto="Carregando caixas..." />
      ) : (
        <DataTable
          data={caixas}
          keyExtractor={(item) => item.id}
          mensagemVazia="Nenhum caixa cadastrado ainda."
          columns={[
            { header: "Nome", render: (item) => item.nome },
            { header: "Observação", render: (item) => item.observacao || "-" },
            {
              header: "Situação",
              render: (item) => <span className={`badge ${item.ativo ? "badge-verde" : "badge-cinza"}`}>{item.ativo ? "Ativo" : "Inativo"}</span>,
            },
            {
              header: "",
              className: "col-acoes",
              render: (item) => (
                <>
                  <Link to={`/caixas/${item.id}/editar`} className="btn btn-secundario btn-sm btn-icone" title="Editar" aria-label={`Editar ${item.nome}`}>
                    ✎
                  </Link>{" "}
                  <button
                    type="button"
                    className="btn btn-perigo btn-sm btn-icone"
                    title="Excluir"
                    aria-label={`Excluir ${item.nome}`}
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
        titulo="Excluir caixa"
        mensagem={`Tem certeza de que deseja excluir o caixa "${paraExcluir?.nome}"? Se ele já tiver lançamentos financeiros, desative-o em vez de excluir.`}
        carregando={excluindo}
        onCancelar={() => setParaExcluir(null)}
        onConfirmar={confirmarExclusao}
      />
    </div>
  );
}
