import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader";
import { Loading } from "../../components/common/Loading";
import { Alert } from "../../components/common/Alert";
import { DataTable } from "../../components/common/DataTable";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { produtoService } from "../../services/produtoService";
import { categoriaProdutoService } from "../../services/categoriaProdutoService";
import { extrairMensagemErro } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import type { Produto } from "../../types/produto";
import type { CategoriaProduto } from "../../types/categoriaProduto";
import { formatarMoeda } from "../../utils/formatters";

export function ProdutoListPage() {
  const { showToast } = useToast();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<CategoriaProduto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [paraExcluir, setParaExcluir] = useState<Produto | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const [descricao, setDescricao] = useState("");
  const [idCategoria, setIdCategoria] = useState<number | "">("");
  const [ativo, setAtivo] = useState<"" | "true" | "false">("");

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setProdutos(
        await produtoService.listar({
          descricao: descricao || undefined,
          idCategoria: idCategoria === "" ? undefined : idCategoria,
          ativo: ativo === "" ? undefined : ativo === "true",
        })
      );
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setCarregando(false);
    }
  }, [descricao, idCategoria, ativo]);

  useEffect(() => {
    categoriaProdutoService.listar().then(setCategorias).catch(() => {});
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function limparFiltros() {
    setDescricao("");
    setIdCategoria("");
    setAtivo("");
  }

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

      <div className="filtros-card">
        <div className="filtros-grid">
          <div className="campo">
            <label htmlFor="filtroDescricao">Descrição</label>
            <input id="filtroDescricao" type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Buscar por descrição..." />
          </div>
          <div className="campo">
            <label htmlFor="filtroCategoria">Categoria</label>
            <select id="filtroCategoria" value={idCategoria} onChange={(e) => setIdCategoria(e.target.value ? Number(e.target.value) : "")}>
              <option value="">Todas</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.descricao}
                </option>
              ))}
            </select>
          </div>
          <div className="campo">
            <label htmlFor="filtroAtivo">Situação</label>
            <select id="filtroAtivo" value={ativo} onChange={(e) => setAtivo(e.target.value as typeof ativo)}>
              <option value="">Todas</option>
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </div>
          <div className="filtros-acoes">
            <button type="button" className="btn btn-secundario btn-sm" onClick={limparFiltros}>
              Limpar filtros
            </button>
          </div>
        </div>
      </div>

      {erro && <Alert mensagem={erro} />}

      {carregando ? (
        <Loading texto="Carregando produtos..." />
      ) : (
        <DataTable
          data={produtos}
          keyExtractor={(item) => item.id}
          mensagemVazia="Nenhum produto encontrado para esse filtro."
          columns={[
            { header: "Descrição", render: (item) => item.descricao },
            { header: "Categoria", render: (item) => item.categoria?.descricao ?? "-" },
            { header: "Preço", render: (item) => formatarMoeda(item.preco) },
            { header: "Preço membro", render: (item) => formatarMoeda(item.precoMembro) },
            {
              header: "Estoque",
              render: (item) =>
                item.controlaEstoque ? (
                  <span className={`badge ${item.estoqueMinimo != null && item.estoqueAtual <= item.estoqueMinimo ? "badge-vermelho" : "badge-cinza"}`}>
                    {item.estoqueAtual}
                    {item.estoqueMinimo != null && item.estoqueAtual <= item.estoqueMinimo ? " ⚠ baixo" : ""}
                  </span>
                ) : (
                  "-"
                ),
            },
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
