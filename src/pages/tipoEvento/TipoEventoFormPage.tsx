import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader";
import { Loading, LoadingInline } from "../../components/common/Loading";
import { Alert } from "../../components/common/Alert";
import { tipoEventoService } from "../../services/tipoEventoService";
import { extrairMensagemErro } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { tipoEventoVazio, type TipoEventoFormData } from "../../types/tipoEvento";

export function TipoEventoFormPage() {
  const { id } = useParams();
  const emEdicao = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState<TipoEventoFormData>(tipoEventoVazio);
  const [carregando, setCarregando] = useState(emEdicao);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!emEdicao) return;

    async function carregar() {
      setCarregando(true);
      setErro(null);
      try {
        const lista = await tipoEventoService.listar();
        const item = lista.find((t) => t.id === Number(id));
        if (!item) {
          setErro("Tipo de evento não encontrado.");
          return;
        }
        setForm(item);
      } catch (error) {
        setErro(extrairMensagemErro(error));
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, [id, emEdicao]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErro(null);
    setSalvando(true);

    try {
      if (emEdicao) {
        await tipoEventoService.atualizar({ ...form, id: Number(id) });
        showToast("success", "Tipo de evento atualizado com sucesso.");
      } else {
        await tipoEventoService.criar(form);
        showToast("success", "Tipo de evento cadastrado com sucesso.");
      }
      navigate("/tipos-evento");
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) return <Loading texto="Carregando tipo de evento..." />;

  return (
    <div>
      <PageHeader titulo={emEdicao ? "Editar tipo de evento" : "Novo tipo de evento"} />

      {erro && <Alert mensagem={erro} />}

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="campo campo-largo">
            <label htmlFor="descricao">Descrição *</label>
            <input
              id="descricao"
              type="text"
              value={form.descricao}
              maxLength={100}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-acoes">
          <button type="button" className="btn btn-secundario" onClick={() => navigate("/tipos-evento")} disabled={salvando}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primario" disabled={salvando}>
            {salvando ? <LoadingInline /> : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}
