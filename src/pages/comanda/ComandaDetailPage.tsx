import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader";
import { Loading, LoadingInline } from "../../components/common/Loading";
import { Alert } from "../../components/common/Alert";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { comandaService } from "../../services/comandaService";
import { produtoService } from "../../services/produtoService";
import { caixaService } from "../../services/caixaService";
import { parametroSistemaService } from "../../services/parametroSistemaService";
import { extrairMensagemErro } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import type { ComandaResponse } from "../../types/comanda";
import type { Produto } from "../../types/produto";
import type { Caixa } from "../../types/caixa";
import { CHAVE_CAIXA_COMANDA } from "../../types/parametroSistema";
import { FORMAS_PAGAMENTO, FORMA_PAGAMENTO_LABEL, type FormaPagamento } from "../../types/formaPagamento";
import { formatarDataHora, formatarMoeda } from "../../utils/formatters";
import "./Comanda.css";

export function ComandaDetailPage() {
  const { id } = useParams();
  const idComanda = Number(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [comanda, setComanda] = useState<ComandaResponse | null>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [idProdutoNovo, setIdProdutoNovo] = useState<number | "">("");
  const [quantidadeNova, setQuantidadeNova] = useState(1);
  const [adicionando, setAdicionando] = useState(false);

  const [processandoItem, setProcessandoItem] = useState<number | null>(null);
  const [paraRemover, setParaRemover] = useState<number | null>(null);
  const [removendo, setRemovendo] = useState(false);

  const [fechando, setFechando] = useState(false);
  const [registrandoPagamento, setRegistrandoPagamento] = useState(false);
  const [cancelarAberto, setCancelarAberto] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento | "">("");
  const [desfazendo, setDesfazendo] = useState(false);
  const [caixas, setCaixas] = useState<Caixa[]>([]);
  const [idCaixaSelecionado, setIdCaixaSelecionado] = useState<number | "">("");
  const [caixaComandaAutomatico, setCaixaComandaAutomatico] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const [comandaAtual, produtosAtivos, listaCaixas, parametros] = await Promise.all([
        comandaService.buscarPorId(idComanda),
        produtoService.listar(),
        caixaService.listar(),
        parametroSistemaService.listar(),
      ]);
      setComanda(comandaAtual);
      setProdutos(produtosAtivos.filter((p) => p.ativo));
      setCaixas(listaCaixas);

      const caixaComanda = parametros.find((p) => p.chave === CHAVE_CAIXA_COMANDA);
      const idCaixaParametro = caixaComanda?.valor ? Number(caixaComanda.valor) : 0;
      const caixaValido = idCaixaParametro > 0 && listaCaixas.some((c) => c.id === idCaixaParametro);
      setCaixaComandaAutomatico(caixaValido);
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setCarregando(false);
    }
  }, [idComanda]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function handleAdicionarItem(event: FormEvent) {
    event.preventDefault();
    if (idProdutoNovo === "" || quantidadeNova < 1) return;

    setAdicionando(true);
    try {
      const atualizada = await comandaService.adicionarItem(idComanda, { idProduto: Number(idProdutoNovo), quantidade: quantidadeNova });
      setComanda(atualizada);
      setIdProdutoNovo("");
      setQuantidadeNova(1);
      produtoService.listar().then((lista) => setProdutos(lista.filter((p) => p.ativo)));
    } catch (error) {
      showToast("error", extrairMensagemErro(error));
    } finally {
      setAdicionando(false);
    }
  }

  async function alterarQuantidade(idItem: number, idProduto: number, novaQuantidade: number) {
    if (novaQuantidade < 1) return;
    setProcessandoItem(idItem);
    try {
      const atualizada = await comandaService.alterarItem(idComanda, idItem, { idProduto, quantidade: novaQuantidade });
      setComanda(atualizada);
      produtoService.listar().then((lista) => setProdutos(lista.filter((p) => p.ativo)));
    } catch (error) {
      showToast("error", extrairMensagemErro(error));
    } finally {
      setProcessandoItem(null);
    }
  }

  async function confirmarRemocaoItem() {
    if (paraRemover === null) return;
    setRemovendo(true);
    try {
      const atualizada = await comandaService.removerItem(idComanda, paraRemover);
      setComanda(atualizada);
      setParaRemover(null);
      produtoService.listar().then((lista) => setProdutos(lista.filter((p) => p.ativo)));
    } catch (error) {
      showToast("error", extrairMensagemErro(error));
    } finally {
      setRemovendo(false);
    }
  }

  async function handleFechar(pago: boolean) {
    if (pago && !caixaComandaAutomatico && idCaixaSelecionado === "") {
      showToast("error", "Selecione o caixa para registrar o pagamento.");
      return;
    }

    setFechando(true);
    try {
      const atualizada = await comandaService.fechar(idComanda, {
        pago,
        formaPagamento: pago ? formaPagamento || null : null,
        idCaixa: pago && !caixaComandaAutomatico ? Number(idCaixaSelecionado) : null,
      });
      setComanda(atualizada);
      showToast("success", pago ? "Comanda fechada e paga." : "Comanda fechada (pagamento pendente).");
    } catch (error) {
      showToast("error", extrairMensagemErro(error));
    } finally {
      setFechando(false);
    }
  }

  async function handleRegistrarPagamento() {
    if (!caixaComandaAutomatico && idCaixaSelecionado === "") {
      showToast("error", "Selecione o caixa para registrar o pagamento.");
      return;
    }

    setRegistrandoPagamento(true);
    try {
      const atualizada = await comandaService.registrarPagamento(idComanda, {
        formaPagamento: formaPagamento || null,
        idCaixa: caixaComandaAutomatico ? null : Number(idCaixaSelecionado),
      });
      setComanda(atualizada);
      showToast("success", "Pagamento registrado com sucesso.");
    } catch (error) {
      showToast("error", extrairMensagemErro(error));
    } finally {
      setRegistrandoPagamento(false);
    }
  }

  async function handleDesfazerPagamento() {
    setDesfazendo(true);
    try {
      const atualizada = await comandaService.desfazerPagamento(idComanda);
      setComanda(atualizada);
      showToast("info", "Pagamento desfeito: estoque e financeiro foram estornados.");
    } catch (error) {
      showToast("error", extrairMensagemErro(error));
    } finally {
      setDesfazendo(false);
    }
  }

  async function handleDesfazerFechamento() {
    setDesfazendo(true);
    try {
      const atualizada = await comandaService.desfazerFechamento(idComanda);
      setComanda(atualizada);
      showToast("info", "Fechamento desfeito: a comanda voltou a ficar aberta.");
    } catch (error) {
      showToast("error", extrairMensagemErro(error));
    } finally {
      setDesfazendo(false);
    }
  }

  async function confirmarCancelamento() {
    setCancelando(true);
    try {
      const atualizada = await comandaService.cancelar(idComanda);
      setComanda(atualizada);
      setCancelarAberto(false);
      showToast("info", "Comanda cancelada.");
    } catch (error) {
      showToast("error", extrairMensagemErro(error));
    } finally {
      setCancelando(false);
    }
  }

  if (carregando) return <Loading texto="Carregando comanda..." />;
  if (erro) return <Alert mensagem={erro} />;
  if (!comanda) return null;

  const aberta = comanda.status === "ABERTA";

  return (
    <div>
      <PageHeader
        titulo={comanda.pessoa?.nome ?? comanda.nomeTemporario ?? `Comanda #${comanda.id}`}
        subtitulo={`Aberta em ${formatarDataHora(comanda.dataAbertura)}`}
      />

      <div className="comanda-status-linha">
        <span className={`badge ${aberta ? "badge-verde" : "badge-cinza"}`}>{comanda.status}</span>
        {comanda.status === "FECHADA" && (
          <span className={`badge ${comanda.pago ? "badge-verde" : "badge-cinza"}`}>{comanda.pago ? "Pago" : "Pagamento pendente"}</span>
        )}
        {comanda.dataFechamento && <span className="comanda-status-detalhe">Fechada em {formatarDataHora(comanda.dataFechamento)}</span>}
        {comanda.dataPagamento && <span className="comanda-status-detalhe">Pago em {formatarDataHora(comanda.dataPagamento)}</span>}
        {comanda.formaPagamento && <span className="comanda-status-detalhe">via {FORMA_PAGAMENTO_LABEL[comanda.formaPagamento]}</span>}
      </div>

      {aberta && (
        <form className="form-card comanda-add-item" onSubmit={handleAdicionarItem}>
          <div className="comanda-add-item-linha">
            <div className="campo">
              <label htmlFor="idProdutoNovo">Produto</label>
              {produtos.length === 0 ? (
                <span className="campo-ajuda">Nenhum produto ativo cadastrado.</span>
              ) : (
                <select id="idProdutoNovo" value={idProdutoNovo} onChange={(e) => setIdProdutoNovo(e.target.value ? Number(e.target.value) : "")}>
                  <option value="">Selecione um produto...</option>
                  {produtos.map((produto) => (
                    <option key={produto.id} value={produto.id}>
                      {produto.descricao} — {formatarMoeda(produto.preco)}
                      {produto.controlaEstoque ? ` (${produto.estoqueDisponivel} em estoque)` : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="campo comanda-campo-qtd">
              <label htmlFor="quantidadeNova">Qtd.</label>
              <input
                id="quantidadeNova"
                type="number"
                min={1}
                value={quantidadeNova}
                onChange={(e) => setQuantidadeNova(Math.max(1, Number(e.target.value)))}
              />
            </div>
            <button type="submit" className="btn btn-primario" disabled={adicionando || idProdutoNovo === ""}>
              {adicionando ? <LoadingInline /> : "+ Adicionar"}
            </button>
          </div>
        </form>
      )}

      <div className="tabela-container comanda-itens">
        <table className="tabela">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Preço unit.</th>
              <th>Quantidade</th>
              <th>Subtotal</th>
              {aberta && <th className="col-acoes"></th>}
            </tr>
          </thead>
          <tbody>
            {(comanda.itens ?? []).length === 0 ? (
              <tr>
                <td colSpan={aberta ? 5 : 4} style={{ textAlign: "center", color: "var(--color-text-muted)" }}>
                  Nenhum item lançado ainda.
                </td>
              </tr>
            ) : (
              comanda.itens?.map((item) => (
                <tr key={item.id}>
                  <td>{item.produto.descricao}</td>
                  <td>{formatarMoeda(item.precoUnitario)}</td>
                  <td>
                    {aberta ? (
                      <input
                        type="number"
                        min={1}
                        className="comanda-input-qtd"
                        value={item.quantidade}
                        disabled={processandoItem === item.id}
                        onChange={(e) => alterarQuantidade(item.id, item.produto.id, Math.max(1, Number(e.target.value)))}
                      />
                    ) : (
                      item.quantidade
                    )}
                  </td>
                  <td>{formatarMoeda(item.subtotal)}</td>
                  {aberta && (
                    <td className="col-acoes">
                      <button
                        type="button"
                        className="btn btn-perigo btn-sm btn-icone"
                        title="Remover item"
                        onClick={() => setParaRemover(item.id)}
                        disabled={processandoItem === item.id}
                      >
                        🗑
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="comanda-total">
        <span>Total</span>
        <strong>{formatarMoeda(comanda.valorTotal)}</strong>
      </div>

      {aberta && (
        <>
          <div className="campo comanda-forma-pagamento">
            <label htmlFor="formaPagamento">Forma de pagamento (ao fechar pago ou registrar pagamento)</label>
            <select id="formaPagamento" value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value as FormaPagamento | "")}>
              <option value="">Não informada</option>
              {FORMAS_PAGAMENTO.map((forma) => (
                <option key={forma} value={forma}>
                  {FORMA_PAGAMENTO_LABEL[forma]}
                </option>
              ))}
            </select>
          </div>

          {!caixaComandaAutomatico && (
            <div className="campo comanda-forma-pagamento">
              <label htmlFor="idCaixaSelecionado">Caixa * (ao fechar pago)</label>
              <select id="idCaixaSelecionado" value={idCaixaSelecionado} onChange={(e) => setIdCaixaSelecionado(e.target.value ? Number(e.target.value) : "")}>
                <option value="">Selecione...</option>
                {caixas.map((caixa) => (
                  <option key={caixa.id} value={caixa.id}>
                    {caixa.nome}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="comanda-acoes-finais">
            <button type="button" className="btn btn-secundario" onClick={() => setCancelarAberto(true)}>
              Cancelar comanda
            </button>
            <button type="button" className="btn btn-secundario" disabled={fechando} onClick={() => handleFechar(false)}>
              {fechando ? <LoadingInline /> : "Fechar (pagamento pendente)"}
            </button>
            <button type="button" className="btn btn-primario" disabled={fechando} onClick={() => handleFechar(true)}>
              {fechando ? <LoadingInline /> : "Fechar e registrar pagamento"}
            </button>
          </div>
        </>
      )}

      {comanda.status === "FECHADA" && !comanda.pago && (
        <div className="comanda-acoes-finais">
          <div className="campo comanda-forma-pagamento">
            <label htmlFor="formaPagamentoPendente">Forma de pagamento</label>
            <select id="formaPagamentoPendente" value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value as FormaPagamento | "")}>
              <option value="">Não informada</option>
              {FORMAS_PAGAMENTO.map((forma) => (
                <option key={forma} value={forma}>
                  {FORMA_PAGAMENTO_LABEL[forma]}
                </option>
              ))}
            </select>
          </div>
          {!caixaComandaAutomatico && (
            <div className="campo comanda-forma-pagamento">
              <label htmlFor="idCaixaSelecionadoPendente">Caixa *</label>
              <select
                id="idCaixaSelecionadoPendente"
                value={idCaixaSelecionado}
                onChange={(e) => setIdCaixaSelecionado(e.target.value ? Number(e.target.value) : "")}
              >
                <option value="">Selecione...</option>
                {caixas.map((caixa) => (
                  <option key={caixa.id} value={caixa.id}>
                    {caixa.nome}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button type="button" className="btn btn-secundario" disabled={desfazendo} onClick={handleDesfazerFechamento}>
            {desfazendo ? <LoadingInline /> : "Desfazer fechamento"}
          </button>
          <button type="button" className="btn btn-primario" disabled={registrandoPagamento} onClick={handleRegistrarPagamento}>
            {registrandoPagamento ? <LoadingInline /> : "Registrar pagamento"}
          </button>
        </div>
      )}

      {comanda.status === "FECHADA" && comanda.pago && (
        <div className="comanda-acoes-finais">
          <button type="button" className="btn btn-secundario" disabled={desfazendo} onClick={handleDesfazerFechamento}>
            {desfazendo ? <LoadingInline /> : "Desfazer fechamento"}
          </button>
          <button type="button" className="btn btn-secundario" disabled={desfazendo} onClick={handleDesfazerPagamento}>
            {desfazendo ? <LoadingInline /> : "Desfazer pagamento"}
          </button>
        </div>
      )}

      <div className="form-acoes-voltar">
        <button type="button" className="btn btn-secundario" onClick={() => navigate("/comandas")}>
          ← Voltar para Comandas
        </button>
      </div>

      <ConfirmDialog
        aberto={paraRemover !== null}
        titulo="Remover item"
        mensagem="Tem certeza de que deseja remover este item da comanda?"
        carregando={removendo}
        onCancelar={() => setParaRemover(null)}
        onConfirmar={confirmarRemocaoItem}
      />

      <ConfirmDialog
        aberto={cancelarAberto}
        titulo="Cancelar comanda"
        mensagem="Tem certeza de que deseja cancelar esta comanda? Os itens lançados serão mantidos apenas para histórico."
        carregando={cancelando}
        textoConfirmar="Cancelar comanda"
        textoCancelar="Voltar"
        onCancelar={() => setCancelarAberto(false)}
        onConfirmar={confirmarCancelamento}
      />
    </div>
  );
}
