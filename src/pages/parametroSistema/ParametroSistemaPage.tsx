import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { PageHeader } from "../../components/common/PageHeader";
import { Loading, LoadingInline } from "../../components/common/Loading";
import { Alert } from "../../components/common/Alert";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { parametroSistemaService } from "../../services/parametroSistemaService";
import { caixaService } from "../../services/caixaService";
import { extrairMensagemErro, apiBaseUrl } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useParametros } from "../../context/ParametrosContext";
import { CHAVE_CAIXA_COMANDA, LABEL_PARAMETRO, type ParametroSistema } from "../../types/parametroSistema";
import type { Caixa } from "../../types/caixa";

export function ParametroSistemaPage() {
  const { showToast } = useToast();
  const { recarregar, logoUrl } = useParametros();

  const [parametros, setParametros] = useState<ParametroSistema[]>([]);
  const [caixas, setCaixas] = useState<Caixa[]>([]);
  const [valores, setValores] = useState<Record<number, string>>({});
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviandoLogo, setEnviandoLogo] = useState(false);
  const [removendoLogoAberto, setRemovendoLogoAberto] = useState(false);
  const [removendoLogo, setRemovendoLogo] = useState(false);

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

  async function handleUploadLogo(event: ChangeEvent<HTMLInputElement>) {
    const arquivo = event.target.files?.[0];
    event.target.value = "";
    if (!arquivo) return;

    setEnviandoLogo(true);
    try {
      await parametroSistemaService.uploadLogo(arquivo);
      showToast("success", "Logo atualizada com sucesso.");
      await recarregar();
    } catch (error) {
      showToast("error", extrairMensagemErro(error));
    } finally {
      setEnviandoLogo(false);
    }
  }

  async function confirmarRemocaoLogo() {
    setRemovendoLogo(true);
    try {
      await parametroSistemaService.removerLogo();
      showToast("success", "Logo removida.");
      setRemovendoLogoAberto(false);
      await recarregar();
    } catch (error) {
      showToast("error", extrairMensagemErro(error));
    } finally {
      setRemovendoLogo(false);
    }
  }

  if (carregando) return <Loading texto="Carregando parâmetros..." />;

  return (
    <div>
      <PageHeader titulo="Parâmetros do Sistema" subtitulo="Configurações gerais usadas em várias partes do sistema." />

      {erro && <Alert mensagem={erro} />}

      <div className="form-card">
        <div className="campo campo-largo">
          <label>Logo da associação</label>
          <div className="parametro-logo-linha">
            {logoUrl ? (
              <img src={`${apiBaseUrl}${logoUrl}?t=${Date.now()}`} alt="Logo atual" className="parametro-logo-preview" />
            ) : (
              <span className="campo-ajuda">Nenhuma logo cadastrada ainda — o ícone padrão (🌿) é usado no lugar.</span>
            )}
            <div className="parametro-logo-acoes">
              <label className="btn btn-secundario btn-sm">
                {enviandoLogo ? <LoadingInline /> : logoUrl ? "Trocar logo" : "Enviar logo"}
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={handleUploadLogo} disabled={enviandoLogo} />
              </label>
              {logoUrl && (
                <button type="button" className="btn btn-perigo btn-sm" onClick={() => setRemovendoLogoAberto(true)} disabled={enviandoLogo}>
                  Remover
                </button>
              )}
            </div>
          </div>
          <span className="campo-ajuda">Aparece na tela de login e no menu lateral do sistema. Formatos aceitos: JPG, PNG, WEBP ou GIF.</span>
        </div>
      </div>

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

      <ConfirmDialog
        aberto={removendoLogoAberto}
        titulo="Remover logo"
        mensagem="Tem certeza de que deseja remover a logo da associação? O ícone padrão volta a ser usado."
        carregando={removendoLogo}
        onCancelar={() => setRemovendoLogoAberto(false)}
        onConfirmar={confirmarRemocaoLogo}
      />
    </div>
  );
}
