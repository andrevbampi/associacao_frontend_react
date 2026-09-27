import { useEffect, useState } from "react";
import { PageHeader } from "../../components/common/PageHeader";
import { Alert } from "../../components/common/Alert";
import { LoadingInline } from "../../components/common/Loading";
import { relatorioService } from "../../services/relatorioService";
import { caixaService } from "../../services/caixaService";
import { extrairMensagemErro } from "../../services/api";
import type { RelatorioLivroCaixaFiltro, RelatorioLivroCaixaResponse } from "../../types/relatorio";
import type { Caixa } from "../../types/caixa";
import { formatarData, formatarMoeda } from "../../utils/formatters";
import { montarLinhasComSubtotaisLivroCaixa } from "../../utils/livroCaixaSubtotais";
import "./Relatorio.css";
import "./RelatorioLivroCaixaPage.css";

export function RelatorioLivroCaixaPage() {
  const [caixas, setCaixas] = useState<Caixa[]>([]);

  const [idCaixa, setIdCaixa] = useState<number | "">("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [agruparPorCaixa, setAgruparPorCaixa] = useState(false);
  const [agruparPorMes, setAgruparPorMes] = useState(false);

  const [resultado, setResultado] = useState<RelatorioLivroCaixaResponse | null>(null);
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    caixaService.listar().then(setCaixas).catch(() => {});
  }, []);

  async function gerarRelatorio() {
    setGerando(true);
    setErro(null);
    try {
      const filtro: RelatorioLivroCaixaFiltro = {
        idCaixa: idCaixa === "" ? undefined : idCaixa,
        dataInicio: dataInicio || undefined,
        dataFim: dataFim || undefined,
        agruparPorCaixa,
        agruparPorMes,
      };
      setResultado(await relatorioService.livroCaixa(filtro));
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setGerando(false);
    }
  }

  function limparFiltros() {
    setIdCaixa("");
    setDataInicio("");
    setDataFim("");
  }

  const colunasExtras = Number(agruparPorCaixa) + Number(agruparPorMes);

  return (
    <div>
      <PageHeader titulo="Livro Caixa" subtitulo="Todo movimento financeiro efetivamente pago — entradas e saídas reais de dinheiro." />

      <div className="filtros-card no-imprimir">
        <div className="filtros-grid">
          <div className="campo">
            <label htmlFor="filtroCaixa">Caixa</label>
            <select id="filtroCaixa" value={idCaixa} onChange={(e) => setIdCaixa(e.target.value ? Number(e.target.value) : "")}>
              <option value="">Todos</option>
              {caixas.map((caixa) => (
                <option key={caixa.id} value={caixa.id}>
                  {caixa.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="campo">
            <label htmlFor="filtroDataInicio">Data (início)</label>
            <input id="filtroDataInicio" type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
          </div>

          <div className="campo">
            <label htmlFor="filtroDataFim">Data (fim)</label>
            <input id="filtroDataFim" type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
          </div>

          <div className="campo campo-largo">
            <label>Agrupar por</label>
            <div className="relatorio-agrupamentos">
              <label className="campo-checkbox-inline">
                <input type="checkbox" checked={agruparPorCaixa} onChange={(e) => setAgruparPorCaixa(e.target.checked)} />
                Caixa
              </label>
              <label className="campo-checkbox-inline">
                <input type="checkbox" checked={agruparPorMes} onChange={(e) => setAgruparPorMes(e.target.checked)} />
                Mês
              </label>
            </div>
          </div>

          <div className="filtros-acoes">
            <button type="button" className="btn btn-secundario btn-sm" onClick={limparFiltros}>
              Limpar filtros
            </button>
          </div>
        </div>

        <div className="relatorio-acoes">
          <button type="button" className="btn btn-primario" onClick={gerarRelatorio} disabled={gerando}>
            {gerando ? <LoadingInline /> : "Gerar relatório"}
          </button>
          {resultado && (
            <button type="button" className="btn btn-secundario" onClick={() => window.print()}>
              Imprimir / Gerar PDF
            </button>
          )}
        </div>
      </div>

      {erro && <Alert mensagem={erro} />}

      {resultado && (
        <div className="relatorio-resultado form-card">
          <h2 className="relatorio-titulo-impresso">Livro Caixa</h2>

          {resultado.linhas.length === 0 ? (
            <div className="tabela-vazia">
              <p>Nenhum movimento encontrado para os filtros selecionados.</p>
            </div>
          ) : (
            <div className="tabela-container">
              <table className="tabela">
                <thead>
                  <tr>
                    {agruparPorCaixa && <th>Caixa</th>}
                    {agruparPorMes && <th>Mês</th>}
                    <th>Data</th>
                    <th>Descrição</th>
                    <th>Categoria</th>
                    <th>Entrada</th>
                    <th>Saída</th>
                    <th>Observação</th>
                  </tr>
                </thead>
                <tbody>
                  {montarLinhasComSubtotaisLivroCaixa(resultado.linhas, agruparPorCaixa, agruparPorMes).map((item, indice) =>
                    item.tipo === "dado" ? (
                      <tr key={indice} className={item.linha.tipoLinha !== "DETALHE" ? "linha-resumo" : undefined}>
                        {agruparPorCaixa && <td>{item.linha.caixa}</td>}
                        {agruparPorMes && <td>{item.linha.mes}</td>}
                        <td>{item.linha.data ? formatarData(item.linha.data) : "-"}</td>
                        <td>{item.linha.descricao}</td>
                        <td>{item.linha.categoria ?? "-"}</td>
                        <td>{item.linha.valorEntrada > 0 ? formatarMoeda(item.linha.valorEntrada) : "-"}</td>
                        <td>{item.linha.valorSaida > 0 ? formatarMoeda(item.linha.valorSaida) : "-"}</td>
                        <td>{item.linha.observacao ?? "-"}</td>
                      </tr>
                    ) : (
                      <tr key={indice} className={`linha-subtotal linha-subtotal-${item.nivel}`}>
                        <td colSpan={3 + colunasExtras} style={{ paddingLeft: `${1 + item.profundidade}rem` }}>
                          {item.rotulo}
                        </td>
                        <td>{formatarMoeda(item.valorEntrada)}</td>
                        <td>{formatarMoeda(item.valorSaida)}</td>
                        <td />
                      </tr>
                    )
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3 + colunasExtras}>
                      <strong>Total geral</strong>
                    </td>
                    <td>
                      <strong>{formatarMoeda(resultado.totalEntradasGeral)}</strong>
                    </td>
                    <td>
                      <strong>{formatarMoeda(resultado.totalSaidasGeral)}</strong>
                    </td>
                    <td>
                      <strong>Saldo: {formatarMoeda(resultado.saldoGeral)}</strong>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
