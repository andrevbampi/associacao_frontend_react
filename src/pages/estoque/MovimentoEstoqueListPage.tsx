import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "../../components/common/PageHeader";
import { Loading } from "../../components/common/Loading";
import { Alert } from "../../components/common/Alert";
import { DataTable } from "../../components/common/DataTable";
import { estoqueService } from "../../services/estoqueService";
import { produtoService } from "../../services/produtoService";
import { extrairMensagemErro } from "../../services/api";
import type { MovimentoEstoqueResponse, OrigemMovimentoEstoque, TipoMovimentoEstoque } from "../../types/estoque";
import { ORIGEM_MOVIMENTO_LABEL, TIPOS_MOVIMENTO, TIPO_MOVIMENTO_LABEL } from "../../types/estoque";
import type { Produto } from "../../types/produto";
import { formatarDataHora } from "../../utils/formatters";

const ORIGENS_FILTRO: OrigemMovimentoEstoque[] = ["COMPRA", "VENDA", "AJUSTE_MANUAL", "INVENTARIO", "OUTRO"];

const TIPO_BADGE: Record<TipoMovimentoEstoque, string> = {
  ENTRADA: "badge-verde",
  SAIDA: "badge-vermelho",
  AJUSTE: "badge-cinza",
};

export function MovimentoEstoqueListPage() {
  const [movimentos, setMovimentos] = useState<MovimentoEstoqueResponse[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [idProduto, setIdProduto] = useState<number | "">("");
  const [tipo, setTipo] = useState<TipoMovimentoEstoque | "">("");
  const [origem, setOrigem] = useState<OrigemMovimentoEstoque | "">("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setMovimentos(
        await estoqueService.listarMovimentos({
          idProduto: idProduto === "" ? undefined : idProduto,
          tipo: tipo || undefined,
          origem: origem || undefined,
          dataInicio: dataInicio || undefined,
          dataFim: dataFim || undefined,
        })
      );
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setCarregando(false);
    }
  }, [idProduto, tipo, origem, dataInicio, dataFim]);

  useEffect(() => {
    produtoService.listar().then(setProdutos).catch(() => {});
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function limparFiltros() {
    setIdProduto("");
    setTipo("");
    setOrigem("");
    setDataInicio("");
    setDataFim("");
  }

  return (
    <div>
      <PageHeader titulo="Histórico de Movimentações de Estoque" subtitulo="Todas as entradas, saídas e ajustes de estoque." />

      <div className="filtros-card">
        <div className="filtros-grid">
          <div className="campo">
            <label htmlFor="filtroProduto">Produto</label>
            <select id="filtroProduto" value={idProduto} onChange={(e) => setIdProduto(e.target.value ? Number(e.target.value) : "")}>
              <option value="">Todos</option>
              {produtos.map((produto) => (
                <option key={produto.id} value={produto.id}>
                  {produto.descricao}
                </option>
              ))}
            </select>
          </div>
          <div className="campo">
            <label htmlFor="filtroTipo">Tipo</label>
            <select id="filtroTipo" value={tipo} onChange={(e) => setTipo(e.target.value as typeof tipo)}>
              <option value="">Todos</option>
              {TIPOS_MOVIMENTO.map((t) => (
                <option key={t} value={t}>
                  {TIPO_MOVIMENTO_LABEL[t]}
                </option>
              ))}
            </select>
          </div>
          <div className="campo">
            <label htmlFor="filtroOrigem">Origem</label>
            <select id="filtroOrigem" value={origem} onChange={(e) => setOrigem(e.target.value as typeof origem)}>
              <option value="">Todas</option>
              {ORIGENS_FILTRO.map((o) => (
                <option key={o} value={o}>
                  {ORIGEM_MOVIMENTO_LABEL[o]}
                </option>
              ))}
            </select>
          </div>
          <div className="campo">
            <label htmlFor="filtroDataInicio">De</label>
            <input id="filtroDataInicio" type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
          </div>
          <div className="campo">
            <label htmlFor="filtroDataFim">Até</label>
            <input id="filtroDataFim" type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
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
        <Loading texto="Carregando movimentações..." />
      ) : (
        <DataTable
          data={movimentos}
          keyExtractor={(item) => item.id}
          mensagemVazia="Nenhuma movimentação encontrada para esse filtro."
          columns={[
            { header: "Data/hora", render: (item) => formatarDataHora(item.dataHora) },
            { header: "Produto", render: (item) => item.produto.descricao },
            { header: "Tipo", render: (item) => <span className={`badge ${TIPO_BADGE[item.tipo]}`}>{TIPO_MOVIMENTO_LABEL[item.tipo]}</span> },
            { header: "Quantidade", render: (item) => item.quantidade },
            { header: "Estoque (antes → depois)", render: (item) => `${item.estoqueAnterior} → ${item.estoquePosterior}` },
            { header: "Origem", render: (item) => ORIGEM_MOVIMENTO_LABEL[item.origem] + (item.idOrigem ? ` #${item.idOrigem}` : "") },
            { header: "Usuário", render: (item) => item.usuario.pessoa?.nome ?? item.usuario.login },
            { header: "Observação", render: (item) => item.observacao || "-" },
          ]}
        />
      )}
    </div>
  );
}
