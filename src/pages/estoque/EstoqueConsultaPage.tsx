import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader";
import { Loading } from "../../components/common/Loading";
import { Alert } from "../../components/common/Alert";
import { DataTable } from "../../components/common/DataTable";
import { produtoService } from "../../services/produtoService";
import { extrairMensagemErro } from "../../services/api";
import type { Produto } from "../../types/produto";

export function EstoqueConsultaPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [descricao, setDescricao] = useState("");
  const [somenteAbaixoMinimo, setSomenteAbaixoMinimo] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setProdutos(await produtoService.listar({ descricao: descricao || undefined }));
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setCarregando(false);
    }
  }, [descricao]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const listaFiltrada = produtos
    .filter((p) => p.controlaEstoque)
    .filter((p) => !somenteAbaixoMinimo || (p.estoqueMinimo != null && p.estoqueAtual <= p.estoqueMinimo));

  return (
    <div>
      <PageHeader
        titulo="Estoque"
        subtitulo="Consulta do estoque atual dos produtos."
        acaoLink="/estoque/nova"
        acaoTexto="Lançar movimentação"
      />

      <div className="filtros-card">
        <div className="filtros-grid">
          <div className="campo">
            <label htmlFor="filtroDescricao">Produto</label>
            <input id="filtroDescricao" type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Buscar por descrição..." />
          </div>
          <div className="campo campo-checkbox">
            <input id="filtroMinimo" type="checkbox" checked={somenteAbaixoMinimo} onChange={(e) => setSomenteAbaixoMinimo(e.target.checked)} />
            <label htmlFor="filtroMinimo">Somente abaixo do mínimo</label>
          </div>
          <div className="filtros-acoes">
            <Link to="/estoque/movimentos" className="btn btn-secundario btn-sm">
              Ver histórico de movimentações
            </Link>
          </div>
        </div>
      </div>

      {erro && <Alert mensagem={erro} />}

      {carregando ? (
        <Loading texto="Carregando estoque..." />
      ) : (
        <DataTable
          data={listaFiltrada}
          keyExtractor={(item) => item.id}
          mensagemVazia="Nenhum produto com controle de estoque encontrado para esse filtro."
          columns={[
            { header: "Produto", render: (item) => item.descricao },
            { header: "Categoria", render: (item) => item.categoria?.descricao ?? "-" },
            { header: "Estoque atual", render: (item) => item.estoqueAtual },
            { header: "Reservado em comandas abertas", render: (item) => item.estoqueAtual - item.estoqueDisponivel },
            { header: "Disponível", render: (item) => item.estoqueDisponivel },
            { header: "Estoque mínimo", render: (item) => item.estoqueMinimo ?? "-" },
            {
              header: "Situação",
              render: (item) =>
                item.estoqueMinimo != null && item.estoqueAtual <= item.estoqueMinimo ? (
                  <span className="badge badge-vermelho">⚠ Abaixo do mínimo</span>
                ) : (
                  <span className="badge badge-verde">OK</span>
                ),
            },
          ]}
        />
      )}
    </div>
  );
}
