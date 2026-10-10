import { useEffect, useState } from "react";
import { PageHeader } from "../../components/common/PageHeader";
import { Alert } from "../../components/common/Alert";
import { LoadingInline } from "../../components/common/Loading";
import { SelectComFoto } from "../../components/common/SelectComFoto";
import { PessoaIcone } from "../../components/common/PessoaIcone";
import { ProdutoIcone } from "../../components/common/ProdutoIcone";
import { relatorioService } from "../../services/relatorioService";
import { pessoaService } from "../../services/pessoaService";
import { produtoService } from "../../services/produtoService";
import { categoriaProdutoService } from "../../services/categoriaProdutoService";
import { extrairMensagemErro } from "../../services/api";
import type { RelatorioConsumoProdutoFiltro, RelatorioConsumoProdutoResponse } from "../../types/relatorio";
import type { Pessoa } from "../../types/pessoa";
import type { Produto } from "../../types/produto";
import type { CategoriaProduto } from "../../types/categoriaProduto";
import { formatarMoeda } from "../../utils/formatters";
import { montarLinhasComSubtotais } from "../../utils/relatorioSubtotais";
import "./Relatorio.css";
import { useAuth } from "../../context/AuthContext";

const STATUS_LABEL: Record<string, string> = {
  ABERTA: "Aberta",
  FECHADA: "Fechada",
};

