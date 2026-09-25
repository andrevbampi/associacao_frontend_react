import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader";
import { Loading, LoadingInline } from "../../components/common/Loading";
import { Alert } from "../../components/common/Alert";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { membroService } from "../../services/membroService";
import { historicoMembroService } from "../../services/historicoMembroService";
import { tipoEventoService } from "../../services/tipoEventoService";
import { extrairMensagemErro } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import type { MembroResponse } from "../../types/membro";
import type { HistoricoMembroFormData, HistoricoMembroResponse } from "../../types/historicoMembro";
import { historicoMembroVazio } from "../../types/historicoMembro";
import type { TipoEvento } from "../../types/tipoEvento";
import { formatarData, formatarDataHora } from "../../utils/formatters";
import "./MembroDetailPage.css";

export function MembroDetailPage() {
  const { id } = useParams();
  const idMembro = Number(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [membro, setMembro] = useState<MembroResponse | null>(null);
  const [historico, setHistorico] = useState<HistoricoMembroResponse[]>([]);
  const [tiposEvento, setTiposEvento] = useState<TipoEvento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [form, setForm] = useState<HistoricoMembroFormData>(historicoMembroVazio);
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState<string | null>(null);
  const [paraExcluir, setParaExcluir] = useState<HistoricoMembroResponse | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const [membros, historicoLista, tipos] = await Promise.all([
        membroService.listar(),
        historicoMembroService.listarPorMembro(idMembro),
        tipoEventoService.listar(),
      ]);
      const encontrado = membros.find((m) => m.id === idMembro);
      if (!encontrado) {
        setErro("Membro não encontrado.");
        return;
      }
      setMembro(encontrado);
      setHistorico(historicoLista);
      setTiposEvento(tipos);
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setCarregando(false);
    }
  }, [idMembro]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function iniciarEdicao(item: HistoricoMembroResponse) {
    setForm({
      id: item.id,
      idTipoEvento: item.tipoEvento.id,
      descricao: item.descricao,
      observacao: item.observacao ?? "",
      ativo: item.ativo,
    });
    setErroForm(null);
  }

  function cancelarEdicao() {
    setForm(historicoMembroVazio);
    setErroForm(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErroForm(null);

    if (form.idTipoEvento === "") {
      setErroForm("Selecione o tipo de evento.");
      return;
    }

    setSalvando(true);
    try {
      if (form.id) {
        await historicoMembroService.atualizar({
          id: form.id,
          idMembro,
          idTipoEvento: Number(form.idTipoEvento),
          descricao: form.descricao,
          observacao: form.observacao || null,
          ativo: form.ativo,
        });
        showToast("success", "Registro do histórico atualizado.");
      } else {
        await historicoMembroService.criar({
          idMembro,
          idTipoEvento: Number(form.idTipoEvento),
          descricao: form.descricao,
          observacao: form.observacao || null,
          ativo: true,
        });
        showToast("success", "Evento adicionado ao histórico.");
      }
      setForm(historicoMembroVazio);
      carregar();
    } catch (error) {
      setErroForm(extrairMensagemErro(error));
    } finally {
      setSalvando(false);
    }
  }

  async function confirmarExclusao() {
    if (!paraExcluir) return;
    setExcluindo(true);
    try {
      await historicoMembroService.remover(paraExcluir.id);
      showToast("success", "Registro removido do histórico.");
      setParaExcluir(null);
      carregar();
    } catch (error) {
      showToast("error", extrairMensagemErro(error));
    } finally {
      setExcluindo(false);
    }
  }

  if (carregando) return <Loading texto="Carregando membro..." />;
  if (erro) return <Alert mensagem={erro} />;
  if (!membro) return null;

  return (
    <div>
      <PageHeader titulo={membro.pessoa?.nome ?? "Membro"} subtitulo="Detalhes do membro e histórico de eventos." />

      <div className="membro-detalhe-card">
        <div>
          <span className="membro-detalhe-label">Status</span>
          <span>{membro.status?.descricao ?? "-"}</span>
        </div>
        <div>
          <span className="membro-detalhe-label">Situação</span>
          <span className={`badge ${membro.ativo ? "badge-verde" : "badge-cinza"}`}>{membro.ativo ? "Ativo" : "Inativo"}</span>
        </div>
        <div>
          <span className="membro-detalhe-label">Inclusão</span>
          <span>{formatarData(membro.dataInclusao)}</span>
        </div>
        <div>
          <span className="membro-detalhe-label">Saída</span>
          <span>{formatarData(membro.dataSaida)}</span>
        </div>
        <div>
          <Link to={`/membros/${membro.id}/editar`} className="btn btn-secundario btn-sm">
            ✎ Editar membro
          </Link>
        </div>
      </div>

      <h2 className="membro-detalhe-subtitulo">Histórico</h2>

      <form className="form-card historico-form" onSubmit={handleSubmit}>
        {erroForm && <Alert mensagem={erroForm} />}
        <div className="form-grid">
          <div className="campo">
            <label htmlFor="idTipoEvento">Tipo de evento *</label>
            {tiposEvento.length === 0 ? (
              <span className="campo-ajuda">
                Nenhum tipo cadastrado. Cadastre um em "Tipos de Evento" antes de continuar.
              </span>
            ) : (
              <select
                id="idTipoEvento"
                value={form.idTipoEvento}
                onChange={(e) => setForm({ ...form, idTipoEvento: e.target.value ? Number(e.target.value) : "" })}
                required
              >
                <option value="">Selecione...</option>
                {tiposEvento.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.descricao}
                  </option>
                ))}
              </select>
            )}
          </div>

          {form.id && (
            <div className="campo campo-checkbox">
              <input id="ativo" type="checkbox" checked={form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.checked })} />
              <label htmlFor="ativo">Registro ativo</label>
            </div>
          )}

          <div className="campo campo-largo">
            <label htmlFor="descricao">Descrição *</label>
            <input
              id="descricao"
              type="text"
              value={form.descricao}
              maxLength={255}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              required
            />
          </div>

          <div className="campo campo-largo">
            <label htmlFor="observacao">Observação</label>
            <textarea
              id="observacao"
              rows={2}
              value={form.observacao}
              onChange={(e) => setForm({ ...form, observacao: e.target.value })}
            />
          </div>
        </div>

        <div className="form-acoes">
          {form.id && (
            <button type="button" className="btn btn-secundario" onClick={cancelarEdicao} disabled={salvando}>
              Cancelar edição
            </button>
          )}
          <button type="submit" className="btn btn-primario" disabled={salvando}>
            {salvando ? <LoadingInline /> : form.id ? "Salvar alteração" : "+ Adicionar ao histórico"}
          </button>
        </div>
      </form>

      {historico.length === 0 ? (
        <div className="tabela-vazia">
          <p>Nenhum evento registrado para este membro ainda.</p>
        </div>
      ) : (
        <ul className="timeline">
          {historico.map((item) => (
            <li key={item.id} className={`timeline-item ${!item.ativo ? "timeline-item-inativo" : ""}`}>
              <div className="timeline-marcador" />
              <div className="timeline-conteudo">
                <div className="timeline-cabecalho">
                  <span className="timeline-tipo">{item.tipoEvento.descricao}</span>
                  <span className="timeline-data">{formatarDataHora(item.data)}</span>
                </div>
                <p className="timeline-descricao">{item.descricao}</p>
                {item.observacao && <p className="timeline-observacao">{item.observacao}</p>}
                <div className="timeline-rodape">
                  <span>
                    registrado por {item.usuarioRegistro?.pessoa?.nome ?? item.usuarioRegistro?.login}
                    {!item.ativo && " · inativo"}
                  </span>
                  <span className="timeline-acoes">
                    <button type="button" className="btn btn-secundario btn-sm btn-icone" title="Editar" onClick={() => iniciarEdicao(item)}>
                      ✎
                    </button>
                    <button type="button" className="btn btn-perigo btn-sm btn-icone" title="Excluir" onClick={() => setParaExcluir(item)}>
                      🗑
                    </button>
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="form-acoes-voltar">
        <button type="button" className="btn btn-secundario" onClick={() => navigate("/membros")}>
          ← Voltar para Membros
        </button>
      </div>

      <ConfirmDialog
        aberto={paraExcluir !== null}
        titulo="Excluir registro do histórico"
        mensagem="Tem certeza de que deseja excluir este registro do histórico?"
        carregando={excluindo}
        onCancelar={() => setParaExcluir(null)}
        onConfirmar={confirmarExclusao}
      />
    </div>
  );
}
