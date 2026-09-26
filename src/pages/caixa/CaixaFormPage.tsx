import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader";
import { Loading, LoadingInline } from "../../components/common/Loading";
import { Alert } from "../../components/common/Alert";
import { caixaService } from "../../services/caixaService";
import { extrairMensagemErro } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { caixaVazio, type CaixaFormData } from "../../types/caixa";

export function CaixaFormPage() {
  const { id } = useParams();
  const emEdicao = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState<CaixaFormData>(caixaVazio);
  const [carregando, setCarregando] = useState(emEdicao);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!emEdicao) return;

    async function carregar() {
      setCarregando(true);
      setErro(null);
      try {
        const lista = await caixaService.listar();
        const item = lista.find((c) => c.id === Number(id));
        if (!item) {
          setErro("Caixa não encontrado.");
          return;
        }
        setForm({ ...item, observacao: item.observacao ?? "" });
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

    const payload: CaixaFormData = { ...form, observacao: form.observacao || null };

    try {
      if (emEdicao) {
        await caixaService.atualizar({ ...payload, id: Number(id) });
        showToast("success", "Caixa atualizado com sucesso.");
      } else {
        await caixaService.criar(payload);
        showToast("success", "Caixa cadastrado com sucesso.");
      }
      navigate("/caixas");
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) return <Loading texto="Carregando caixa..." />;

  return (
    <div>
      <PageHeader titulo={emEdicao ? "Editar caixa" : "Novo caixa"} />

      {erro && <Alert mensagem={erro} />}

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="campo campo-largo">
            <label htmlFor="nome">Nome *</label>
            <input
              id="nome"
              type="text"
              value={form.nome}
              maxLength={100}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              required
            />
          </div>

          <div className="campo campo-checkbox">
            <input id="ativo" type="checkbox" checked={form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.checked })} />
            <label htmlFor="ativo">Caixa ativo</label>
          </div>

          <div className="campo campo-largo">
            <label htmlFor="observacao">Observação</label>
            <input id="observacao" type="text" value={form.observacao ?? ""} maxLength={255} onChange={(e) => setForm({ ...form, observacao: e.target.value })} />
          </div>
        </div>

        <div className="form-acoes">
          <button type="button" className="btn btn-secundario" onClick={() => navigate("/caixas")} disabled={salvando}>
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
