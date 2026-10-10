import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "../../components/common/PageHeader";
import { Loading } from "../../components/common/Loading";
import { Alert } from "../../components/common/Alert";
import { DataTable } from "../../components/common/DataTable";
import { auditoriaAcessoService } from "../../services/auditoriaAcessoService";
import { extrairMensagemErro } from "../../services/api";
import { formatarDataHora } from "../../utils/formatters";
import type { AuditoriaAcesso } from "../../types/acesso";

const ACOES: Record<string, string> = {
  CRIAR: "Criação",
  ALTERAR: "Alteração",
  EXCLUIR: "Exclusão",
  ALTERAR_ACESSO: "Acesso do usuário",
};

export function AuditoriaAcessoPage() {
  const [registros, setRegistros] = useState<AuditoriaAcesso[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [entidade, setEntidade] = useState("");
  const [login, setLogin] = useState("");

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setRegistros(
        await auditoriaAcessoService.listar({
          dataInicio: dataInicio || undefined,
          dataFim: dataFim || undefined,
          entidade: entidade || undefined,
          login: login || undefined,
        })
      );
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setCarregando(false);
    }
  }, [dataInicio, dataFim, entidade, login]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function limparFiltros() {
    setDataInicio("");
    setDataFim("");
    setEntidade("");
    setLogin("");
  }

  return (
    <div>
      <PageHeader titulo="Auditoria de Acesso" subtitulo="Quem alterou grupos, permissões e acessos de usuários, e quando." />

      <div className="filtros-card">
        <div className="filtros-grid">
          <div className="campo">
            <label htmlFor="audDataInicio">Data (início)</label>
            <input id="audDataInicio" type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
          </div>
          <div className="campo">
            <label htmlFor="audDataFim">Data (fim)</label>
            <input id="audDataFim" type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
          </div>
          <div className="campo">
            <label htmlFor="audEntidade">Tipo</label>
            <select id="audEntidade" value={entidade} onChange={(e) => setEntidade(e.target.value)}>
              <option value="">Todos</option>
              <option value="GRUPO">Grupo</option>
              <option value="USUARIO">Usuário</option>
            </select>
          </div>
          <div className="campo">
            <label htmlFor="audLogin">Quem alterou</label>
            <input id="audLogin" type="text" value={login} onChange={(e) => setLogin(e.target.value)} placeholder="Login..." />
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
        <Loading texto="Carregando auditoria..." />
      ) : (
        <DataTable
          data={registros}
          keyExtractor={(registro) => registro.id}
          mensagemVazia="Nenhum registro encontrado para esse filtro."
          columns={[
            { header: "Data/hora", render: (r) => formatarDataHora(r.dataHora) },
            { header: "Quem", render: (r) => r.login },
            { header: "Ação", render: (r) => ACOES[r.acao] ?? r.acao },
            { header: "Tipo", render: (r) => (r.entidade === "GRUPO" ? "Grupo" : "Usuário") },
            { header: "Descrição", render: (r) => r.descricao },
          ]}
        />
      )}
    </div>
  );
}
