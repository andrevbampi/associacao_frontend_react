import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader";
import { Loading, LoadingInline } from "../../components/common/Loading";
import { Alert } from "../../components/common/Alert";
import { estoqueService } from "../../services/estoqueService";
import { produtoService } from "../../services/produtoService";
import { categoriaFinanceiraService } from "../../services/categoriaFinanceiraService";
import { extrairMensagemErro } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { movimentoEstoqueVazio, ORIGENS_MOVIMENTO_MANUAL, ORIGEM_MOVIMENTO_LABEL, TIPOS_MOVIMENTO, TIPO_MOVIMENTO_LABEL, type MovimentoEstoqueFormData } from "../../types/estoque";
import type { Produto } from "../../types/produto";
import type { CategoriaFinanceira } from "../../types/categoriaFinanceira";

export function MovimentoEstoqueFormPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState<MovimentoEstoqueFormData>(movimentoEstoqueVazio);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categoriasDespesa, setCategoriasDespesa] = useState<CategoriaFinanceira[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([produtoService.listar({ ativo: true }), categoriaFinanceiraService.listar()])
      .then(([produtosResp, categoriasResp]) => {
        setProdutos(produtosResp.filter((p) => p.controlaEstoque));
        setCategoriasDespesa(categoriasResp.filter((c) => c.tipo === "DESPESA"));
      })
      .catch((error) => setErro(extrairMensagemErro(error)))
      .finally(() => setCarregando(false));
  }, []);

  const podeGerarLancamento = form.tipo === "ENTRADA" && form.origem === "COMPRA";

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErro(null);

    if (form.idProduto === "") {
      setErro("Selecione o produto.");
      return;
    }
    if (form.quantidade === "" || Number(form.quantidade) < 1) {
      setErro("Informe uma quantidade válida.");
      return;
    }
    if (form.gerarLancamentoFinanceiro && (form.idCategoriaFinanceira === "" || form.valorLancamento === "")) {
      setErro("Para gerar o lançamento financeiro, informe a categoria e o valor da compra.");
      return;
    }

    setSalvando(true);
    try {
      await estoqueService.lancar(form);
      showToast("success", "Movimentação lançada com sucesso.");
      navigate("/estoque");
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) return <Loading texto="Carregando..." />;

  return (
    <div>
      <PageHeader titulo="Lançar movimentação de estoque" />

      {erro && <Alert mensagem={erro} />}

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="campo campo-largo">
            <label htmlFor="idProduto">Produto *</label>
            {produtos.length === 0 ? (
              <span className="campo-ajuda">Nenhum produto ativo com controle de estoque encontrado.</span>
            ) : (
              <select id="idProduto" value={form.idProduto} onChange={(e) => setForm({ ...form, idProduto: e.target.value ? Number(e.target.value) : "" })} required>
                <option value="">Selecione...</option>
                {produtos.map((produto) => (
                  <option key={produto.id} value={produto.id}>
                    {produto.descricao} (estoque atual: {produto.estoqueAtual})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="campo">
            <label htmlFor="tipo">Tipo *</label>
            <select id="tipo" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as typeof form.tipo, gerarLancamentoFinanceiro: false })}>
              {TIPOS_MOVIMENTO.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {TIPO_MOVIMENTO_LABEL[tipo]}
                </option>
              ))}
            </select>
            <span className="campo-ajuda">
              {form.tipo === "AJUSTE" ? "A quantidade informada vira o novo estoque atual." : "A quantidade é somada (entrada) ou subtraída (saída) do estoque atual."}
            </span>
          </div>

          <div className="campo">
            <label htmlFor="quantidade">Quantidade *</label>
            <input
              id="quantidade"
              type="number"
              min={0}
              value={form.quantidade}
              onChange={(e) => setForm({ ...form, quantidade: e.target.value === "" ? "" : Number(e.target.value) })}
              required
            />
          </div>

          <div className="campo">
            <label htmlFor="origem">Origem</label>
            <select id="origem" value={form.origem} onChange={(e) => setForm({ ...form, origem: e.target.value as typeof form.origem, gerarLancamentoFinanceiro: false })}>
              {ORIGENS_MOVIMENTO_MANUAL.map((origem) => (
                <option key={origem} value={origem}>
                  {ORIGEM_MOVIMENTO_LABEL[origem]}
                </option>
              ))}
            </select>
          </div>

          <div className="campo campo-largo">
            <label htmlFor="observacao">Observação</label>
            <input id="observacao" type="text" value={form.observacao} maxLength={500} onChange={(e) => setForm({ ...form, observacao: e.target.value })} />
          </div>

          {podeGerarLancamento && (
            <>
              <div className="campo campo-checkbox campo-largo">
                <input
                  id="gerarLancamentoFinanceiro"
                  type="checkbox"
                  checked={form.gerarLancamentoFinanceiro}
                  onChange={(e) => setForm({ ...form, gerarLancamentoFinanceiro: e.target.checked })}
                />
                <label htmlFor="gerarLancamentoFinanceiro">Gerar lançamento financeiro de despesa para esta compra</label>
              </div>

              {form.gerarLancamentoFinanceiro && (
                <>
                  <div className="campo">
                    <label htmlFor="idCategoriaFinanceira">Categoria financeira *</label>
                    {categoriasDespesa.length === 0 ? (
                      <span className="campo-ajuda">Cadastre uma categoria de despesa antes de continuar.</span>
                    ) : (
                      <select
                        id="idCategoriaFinanceira"
                        value={form.idCategoriaFinanceira}
                        onChange={(e) => setForm({ ...form, idCategoriaFinanceira: e.target.value ? Number(e.target.value) : "" })}
                      >
                        <option value="">Selecione...</option>
                        {categoriasDespesa.map((categoria) => (
                          <option key={categoria.id} value={categoria.id}>
                            {categoria.descricao}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="campo">
                    <label htmlFor="valorLancamento">Valor total da compra *</label>
                    <input
                      id="valorLancamento"
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.valorLancamento}
                      onChange={(e) => setForm({ ...form, valorLancamento: e.target.value === "" ? "" : Number(e.target.value) })}
                    />
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <div className="form-acoes">
          <button type="button" className="btn btn-secundario" onClick={() => navigate("/estoque")} disabled={salvando}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primario" disabled={salvando}>
            {salvando ? <LoadingInline /> : "Lançar movimentação"}
          </button>
        </div>
      </form>
    </div>
  );
}
