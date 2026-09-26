import { useEffect, useState, type FormEvent } from "react";
import { PageHeader } from "../../components/common/PageHeader";
import { Loading, LoadingInline } from "../../components/common/Loading";
import { Alert } from "../../components/common/Alert";
import { parametroSistemaService } from "../../services/parametroSistemaService";
import { caixaService } from "../../services/caixaService";
import { extrairMensagemErro } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useParametros } from "../../context/ParametrosContext";
import { CHAVE_CAIXA_COMANDA, LABEL_PARAMETRO, type ParametroSistema } from "../../types/parametroSistema";
import type { Caixa } from "../../types/caixa";

export function ParametroSistemaPage() {
  const { showToast } = useToast();
  const { recarregar } = useParametros();

  const [parametros, setParametros] = useState<ParametroSistema[]>([]);
  const [caixas, setCaixas] = useState<Caixa[]>([]);
  const [valores, setValores] = useState<Record<number, string>>({});
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      setErro(null);
      try {
        const [listaParametros, listaCaixas] = await Promise.all([parametroSistemaService.listar(), caixaService.listar()]);
        setParametros(listaParametros);
        setCaixas(listaCaixas);
        const iniciais: Record<number, string> = {};
        for (const parametro of listaParametros) {
          iniciais[parametro.id] = parametro.valor ?? "";
        }
        setValores(iniciais);
      } catch (error) {
        setErro(extrairMensagemErro(error));
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErro(null);
    setSalvando(true);

    try {
      for (const parametro of parametros) {
        await parametroSistemaService.atualizar({ id: parametro.id, valor: valores[parametro.id] ?? "", descricao: parametro.descricao });
      }
      showToast("success", "Parâmetros salvos com sucesso.");
      await recarregar();
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) return <Loading texto="Carregando parâmetros..." />;

  return (
    <div>
      <PageHeader titulo="Parâmetros do Sistema" subtitulo="Configurações gerais usadas em várias partes do sistema." />

      {erro && <Alert mensagem={erro} />}

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          {parametros.map((parametro) => (
            <div className="campo campo-largo" key={parametro.id}>
              <label htmlFor={`parametro-${parametro.id}`}>{LABEL_PARAMETRO[parametro.chave] ?? parametro.chave}</label>

              {parametro.chave === CHAVE_CAIXA_COMANDA ? (
                <select
                  id={`parametro-${parametro.id}`}
                  value={valores[parametro.id] ?? ""}
                  onChange={(e) => setValores({ ...valores, [parametro.id]: e.target.value })}
                >
                  <option value="">Nenhum (pedir para escolher a cada pagamento)</option>
                  {caixas.map((caixa) => (
                    <option key={caixa.id} value={caixa.id}>
                      {caixa.nome}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={`parametro-${parametro.id}`}
                  type="text"
                  value={valores[parametro.id] ?? ""}
                  onChange={(e) => setValores({ ...valores, [parametro.id]: e.target.value })}
                />
              )}

              {parametro.chave === CHAVE_CAIXA_COMANDA && (
                <span className="campo-ajuda">
                  Se um caixa for escolhido aqui, ele é usado automaticamente ao registrar pagamentos de comandas. Se ficar vazio, o
                  caixa precisará ser escolhido manualmente em cada pagamento.
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="form-acoes">
          <button type="submit" className="btn btn-primario" disabled={salvando}>
            {salvando ? <LoadingInline /> : "Salvar parâmetros"}
          </button>
        </div>
      </form>
    </div>
  );
}
