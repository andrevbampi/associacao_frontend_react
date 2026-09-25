import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader";
import { Loading } from "../../components/common/Loading";
import { Alert } from "../../components/common/Alert";
import { DataTable } from "../../components/common/DataTable";
import { comandaService } from "../../services/comandaService";
import { pessoaService } from "../../services/pessoaService";
import { extrairMensagemErro } from "../../services/api";
import type { ComandaResponse, StatusComanda } from "../../types/comanda";
import type { Pessoa } from "../../types/pessoa";
import { formatarDataHora, formatarMoeda } from "../../utils/formatters";
import "./Comanda.css";

const FILTROS: { valor: StatusComanda | "TODAS"; rotulo: string }[] = [
  { valor: "ABERTA", rotulo: "Abertas" },
  { valor: "FECHADA", rotulo: "Fechadas" },
  { valor: "CANCELADA", rotulo: "Canceladas" },
  { valor: "TODAS", rotulo: "Todas" },
];

const STATUS_BADGE: Record<StatusComanda, string> = {
  ABERTA: "badge-verde",
  FECHADA: "badge-cinza",
  CANCELADA: "badge-cinza",
};

export function ComandaListPage() {
  const [filtro, setFiltro] = useState<StatusComanda | "TODAS">("ABERTA");
  const [comandas, setComandas] = useState<ComandaResponse[]>([]);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [idPessoa, setIdPessoa] = useState<number | "">("");
  const [nomeTemporario, setNomeTemporario] = useState("");
  const [dataAbertura, setDataAbertura] = useState("");
  const [pago, setPago] = useState<"" | "true" | "false">("");
  const [dataPagamento, setDataPagamento] = useState("");

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setComandas(
        await comandaService.listar({
          status: filtro === "TODAS" ? undefined : filtro,
          idPessoa: idPessoa === "" ? undefined : idPessoa,
          nomeTemporario: nomeTemporario || undefined,
          dataAbertura: dataAbertura || undefined,
          pago: pago === "" ? undefined : pago === "true",
          dataPagamento: dataPagamento || undefined,
        })
      );
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setCarregando(false);
    }
  }, [filtro, idPessoa, nomeTemporario, dataAbertura, pago, dataPagamento]);

  useEffect(() => {
    pessoaService.listar().then(setPessoas).catch(() => {});
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function limparFiltros() {
    setIdPessoa("");
    setNomeTemporario("");
    setDataAbertura("");
    setPago("");
    setDataPagamento("");
  }

  return (
    <div>
      <PageHeader titulo="Comandas" subtitulo="Abertura, itens e fechamento das comandas do bar/caixa." acaoLink="/comandas/nova" acaoTexto="Nova comanda" />

      <div className="comanda-filtros">
        {FILTROS.map((f) => (
          <button
            key={f.valor}
            type="button"
            className={`comanda-filtro ${filtro === f.valor ? "comanda-filtro-ativo" : ""}`}
            onClick={() => setFiltro(f.valor)}
          >
            {f.rotulo}
          </button>
        ))}
      </div>

      <div className="filtros-card">
        <div className="filtros-grid">
          <div className="campo">
            <label htmlFor="filtroPessoa">Pessoa cadastrada</label>
            <select id="filtroPessoa" value={idPessoa} onChange={(e) => setIdPessoa(e.target.value ? Number(e.target.value) : "")}>
              <option value="">Todas</option>
              {pessoas.map((pessoa) => (
                <option key={pessoa.id} value={pessoa.id}>
                  {pessoa.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="campo">
            <label htmlFor="filtroNomeTemp">Nome temporário</label>
            <input id="filtroNomeTemp" type="text" value={nomeTemporario} onChange={(e) => setNomeTemporario(e.target.value)} placeholder="Ex.: Mesa 5..." />
          </div>
          <div className="campo">
            <label htmlFor="filtroDataAbertura">Data de abertura</label>
            <input id="filtroDataAbertura" type="date" value={dataAbertura} onChange={(e) => setDataAbertura(e.target.value)} />
          </div>
          <div className="campo">
            <label htmlFor="filtroPago">Pago</label>
            <select id="filtroPago" value={pago} onChange={(e) => setPago(e.target.value as typeof pago)}>
              <option value="">Todas</option>
              <option value="true">Sim</option>
              <option value="false">Não</option>
            </select>
          </div>
          <div className="campo">
            <label htmlFor="filtroDataPagamento">Data de pagamento</label>
            <input id="filtroDataPagamento" type="date" value={dataPagamento} onChange={(e) => setDataPagamento(e.target.value)} />
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
        <Loading texto="Carregando comandas..." />
      ) : (
        <DataTable
          data={comandas}
          keyExtractor={(item) => item.id}
          mensagemVazia="Nenhuma comanda encontrada para esse filtro."
          columns={[
            { header: "Cliente", render: (item) => item.pessoa?.nome ?? item.nomeTemporario ?? "-" },
            { header: "Abertura", render: (item) => formatarDataHora(item.dataAbertura) },
            {
              header: "Status",
              render: (item) => <span className={`badge ${STATUS_BADGE[item.status]}`}>{item.status}</span>,
            },
            { header: "Total", render: (item) => formatarMoeda(item.valorTotal) },
            {
              header: "Pagamento",
              render: (item) =>
                item.status === "FECHADA" ? (
                  <span className={`badge ${item.pago ? "badge-verde" : "badge-cinza"}`}>{item.pago ? "Pago" : "Em aberto"}</span>
                ) : (
                  "-"
                ),
            },
            {
              header: "",
              className: "col-acoes",
              render: (item) => (
                <Link to={`/comandas/${item.id}`} className="btn btn-secundario btn-sm">
                  Abrir
                </Link>
              ),
            },
          ]}
        />
      )}
    </div>
  );
}
