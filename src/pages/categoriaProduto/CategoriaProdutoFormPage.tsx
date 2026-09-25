import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader";
import { Loading, LoadingInline } from "../../components/common/Loading";
import { Alert } from "../../components/common/Alert";
import { categoriaProdutoService } from "../../services/categoriaProdutoService";
import { extrairMensagemErro } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { categoriaProdutoVazia, type CategoriaProdutoFormData } from "../../types/categoriaProduto";

export function CategoriaProdutoFormPage() {
  const { id } = useParams();
  const emEdicao = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState<CategoriaProdutoFormData>(categoriaProdutoVazia);
  const [carregando, setCarregando] = useState(emEdicao);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!emEdicao) return;

    async function carregar() {
      setCarregando(true);
      setErro(null);
      try {
        const lista = await categoriaProdutoService.listar();
        const item = lista.find((c) => c.id === Number(id));
        if (!item) {
          setErro("Categoria não encontrada.");
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
        await categoriaProdutoService.atualizar({ ...form, id: Number(id) });
        showToast("success", "Categoria atualizada com sucesso.");
      } else {
        await categoriaProdutoService.criar(form);
        showToast("success", "Categoria cadastrada com sucesso.");
      }
      navigate("/categorias-produto");
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) return <Loading texto="Carregando categoria..." />;

  return (
    <div>
      <PageHeader titulo={emEdicao ? "Editar categoria" : "Nova categoria"} />

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
          <button type="button" className="btn btn-secundario" onClick={() => navigate("/categorias-produto")} disabled={salvando}>
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
