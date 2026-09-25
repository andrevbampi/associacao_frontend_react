import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader";
import { Loading } from "../../components/common/Loading";
import { Alert } from "../../components/common/Alert";
import { DataTable } from "../../components/common/DataTable";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { produtoService } from "../../services/produtoService";
import { extrairMensagemErro } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import type { Produto } from "../../types/produto";
import { formatarMoeda } from "../../utils/formatters";

export function ProdutoListPage() {
  const { showToast } = useToast();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [paraExcluir, setParaExcluir] = useState<Produto | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setProdutos(await produtoService.listar());
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
      await produtoService.remover(paraExcluir.id);
      showToast("success", `Produto "${paraExcluir.descricao}" removido com sucesso.`);
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
      <PageHeader titulo="Produtos" subtitulo="Itens vendidos no bar/caixa, com preço normal e preço para membros." acaoLink="/produtos/novo" acaoTexto="Novo produto" />

      {erro && <Alert mensagem={erro} />}

      {carregando ? (
        <Loading texto="Carregando produtos..." />
      ) : (
        <DataTable
          data={produtos}
          keyExtractor={(item) => item.id}
          mensagemVazia="Nenhum produto cadastrado ainda."
          columns={[
            { header: "Descrição", render: (item) => item.descricao },
            { header: "Preço", render: (item) => formatarMoeda(item.preco) },
            { header: "Preço membro", render: (item) => formatarMoeda(item.precoMembro) },
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
                  <Link to={`/produtos/${item.id}/editar`} className="btn btn-secundario btn-sm btn-icone" title="Editar" aria-label={`Editar ${item.descricao}`}>
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
        titulo="Excluir produto"
        mensagem={`Tem certeza de que deseja excluir o produto "${paraExcluir?.descricao}"?`}
        carregando={excluindo}
        onCancelar={() => setParaExcluir(null)}
        onConfirmar={confirmarExclusao}
      />
    </div>
  );
}
