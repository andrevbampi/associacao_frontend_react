import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader";
import { Loading, LoadingInline } from "../../components/common/Loading";
import { Alert } from "../../components/common/Alert";
import { produtoService } from "../../services/produtoService";
import { extrairMensagemErro } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { produtoVazio, type ProdutoFormData } from "../../types/produto";

export function ProdutoFormPage() {
  const { id } = useParams();
  const emEdicao = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState<ProdutoFormData>(produtoVazio);
  const [carregando, setCarregando] = useState(emEdicao);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!emEdicao) return;

    async function carregar() {
      setCarregando(true);
      setErro(null);
      try {
        const lista = await produtoService.listar();
        const item = lista.find((p) => p.id === Number(id));
        if (!item) {
          setErro("Produto não encontrado.");
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

    if (form.preco === "" || form.precoMembro === "") {
      setErro("Informe os dois preços.");
      return;
    }

    setSalvando(true);
    const payload: ProdutoFormData = {
      ...form,
      preco: Number(form.preco),
      precoMembro: Number(form.precoMembro),
    };

    try {
      if (emEdicao) {
        await produtoService.atualizar({ ...payload, id: Number(id) });
        showToast("success", "Produto atualizado com sucesso.");
      } else {
        await produtoService.criar(payload);
        showToast("success", "Produto cadastrado com sucesso.");
      }
      navigate("/produtos");
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) return <Loading texto="Carregando produto..." />;

  return (
    <div>
      <PageHeader titulo={emEdicao ? "Editar produto" : "Novo produto"} />

      {erro && <Alert mensagem={erro} />}

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="campo campo-largo">
            <label htmlFor="descricao">Descrição *</label>
            <input
              id="descricao"
              type="text"
              value={form.descricao}
              maxLength={150}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              required
            />
          </div>

          <div className="campo">
            <label htmlFor="preco">Preço *</label>
            <input
              id="preco"
              type="number"
              step="0.01"
              min="0"
              value={form.preco}
              onChange={(e) => setForm({ ...form, preco: e.target.value === "" ? "" : Number(e.target.value) })}
              required
            />
          </div>

          <div className="campo">
            <label htmlFor="precoMembro">Preço para membro *</label>
            <input
              id="precoMembro"
              type="number"
              step="0.01"
              min="0"
              value={form.precoMembro}
              onChange={(e) => setForm({ ...form, precoMembro: e.target.value === "" ? "" : Number(e.target.value) })}
              required
            />
          </div>

          <div className="campo campo-checkbox campo-largo">
            <input
              id="ativo"
              type="checkbox"
              checked={form.ativo}
              onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
            />
            <label htmlFor="ativo">Produto ativo</label>
          </div>
        </div>

        <div className="form-acoes">
          <button type="button" className="btn btn-secundario" onClick={() => navigate("/produtos")} disabled={salvando}>
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
