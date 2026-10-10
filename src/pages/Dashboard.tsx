import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loading } from "../components/common/Loading";
import { Alert } from "../components/common/Alert";
import { useParametros } from "../context/ParametrosContext";
import { useAuth } from "../context/AuthContext";
import { lancamentoFinanceiroService } from "../services/lancamentoFinanceiroService";
import { comandaService } from "../services/comandaService";
import { membroService } from "../services/membroService";
import { produtoService } from "../services/produtoService";
import { extrairMensagemErro, apiBaseUrl } from "../services/api";
import type { ResumoCaixa, ResumoFinanceiro } from "../types/lancamentoFinanceiro";
import type { Produto } from "../types/produto";
import { formatarMoeda } from "../utils/formatters";
import "./Dashboard.css";

const ATALHOS = [
  { to: "/comandas", permissao: "comanda:visualizar", icone: "🧾", titulo: "Comandas", descricao: "Abrir, lançar itens e fechar comandas do bar/caixa." },
  { to: "/estoque", permissao: "estoque:visualizar", icone: "📦", titulo: "Estoque", descricao: "Consultar o estoque atual e lançar movimentações." },
  { to: "/financeiro", permissao: "financeiro:visualizar", icone: "💰", titulo: "Financeiro", descricao: "Lançamentos financeiros, entradas e saídas." },
  { to: "/pessoas", permissao: "pessoa:visualizar", icone: "👤", titulo: "Pessoas", descricao: "Cadastro de pessoas físicas e jurídicas." },
];

