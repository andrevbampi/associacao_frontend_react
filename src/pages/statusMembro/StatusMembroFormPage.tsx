import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader";
import { Loading, LoadingInline } from "../../components/common/Loading";
import { Alert } from "../../components/common/Alert";
import { statusMembroService } from "../../services/statusMembroService";
import { extrairMensagemErro } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { statusMembroVazio, type StatusMembroFormData } from "../../types/statusMembro";

export function StatusMembroFormPage() {
  const { id } = useParams();
  const emEdicao = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState<StatusMembroFormData>(statusMembroVazio);
  const [carregando, setCarregando] = useState(emEdicao);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!emEdicao) return;

    async function carregar() {
      setCarregando(true);
      setErro(null);
      try {
        const lista = await statusMembroService.listar();
        const item = lista.find((s) => s.id === Number(id));
        if (!item) {
          setErro("Status não encontrado.");
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
        await statusMembroService.atualizar({ ...form, id: Number(id) });
        showToast("success", "Status atualizado com sucesso.");
      } else {
        await statusMembroService.criar(form);
        showToast("success", "Status cadastrado com sucesso.");
      }
      navigate("/status-membro");
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) return <Loading texto="Carregando status..." />;

  return (
    <div>
      <PageHeader titulo={emEdicao ? "Editar status" : "Novo status"} />

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
          <button type="button" className="btn btn-secundario" onClick={() => navigate("/status-membro")} disabled={salvando}>
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
