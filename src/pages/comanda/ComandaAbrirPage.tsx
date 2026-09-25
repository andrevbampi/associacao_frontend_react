import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader";
import { Loading, LoadingInline } from "../../components/common/Loading";
import { Alert } from "../../components/common/Alert";
import { comandaService } from "../../services/comandaService";
import { pessoaService } from "../../services/pessoaService";
import { extrairMensagemErro } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import type { Pessoa } from "../../types/pessoa";

type ModoCliente = "pessoa" | "visitante";

export function ComandaAbrirPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [modo, setModo] = useState<ModoCliente>("pessoa");
  const [idPessoa, setIdPessoa] = useState<number | "">("");
  const [nomeTemporario, setNomeTemporario] = useState("");
  const [observacao, setObservacao] = useState("");

  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    pessoaService
      .listar()
      .then(setPessoas)
      .catch((error) => setErro(extrairMensagemErro(error)))
      .finally(() => setCarregando(false));
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErro(null);

    if (modo === "pessoa" && idPessoa === "") {
      setErro("Selecione a pessoa.");
      return;
    }
    if (modo === "visitante" && nomeTemporario.trim() === "") {
      setErro("Informe um nome para identificar a comanda.");
      return;
    }

    setSalvando(true);
    try {
      const comanda = await comandaService.abrir({
        idPessoa: modo === "pessoa" ? Number(idPessoa) : null,
        nomeTemporario: modo === "visitante" ? nomeTemporario.trim() : null,
        observacao: observacao || null,
      });
      showToast("success", "Comanda aberta com sucesso.");
      navigate(`/comandas/${comanda.id}`);
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) return <Loading texto="Carregando..." />;

  return (
    <div>
      <PageHeader titulo="Nova comanda" />

      {erro && <Alert mensagem={erro} />}

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="campo campo-largo">
            <label>Cliente *</label>
            <div className="comanda-modo-toggle">
              <button type="button" className={modo === "pessoa" ? "ativo" : ""} onClick={() => setModo("pessoa")}>
                Pessoa cadastrada
              </button>
              <button type="button" className={modo === "visitante" ? "ativo" : ""} onClick={() => setModo("visitante")}>
                Visitante
              </button>
            </div>
          </div>

          {modo === "pessoa" ? (
            <div className="campo campo-largo">
              <label htmlFor="idPessoa">Pessoa</label>
              <select id="idPessoa" value={idPessoa} onChange={(e) => setIdPessoa(e.target.value ? Number(e.target.value) : "")} required>
                <option value="">Selecione uma pessoa...</option>
                {pessoas.map((pessoa) => (
                  <option key={pessoa.id} value={pessoa.id}>
                    {pessoa.nome} ({pessoa.documento})
                  </option>
                ))}
              </select>
              <span className="campo-ajuda">Se a pessoa for membro ativo, os produtos usam automaticamente o preço de membro.</span>
            </div>
          ) : (
            <div className="campo campo-largo">
              <label htmlFor="nomeTemporario">Nome ou identificação</label>
              <input
                id="nomeTemporario"
                type="text"
                placeholder="Ex.: Mesa 5, João (visitante)..."
                value={nomeTemporario}
                maxLength={120}
                onChange={(e) => setNomeTemporario(e.target.value)}
                required
              />
            </div>
          )}

          <div className="campo campo-largo">
            <label htmlFor="observacao">Observação</label>
            <input id="observacao" type="text" value={observacao} maxLength={255} onChange={(e) => setObservacao(e.target.value)} />
          </div>
        </div>

        <div className="form-acoes">
          <button type="button" className="btn btn-secundario" onClick={() => navigate("/comandas")} disabled={salvando}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primario" disabled={salvando}>
            {salvando ? <LoadingInline /> : "Abrir comanda"}
          </button>
        </div>
      </form>
    </div>
  );
}
