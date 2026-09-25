import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader";
import { Loading } from "../../components/common/Loading";
import { Alert } from "../../components/common/Alert";
import { DataTable } from "../../components/common/DataTable";
import { comandaService } from "../../services/comandaService";
import { extrairMensagemErro } from "../../services/api";
import type { ComandaResponse, StatusComanda } from "../../types/comanda";
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
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setComandas(await comandaService.listar(filtro === "TODAS" ? undefined : filtro));
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setCarregando(false);
    }
  }, [filtro]);

  useEffect(() => {
    carregar();
  }, [carregar]);

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
