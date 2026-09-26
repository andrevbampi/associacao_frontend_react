import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader";
import { Loading } from "../../components/common/Loading";
import { Alert } from "../../components/common/Alert";
import { DataTable } from "../../components/common/DataTable";
import { lancamentoFinanceiroService } from "../../services/lancamentoFinanceiroService";
import { categoriaFinanceiraService } from "../../services/categoriaFinanceiraService";
import { extrairMensagemErro } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { TIPO_LANCAMENTO_LABEL, type LancamentoFinanceiroResponse, type ResumoFinanceiro, type TipoLancamento } from "../../types/lancamentoFinanceiro";
import type { CategoriaFinanceira } from "../../types/categoriaFinanceira";
import { FORMA_PAGAMENTO_LABEL } from "../../types/formaPagamento";
import { formatarData, formatarMoeda } from "../../utils/formatters";
import "./Financeiro.css";

export function LancamentoFinanceiroListPage() {
  const { showToast } = useToast();
  const [lancamentos, setLancamentos] = useState<LancamentoFinanceiroResponse[]>([]);
  const [categorias, setCategorias] = useState<CategoriaFinanceira[]>([]);
  const [resumo, setResumo] = useState<ResumoFinanceiro | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [registrandoPagamento, setRegistrandoPagamento] = useState<number | null>(null);

  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [idCategoriaFinanceira, setIdCategoriaFinanceira] = useState<number | "">("");
  const [tipo, setTipo] = useState<TipoLancamento | "">("");
  const [pago, setPago] = useState<"" | "true" | "false">("");

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const filtro = {
        dataInicio: dataInicio || undefined,
        dataFim: dataFim || undefined,
        idCategoriaFinanceira: idCategoriaFinanceira === "" ? undefined : idCategoriaFinanceira,
        tipo: tipo || undefined,
        pago: pago === "" ? undefined : pago === "true",
      };
      const [lista, resumoResp] = await Promise.all([
        lancamentoFinanceiroService.listar(filtro),
        lancamentoFinanceiroService.resumo(dataInicio || undefined, dataFim || undefined),
      ]);
      setLancamentos(lista);
      setResumo(resumoResp);
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setCarregando(false);
    }
  }, [dataInicio, dataFim, idCategoriaFinanceira, tipo, pago]);

  useEffect(() => {
    categoriaFinanceiraService.listar().then(setCategorias).catch(() => {});
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function limparFiltros() {
    setDataInicio("");
    setDataFim("");
    setIdCategoriaFinanceira("");
    setTipo("");
    setPago("");
  }

  async function handleRegistrarPagamento(id: number) {
    setRegistrandoPagamento(id);
    try {
      await lancamentoFinanceiroService.registrarPagamento(id);
      showToast("success", "Pagamento registrado com sucesso.");
      carregar();
    } catch (error) {
      showToast("error", extrairMensagemErro(error));
    } finally {
      setRegistrandoPagamento(null);
    }
  }

  return (
    <div>
      <PageHeader titulo="Financeiro" subtitulo="Lançamentos de entradas e saídas de caixa." acaoLink="/financeiro/novo" acaoTexto="Novo lançamento" />

      {resumo && (
        <div className="resumo-financeiro">
          <div className="resumo-card">
            <div className="resumo-card-titulo">Saldo atual em caixa</div>
            <div className={`resumo-card-valor ${resumo.saldoAtual < 0 ? "negativo" : ""}`}>{formatarMoeda(resumo.saldoAtual)}</div>
          </div>
          <div className="resumo-card">
            <div className="resumo-card-titulo">Entradas no período</div>
            <div className="resumo-card-valor">{formatarMoeda(resumo.totalEntradasPeriodo)}</div>
          </div>
          <div className="resumo-card">
            <div className="resumo-card-titulo">Saídas no período</div>
            <div className="resumo-card-valor negativo">{formatarMoeda(resumo.totalSaidasPeriodo)}</div>
          </div>
        </div>
      )}

      <div className="filtros-card">
        <div className="filtros-grid">
          <div className="campo">
            <label htmlFor="filtroDataInicio">De</label>
            <input id="filtroDataInicio" type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
          </div>
          <div className="campo">
            <label htmlFor="filtroDataFim">Até</label>
            <input id="filtroDataFim" type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
          </div>
          <div className="campo">
            <label htmlFor="filtroCategoria">Categoria</label>
            <select id="filtroCategoria" value={idCategoriaFinanceira} onChange={(e) => setIdCategoriaFinanceira(e.target.value ? Number(e.target.value) : "")}>
              <option value="">Todas</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.descricao}
                </option>
              ))}
            </select>
          </div>
          <div className="campo">
            <label htmlFor="filtroTipo">Tipo</label>
            <select id="filtroTipo" value={tipo} onChange={(e) => setTipo(e.target.value as typeof tipo)}>
              <option value="">Todos</option>
              <option value="ENTRADA">Entrada</option>
              <option value="SAIDA">Saída</option>
            </select>
          </div>
          <div className="campo">
            <label htmlFor="filtroPago">Pago</label>
            <select id="filtroPago" value={pago} onChange={(e) => setPago(e.target.value as typeof pago)}>
              <option value="">Todos</option>
              <option value="true">Sim</option>
              <option value="false">Não</option>
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
        <Loading texto="Carregando lançamentos..." />
      ) : (
        <DataTable
          data={lancamentos}
          keyExtractor={(item) => item.id}
          mensagemVazia="Nenhum lançamento encontrado para esse filtro."
          columns={[
            { header: "Data", render: (item) => formatarData(item.data) },
            { header: "Categoria", render: (item) => item.categoriaFinanceira.descricao },
            {
              header: "Tipo",
              render: (item) => <span className={`badge ${item.tipo === "ENTRADA" ? "badge-verde" : "badge-vermelho"}`}>{TIPO_LANCAMENTO_LABEL[item.tipo]}</span>,
            },
            { header: "Descrição", render: (item) => item.descricao || "-" },
            { header: "Valor", render: (item) => formatarMoeda(item.valor) },
            { header: "Forma", render: (item) => (item.formaPagamento ? FORMA_PAGAMENTO_LABEL[item.formaPagamento] : "-") },
            {
              header: "Situação",
              render: (item) => (
                <span className={`badge ${item.pago ? "badge-verde" : "badge-cinza"}`}>{item.pago ? "Pago" : "Pendente"}</span>
              ),
            },
            {
              header: "",
              className: "col-acoes",
              render: (item) =>
                !item.pago ? (
                  <button
                    type="button"
                    className="btn btn-secundario btn-sm"
                    disabled={registrandoPagamento === item.id}
                    onClick={() => handleRegistrarPagamento(item.id)}
                  >
                    Registrar pagamento
                  </button>
                ) : (
                  <Link to={`/financeiro/${item.id}/editar`} className="btn btn-secundario btn-sm btn-icone" title="Editar">
                    ✎
                  </Link>
                ),
            },
          ]}
        />
      )}
    </div>
  );
}
