import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader";
import { Loading, LoadingInline } from "../../components/common/Loading";
import { Alert } from "../../components/common/Alert";
import { lancamentoFinanceiroService } from "../../services/lancamentoFinanceiroService";
import { categoriaFinanceiraService } from "../../services/categoriaFinanceiraService";
import { caixaService } from "../../services/caixaService";
import { pessoaService } from "../../services/pessoaService";
import { membroService } from "../../services/membroService";
import { extrairMensagemErro } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { lancamentoFinanceiroVazio, type LancamentoFinanceiroFormData, type TipoLancamento } from "../../types/lancamentoFinanceiro";
import type { CategoriaFinanceira } from "../../types/categoriaFinanceira";
import type { Caixa } from "../../types/caixa";
import type { Pessoa } from "../../types/pessoa";
import type { MembroResponse } from "../../types/membro";
import { FORMAS_PAGAMENTO, FORMA_PAGAMENTO_LABEL } from "../../types/formaPagamento";

export function LancamentoFinanceiroFormPage() {
  const { id } = useParams();
  const emEdicao = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState<LancamentoFinanceiroFormData>(lancamentoFinanceiroVazio);
  const [categorias, setCategorias] = useState<CategoriaFinanceira[]>([]);
  const [caixas, setCaixas] = useState<Caixa[]>([]);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [membros, setMembros] = useState<MembroResponse[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      setErro(null);
      try {
        const [categoriasResp, caixasResp, pessoasResp, membrosResp] = await Promise.all([
          categoriaFinanceiraService.listar(),
          caixaService.listar(),
          pessoaService.listar(),
          membroService.listar(),
        ]);
        setCategorias(categoriasResp);
        setCaixas(caixasResp);
        setPessoas(pessoasResp);
        setMembros(membrosResp);

        if (!emEdicao && caixasResp.length === 1) {
          setForm((atual) => ({ ...atual, idCaixa: caixasResp[0].id }));
        }

        if (emEdicao) {
          const lista = await lancamentoFinanceiroService.listar();
          const item = lista.find((l) => l.id === Number(id));
          if (!item) {
            setErro("Lançamento não encontrado.");
            return;
          }
          setForm({
            id: item.id,
            idCategoriaFinanceira: item.categoriaFinanceira.id,
            idCaixa: item.caixa.id,
            tipo: item.tipo,
            valor: item.valor,
            data: item.data,
            descricao: item.descricao ?? "",
            idPessoa: item.pessoa?.id ?? "",
            idMembro: item.membro?.id ?? "",
            observacao: item.observacao ?? "",
            pago: item.pago,
            formaPagamento: item.formaPagamento ?? "",
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

  const categoriasDoTipo = categorias.filter((c) => (form.tipo === "ENTRADA" ? c.tipo === "RECEITA" : c.tipo === "DESPESA"));

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErro(null);

    if (form.idCategoriaFinanceira === "") {
      setErro("Selecione a categoria.");
      return;
    }
    if (form.idCaixa === "") {
      setErro("Selecione o caixa.");
      return;
    }
    if (form.valor === "" || Number(form.valor) <= 0) {
      setErro("Informe um valor válido.");
      return;
    }

    setSalvando(true);
    try {
      if (emEdicao) {
        await lancamentoFinanceiroService.atualizar({ ...form, id: Number(id) });
        showToast("success", "Lançamento atualizado com sucesso.");
      } else {
        await lancamentoFinanceiroService.criar(form);
        showToast("success", "Lançamento cadastrado com sucesso.");
      }
      navigate("/financeiro");
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) return <Loading texto="Carregando lançamento..." />;

  return (
    <div>
      <PageHeader titulo={emEdicao ? "Editar lançamento" : "Novo lançamento"} />

      {erro && <Alert mensagem={erro} />}

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="campo">
            <label htmlFor="tipo">Tipo *</label>
            <select
              id="tipo"
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoLancamento, idCategoriaFinanceira: "" })}
            >
              <option value="ENTRADA">Entrada</option>
              <option value="SAIDA">Saída</option>
            </select>
          </div>

          <div className="campo">
            <label htmlFor="idCategoriaFinanceira">Categoria *</label>
            {categoriasDoTipo.length === 0 ? (
              <span className="campo-ajuda">Nenhuma categoria desse tipo cadastrada ainda.</span>
            ) : (
              <select
                id="idCategoriaFinanceira"
                value={form.idCategoriaFinanceira}
                onChange={(e) => setForm({ ...form, idCategoriaFinanceira: e.target.value ? Number(e.target.value) : "" })}
                required
              >
                <option value="">Selecione...</option>
                {categoriasDoTipo.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.descricao}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="campo">
            <label htmlFor="idCaixa">Caixa *</label>
            {caixas.length === 0 ? (
              <span className="campo-ajuda">Nenhum caixa cadastrado. Cadastre um em "Caixas" antes de continuar.</span>
            ) : (
              <select
                id="idCaixa"
                value={form.idCaixa}
                onChange={(e) => setForm({ ...form, idCaixa: e.target.value ? Number(e.target.value) : "" })}
                required
              >
                <option value="">Selecione...</option>
                {caixas.map((caixa) => (
                  <option key={caixa.id} value={caixa.id}>
                    {caixa.nome}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="campo">
            <label htmlFor="valor">Valor *</label>
            <input
              id="valor"
              type="number"
              step="0.01"
              min="0"
              value={form.valor}
              onChange={(e) => setForm({ ...form, valor: e.target.value === "" ? "" : Number(e.target.value) })}
              required
            />
          </div>

          <div className="campo">
            <label htmlFor="data">Data *</label>
            <input id="data" type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} required />
          </div>

          <div className="campo campo-largo">
            <label htmlFor="descricao">Descrição</label>
            <input id="descricao" type="text" value={form.descricao} maxLength={255} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
          </div>

          <div className="campo">
            <label htmlFor="idPessoa">Pessoa (opcional)</label>
            <select id="idPessoa" value={form.idPessoa} onChange={(e) => setForm({ ...form, idPessoa: e.target.value ? Number(e.target.value) : "" })}>
              <option value="">Nenhuma</option>
              {pessoas.map((pessoa) => (
                <option key={pessoa.id} value={pessoa.id}>
                  {pessoa.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="campo">
            <label htmlFor="idMembro">Membro (opcional)</label>
            <select id="idMembro" value={form.idMembro} onChange={(e) => setForm({ ...form, idMembro: e.target.value ? Number(e.target.value) : "" })}>
              <option value="">Nenhum</option>
              {membros.map((membro) => (
                <option key={membro.id} value={membro.id}>
                  {membro.pessoa?.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="campo campo-checkbox">
            <input id="pago" type="checkbox" checked={form.pago} onChange={(e) => setForm({ ...form, pago: e.target.checked })} />
            <label htmlFor="pago">Já pago</label>
          </div>

          {form.pago && (
            <div className="campo">
              <label htmlFor="formaPagamento">Forma de pagamento</label>
              <select id="formaPagamento" value={form.formaPagamento} onChange={(e) => setForm({ ...form, formaPagamento: e.target.value as typeof form.formaPagamento })}>
                <option value="">Não informada</option>
                {FORMAS_PAGAMENTO.map((forma) => (
                  <option key={forma} value={forma}>
                    {FORMA_PAGAMENTO_LABEL[forma]}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="campo campo-largo">
            <label htmlFor="observacao">Observação</label>
            <textarea id="observacao" rows={2} value={form.observacao} onChange={(e) => setForm({ ...form, observacao: e.target.value })} />
          </div>
        </div>

        <div className="form-acoes">
          <button type="button" className="btn btn-secundario" onClick={() => navigate("/financeiro")} disabled={salvando}>
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
