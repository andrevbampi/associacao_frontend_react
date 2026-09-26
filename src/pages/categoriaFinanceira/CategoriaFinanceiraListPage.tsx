import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader";
import { Loading } from "../../components/common/Loading";
import { Alert } from "../../components/common/Alert";
import { DataTable } from "../../components/common/DataTable";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { categoriaFinanceiraService } from "../../services/categoriaFinanceiraService";
import { extrairMensagemErro } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { TIPO_CATEGORIA_FINANCEIRA_LABEL, type CategoriaFinanceira } from "../../types/categoriaFinanceira";

export function CategoriaFinanceiraListPage() {
  const { showToast } = useToast();
  const [categorias, setCategorias] = useState<CategoriaFinanceira[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [paraExcluir, setParaExcluir] = useState<CategoriaFinanceira | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setCategorias(await categoriaFinanceiraService.listar());
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
      await categoriaFinanceiraService.remover(paraExcluir.id);
      showToast("success", `Categoria "${paraExcluir.descricao}" removida com sucesso.`);
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
        titulo="Categorias Financeiras"
        subtitulo="Agrupam os lançamentos financeiros em receitas e despesas."
        acaoLink="/categorias-financeiras/nova"
        acaoTexto="Nova categoria"
      />

      {erro && <Alert mensagem={erro} />}

      {carregando ? (
        <Loading texto="Carregando categorias..." />
      ) : (
        <DataTable
          data={categorias}
          keyExtractor={(item) => item.id}
          mensagemVazia="Nenhuma categoria cadastrada ainda."
          columns={[
            { header: "Descrição", render: (item) => item.descricao },
            {
              header: "Tipo",
              render: (item) => (
                <span className={`badge ${item.tipo === "RECEITA" ? "badge-verde" : "badge-vermelho"}`}>
                  {TIPO_CATEGORIA_FINANCEIRA_LABEL[item.tipo]}
                </span>
              ),
            },
            {
              header: "",
              className: "col-acoes",
              render: (item) => (
                <>
                  <Link to={`/categorias-financeiras/${item.id}/editar`} className="btn btn-secundario btn-sm btn-icone" title="Editar" aria-label={`Editar ${item.descricao}`}>
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
        titulo="Excluir categoria"
        mensagem={`Tem certeza de que deseja excluir a categoria "${paraExcluir?.descricao}"?`}
        carregando={excluindo}
        onCancelar={() => setParaExcluir(null)}
        onConfirmar={confirmarExclusao}
      />
    </div>
  );
}