export function RelatorioConsumoProdutosPage() {
  const { pode } = useAuth();
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<CategoriaProduto[]>([]);

  const [apenasPessoasCadastradas, setApenasPessoasCadastradas] = useState<"" | "true" | "false">("");
  const [idPessoa, setIdPessoa] = useState<number | "">("");
  const [nomeTemporario, setNomeTemporario] = useState("");
  const [dataAberturaInicio, setDataAberturaInicio] = useState("");
  const [dataAberturaFim, setDataAberturaFim] = useState("");
  const [idProduto, setIdProduto] = useState<number | "">("");
  const [idCategoriaProduto, setIdCategoriaProduto] = useState<number | "">("");
  const [status, setStatus] = useState<"" | "ABERTA" | "FECHADA">("");
  const [agruparPorMes, setAgruparPorMes] = useState(false);
  const [agruparPorDia, setAgruparPorDia] = useState(false);
  const [agruparPorPessoa, setAgruparPorPessoa] = useState(false);
  const [agruparPorStatus, setAgruparPorStatus] = useState(false);

  const [resultado, setResultado] = useState<RelatorioConsumoProdutoResponse | null>(null);
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    pessoaService.listar().then(setPessoas).catch(() => {});
    produtoService.listar().then(setProdutos).catch(() => {});
    categoriaProdutoService.listar().then(setCategorias).catch(() => {});
  }, []);

  async function gerarRelatorio() {
    setGerando(true);
    setErro(null);
    try {
      const filtro: RelatorioConsumoProdutoFiltro = {
        apenasPessoasCadastradas: apenasPessoasCadastradas === "" ? undefined : apenasPessoasCadastradas === "true",
        idPessoa: idPessoa === "" ? undefined : idPessoa,
        nomeTemporario: nomeTemporario || undefined,
        dataAberturaInicio: dataAberturaInicio || undefined,
        dataAberturaFim: dataAberturaFim || undefined,
        idProduto: idProduto === "" ? undefined : idProduto,
        idCategoriaProduto: idCategoriaProduto === "" ? undefined : idCategoriaProduto,
        status: status === "" ? undefined : status,
        agruparPorMes,
        agruparPorDia,
        agruparPorPessoa,
        agruparPorStatus,
      };
      setResultado(await relatorioService.consumoProdutos(filtro));
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setGerando(false);
    }
  }

  function limparFiltros() {
    setApenasPessoasCadastradas("");
    setIdPessoa("");
    setNomeTemporario("");
    setDataAberturaInicio("");
    setDataAberturaFim("");
    setIdProduto("");
    setIdCategoriaProduto("");
    setStatus("");
  }

  return (
    <div>
      <PageHeader titulo="Relatório de Consumo de Produtos" subtitulo="Quantidade e valor consumidos, calculados a partir dos itens das comandas não canceladas." />

      <div className="filtros-card no-imprimir">
        <div className="filtros-grid">
          <div className="campo">
            <label htmlFor="filtroApenasPessoas">Pessoas</label>
            <select id="filtroApenasPessoas" value={apenasPessoasCadastradas} onChange={(e) => setApenasPessoasCadastradas(e.target.value as typeof apenasPessoasCadastradas)}>
              <option value="">Todas (cadastradas e visitantes)</option>
              <option value="true">Somente pessoas cadastradas</option>
              <option value="false">Somente visitantes (nome informado)</option>
            </select>
          </div>

          <div className="campo">
            <label htmlFor="filtroPessoa">Pessoa cadastrada</label>
            <SelectComFoto
              id="filtroPessoa"
              value={idPessoa}
              onChange={setIdPessoa}
              textoVazio="Todas"
              opcoes={pessoas.map((pessoa) => ({ value: pessoa.id, label: pessoa.nome, icone: <PessoaIcone pessoa={pessoa} /> }))}
            />
          </div>

          <div className="campo">
            <label htmlFor="filtroNomeTemp">Nome informado (visitante)</label>
            <input id="filtroNomeTemp" type="text" value={nomeTemporario} onChange={(e) => setNomeTemporario(e.target.value)} placeholder="Ex.: Mesa 5..." />
          </div>

          <div className="campo">
            <label htmlFor="filtroDataInicio">Data de abertura (início)</label>
            <input id="filtroDataInicio" type="date" value={dataAberturaInicio} onChange={(e) => setDataAberturaInicio(e.target.value)} />
          </div>

          <div className="campo">
            <label htmlFor="filtroDataFim">Data de abertura (fim)</label>
            <input id="filtroDataFim" type="date" value={dataAberturaFim} onChange={(e) => setDataAberturaFim(e.target.value)} />
          </div>

          <div className="campo">
            <label htmlFor="filtroProduto">Produto</label>
            <SelectComFoto
              id="filtroProduto"
              value={idProduto}
              onChange={setIdProduto}
              textoVazio="Todos"
              opcoes={produtos.map((produto) => ({ value: produto.id, label: produto.descricao, icone: <ProdutoIcone produto={produto} /> }))}
            />
          </div>

          <div className="campo">
            <label htmlFor="filtroCategoria">Categoria de produto</label>
            <select id="filtroCategoria" value={idCategoriaProduto} onChange={(e) => setIdCategoriaProduto(e.target.value ? Number(e.target.value) : "")}>
              <option value="">Todas</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.descricao}
                </option>
              ))}
            </select>
          </div>

          <div className="campo">
            <label htmlFor="filtroStatus">Status da comanda</label>
            <select id="filtroStatus" value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
              <option value="">Ambos (aberta e fechada)</option>
              <option value="ABERTA">Somente abertas</option>
              <option value="FECHADA">Somente fechadas</option>
            </select>
            <span className="campo-ajuda">Comandas canceladas nunca são incluídas.</span>
          </div>

          <div className="campo campo-largo">
            <label>Agrupar por</label>
            <div className="relatorio-agrupamentos">
              <label className="campo-checkbox-inline">
                <input type="checkbox" checked={agruparPorMes} onChange={(e) => setAgruparPorMes(e.target.checked)} />
                Mês da abertura
              </label>
              <label className="campo-checkbox-inline">
                <input type="checkbox" checked={agruparPorPessoa} onChange={(e) => setAgruparPorPessoa(e.target.checked)} />
                Pessoa
              </label>
              <label className="campo-checkbox-inline">
                <input type="checkbox" checked={agruparPorDia} onChange={(e) => setAgruparPorDia(e.target.checked)} />
                Dia da abertura
              </label>
              <label className="campo-checkbox-inline">
                <input type="checkbox" checked={agruparPorStatus} onChange={(e) => setAgruparPorStatus(e.target.checked)} />
                Status da comanda
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
          {resultado && pode("relatorio:imprimir") && (
            <button type="button" className="btn btn-secundario" onClick={() => window.print()}>
              Imprimir / Gerar PDF
            </button>
          )}
        </div>
      </div>

      {erro && <Alert mensagem={erro} />}

      {resultado && (
        <div className="relatorio-resultado form-card">
          <h2 className="relatorio-titulo-impresso">Relatório de Consumo de Produtos</h2>

          {resultado.linhas.length === 0 ? (
            <div className="tabela-vazia">
              <p>Nenhum consumo encontrado para os filtros selecionados.</p>
            </div>
          ) : (
            <div className="tabela-container">
              <table className="tabela">
                <thead>
                  <tr>
                    {agruparPorMes && <th>Mês</th>}
                    {agruparPorPessoa && <th>Pessoa</th>}
                    {agruparPorDia && <th>Dia</th>}
                    <th>Produto</th>
                    <th>Categoria</th>
                    {agruparPorStatus && <th>Status</th>}
                    <th>Quantidade</th>
                    <th>Valor total</th>
                  </tr>
                </thead>
                <tbody>
                  {montarLinhasComSubtotais(resultado.linhas, agruparPorMes, agruparPorPessoa, agruparPorDia, agruparPorStatus).map((item, indice) =>
                    item.tipo === "dado" ? (
                      <tr key={indice}>
                        {agruparPorMes && <td>{item.linha.mes}</td>}
                        {agruparPorPessoa && <td>{item.linha.pessoa}</td>}
                        {agruparPorDia && <td>{item.linha.dia}</td>}
                        <td>{item.linha.produto}</td>
                        <td>{item.linha.categoriaProduto ?? "-"}</td>
                        {agruparPorStatus && <td>{item.linha.status ? STATUS_LABEL[item.linha.status] : "-"}</td>}
                        <td>{item.linha.quantidadeTotal}</td>
                        <td>{formatarMoeda(item.linha.valorTotal)}</td>
                      </tr>
                    ) : (
                      <tr key={indice} className={`linha-subtotal linha-subtotal-${item.nivel}`}>
                        <td
                          colSpan={2 + Number(agruparPorMes) + Number(agruparPorDia) + Number(agruparPorPessoa) + Number(agruparPorStatus)}
                          style={{ paddingLeft: `${1 + item.profundidade}rem` }}
                        >
                          {item.rotulo}
                        </td>
                        <td>{item.quantidadeTotal}</td>
                        <td>{formatarMoeda(item.valorTotal)}</td>
                      </tr>
                    )
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={2 + Number(agruparPorMes) + Number(agruparPorDia) + Number(agruparPorPessoa) + Number(agruparPorStatus)}>
                      <strong>Total geral</strong>
                    </td>
                    <td>
                      <strong>{resultado.quantidadeTotalGeral}</strong>
                    </td>
                    <td>
                      <strong>{formatarMoeda(resultado.valorTotalGeral)}</strong>
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