export function Dashboard() {
  const { nomeAssociacao, logoUrl } = useParametros();
  const { pode } = useAuth();
  const verFinanceiro = pode("financeiro:resumo");
  const verComandas = pode("comanda:visualizar");
  const verMembros = pode("membro:visualizar");
  const verEstoque = pode("produto:visualizar") && pode("estoque:visualizar");

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [resumo, setResumo] = useState<ResumoFinanceiro | null>(null);
  const [resumoCaixas, setResumoCaixas] = useState<ResumoCaixa[]>([]);
  const [totalComandasAbertas, setTotalComandasAbertas] = useState(0);
  const [totalMembrosAtivos, setTotalMembrosAtivos] = useState(0);
  const [produtosEstoqueBaixo, setProdutosEstoqueBaixo] = useState<Produto[]>([]);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      setErro(null);
      try {
        const hoje = new Date().toISOString().substring(0, 10);
        const inicioMes = `${hoje.substring(0, 7)}-01`;

        const [resumoResp, caixasResp, comandasResp, membrosResp, produtosResp] = await Promise.all([
          verFinanceiro ? lancamentoFinanceiroService.resumo(inicioMes, hoje) : Promise.resolve(null),
          verFinanceiro ? lancamentoFinanceiroService.resumoPorCaixa() : Promise.resolve([]),
          verComandas ? comandaService.listar({ status: "ABERTA" }) : Promise.resolve([]),
          verMembros ? membroService.listar({ ativo: true }) : Promise.resolve([]),
          verEstoque ? produtoService.listar() : Promise.resolve([]),
        ]);

        setResumo(resumoResp);
        setResumoCaixas(caixasResp);
        setTotalComandasAbertas(comandasResp.length);
        setTotalMembrosAtivos(membrosResp.length);
        setProdutosEstoqueBaixo(
          produtosResp.filter((p) => p.controlaEstoque && p.estoqueMinimo != null && p.estoqueAtual <= p.estoqueMinimo)
        );
      } catch (error) {
        setErro(extrairMensagemErro(error));
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, [verFinanceiro, verComandas, verMembros, verEstoque]);

  return (
    <div>
      <div className="dashboard-intro">
        <h1>
          Bem-vindo(a) à {nomeAssociacao}{" "}
          {logoUrl ? (
            <img src={`${apiBaseUrl}${logoUrl}`} alt="Logo" className="dashboard-intro-logo" />
          ) : (
            "🌿"
          )}
        </h1>
        <p>Resumo do momento e acesso rápido às áreas do sistema.</p>
      </div>

      {erro && <Alert mensagem={erro} />}

      {carregando ? (
        <Loading texto="Carregando resumo..." />
      ) : (
        <>
          <div className="dashboard-kpis">
            {verFinanceiro && (
              <>
            <Link to="/financeiro" className="dashboard-kpi">
              <span className="dashboard-kpi-label">Saldo atual</span>
              <span className="dashboard-kpi-valor">{formatarMoeda(resumo?.saldoAtual ?? 0)}</span>
            </Link>
            <Link to="/financeiro" className="dashboard-kpi">
              <span className="dashboard-kpi-label">Entradas do mês</span>
              <span className="dashboard-kpi-valor dashboard-kpi-positivo">{formatarMoeda(resumo?.totalEntradasPeriodo ?? 0)}</span>
            </Link>
            <Link to="/financeiro" className="dashboard-kpi">
              <span className="dashboard-kpi-label">Saídas do mês</span>
              <span className="dashboard-kpi-valor dashboard-kpi-negativo">{formatarMoeda(resumo?.totalSaidasPeriodo ?? 0)}</span>
            </Link>
              </>
            )}
            {verComandas && (
            <Link to="/comandas" className="dashboard-kpi">
              <span className="dashboard-kpi-label">Comandas abertas</span>
              <span className="dashboard-kpi-valor">{totalComandasAbertas}</span>
            </Link>
            )}
            {verMembros && (
            <Link to="/membros" className="dashboard-kpi">
              <span className="dashboard-kpi-label">Membros ativos</span>
              <span className="dashboard-kpi-valor">{totalMembrosAtivos}</span>
            </Link>
            )}
            {verEstoque && (
            <Link to="/estoque" className="dashboard-kpi">
              <span className="dashboard-kpi-label">Produtos abaixo do mínimo</span>
              <span className={`dashboard-kpi-valor ${produtosEstoqueBaixo.length > 0 ? "dashboard-kpi-negativo" : ""}`}>
                {produtosEstoqueBaixo.length}
              </span>
            </Link>
            )}
          </div>

          <div className="dashboard-paineis">
            {verFinanceiro && (
            <div className="dashboard-painel">
              <h2>Saldo por caixa</h2>
              {resumoCaixas.length === 0 ? (
                <p className="dashboard-painel-vazio">Nenhum caixa cadastrado.</p>
              ) : (
                <ul className="dashboard-lista">
                  {resumoCaixas.map((item) => (
                    <li key={item.caixa.id}>
                      <span>{item.caixa.nome}</span>
                      <strong>{formatarMoeda(item.saldoAtual)}</strong>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            )}

            {verEstoque && (
            <div className="dashboard-painel">
              <h2>Estoque abaixo do mínimo</h2>
              {produtosEstoqueBaixo.length === 0 ? (
                <p className="dashboard-painel-vazio">Nenhum produto abaixo do estoque mínimo.</p>
              ) : (
                <ul className="dashboard-lista">
                  {produtosEstoqueBaixo.slice(0, 6).map((produto) => (
                    <li key={produto.id}>
                      <span>{produto.descricao}</span>
                      <strong className="dashboard-kpi-negativo">
                        {produto.estoqueAtual} / {produto.estoqueMinimo}
                      </strong>
                    </li>
                  ))}
                </ul>
              )}
              <Link to="/estoque" className="dashboard-painel-link">
                Ver estoque completo →
              </Link>
            </div>
            )}
          </div>
        </>
      )}

      <h2 className="dashboard-secao-titulo">Acesso rápido</h2>
      <div className="dashboard-grid">
        {ATALHOS.filter((atalho) => pode(atalho.permissao)).map((atalho) => (
          <Link key={atalho.to} to={atalho.to} className="dashboard-card">
            <span className="dashboard-card-icone">{atalho.icone}</span>
            <div>
              <h2>{atalho.titulo}</h2>
              <p>{atalho.descricao}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
