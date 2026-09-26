import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader";
import { Loading, LoadingInline } from "../../components/common/Loading";
import { Alert } from "../../components/common/Alert";
import { produtoService } from "../../services/produtoService";
import { categoriaProdutoService } from "../../services/categoriaProdutoService";
import { extrairMensagemErro } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { produtoVazio, type ProdutoFormData } from "../../types/produto";
import type { CategoriaProduto } from "../../types/categoriaProduto";

export function ProdutoFormPage() {
  const { id } = useParams();
  const emEdicao = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState<ProdutoFormData>(produtoVazio);
  const [categorias, setCategorias] = useState<CategoriaProduto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      setErro(null);
      try {
        setCategorias(await categoriaProdutoService.listar());

        if (emEdicao) {
          const lista = await produtoService.listar();
          const item = lista.find((p) => p.id === Number(id));
          if (!item) {
            setErro("Produto não encontrado.");
            return;
          }
          setForm({
            id: item.id,
            descricao: item.descricao,
            preco: item.preco,
            precoMembro: item.precoMembro,
            idCategoria: item.categoria.id,
            ativo: item.ativo,
            estoqueAtual: item.estoqueAtual,
            estoqueMinimo: item.estoqueMinimo ?? "",
            controlaEstoque: item.controlaEstoque,
          });
        }
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
    if (form.idCategoria === "") {
      setErro("Selecione a categoria.");
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

          <div className="campo campo-largo">
            <label htmlFor="idCategoria">Categoria *</label>
            {categorias.length === 0 ? (
              <span className="campo-ajuda">
                Nenhuma categoria cadastrada. Cadastre uma em "Categorias de Produto" antes de continuar.
              </span>
            ) : (
              <select
                id="idCategoria"
                value={form.idCategoria}
                onChange={(e) => setForm({ ...form, idCategoria: e.target.value ? Number(e.target.value) : "" })}
                required
              >
                <option value="">Selecione...</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.descricao}
                  </option>
                ))}
              </select>
            )}
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

          <div className="campo campo-checkbox">
            <input
              id="ativo"
              type="checkbox"
              checked={form.ativo}
              onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
            />
            <label htmlFor="ativo">Produto ativo</label>
          </div>

          <div className="campo campo-checkbox">
            <input
              id="controlaEstoque"
              type="checkbox"
              checked={form.controlaEstoque}
              onChange={(e) => setForm({ ...form, controlaEstoque: e.target.checked })}
            />
            <label htmlFor="controlaEstoque">Controla estoque</label>
          </div>

          {emEdicao ? (
            <div className="campo">
              <label htmlFor="estoqueAtual">Estoque atual</label>
              <input id="estoqueAtual" type="number" value={form.estoqueAtual} disabled />
              <span className="campo-ajuda">Para alterar, lance uma movimentação em "Estoque".</span>
            </div>
          ) : (
            <div className="campo">
              <label htmlFor="estoqueAtual">Estoque inicial</label>
              <input
                id="estoqueAtual"
                type="number"
                min="0"
                value={form.estoqueAtual}
                onChange={(e) => setForm({ ...form, estoqueAtual: e.target.value === "" ? "" : Number(e.target.value) })}
              />
            </div>
          )}

          <div className="campo">
            <label htmlFor="estoqueMinimo">Estoque mínimo</label>
            <input
              id="estoqueMinimo"
              type="number"
              min="0"
              value={form.estoqueMinimo}
              onChange={(e) => setForm({ ...form, estoqueMinimo: e.target.value === "" ? "" : Number(e.target.value) })}
            />
            <span className="campo-ajuda">Usado para alertar quando o estoque estiver baixo.</span>
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
