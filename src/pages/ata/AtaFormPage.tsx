import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader";
import { Loading, LoadingInline } from "../../components/common/Loading";
import { Alert } from "../../components/common/Alert";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { SelectComFoto } from "../../components/common/SelectComFoto";
import { PessoaIcone } from "../../components/common/PessoaIcone";
import { ataService } from "../../services/ataService";
import { documentoAtaService } from "../../services/documentoAtaService";
import { pessoaService } from "../../services/pessoaService";
import { extrairMensagemErro } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { ataVazia, type AtaFormData, type AtaResponse } from "../../types/ata";
import type { DocumentoAta } from "../../types/documentoAta";
import type { Pessoa } from "../../types/pessoa";
import { formatarDataHora, paraDataInput } from "../../utils/formatters";
import { useAuth } from "../../context/AuthContext";

export function AtaFormPage() {
  const { pode } = useAuth();
  const { id } = useParams();
  const emEdicao = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState<AtaFormData>(ataVazia);
  const [ataAtual, setAtaAtual] = useState<AtaResponse | null>(null);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [carregando, setCarregando] = useState(emEdicao);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [documentos, setDocumentos] = useState<DocumentoAta[]>([]);
  const [enviandoDocumento, setEnviandoDocumento] = useState(false);
  const [documentoParaExcluir, setDocumentoParaExcluir] = useState<DocumentoAta | null>(null);
  const [excluindoDocumento, setExcluindoDocumento] = useState(false);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      setErro(null);
      try {
        setPessoas(await pessoaService.listar());

        if (emEdicao) {
          const lista = await ataService.listar();
          const ata = lista.find((a) => a.id === Number(id));
          if (!ata) {
            setErro("Ata não encontrada.");
            return;
          }
          setAtaAtual(ata);
          setForm({
            id: ata.id,
            dataAta: paraDataInput(ata.dataAta),
            idPessoaRedator: ata.pessoaRedator?.id ?? "",
            nomeRedator: ata.nomeRedator ?? "",
            titulo: ata.titulo ?? "",
            conteudo: ata.conteudo,
          });
          setDocumentos(pode("ata:documento-visualizar") ? await documentoAtaService.listar(ata.id) : []);
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

    if (!form.dataAta) {
      setErro("Informe a data da ata.");
      return;
    }
    if (!form.conteudo.trim()) {
      setErro("Informe o conteúdo da ata.");
      return;
    }

    setSalvando(true);
    const payload: AtaFormData = {
      ...form,
      idPessoaRedator: form.idPessoaRedator === "" ? "" : Number(form.idPessoaRedator),
      nomeRedator: form.nomeRedator || "",
      titulo: form.titulo || "",
    };

    try {
      if (emEdicao) {
        await ataService.atualizar({ ...payload, id: Number(id) });
        showToast("success", "Ata atualizada com sucesso.");
      } else {
        await ataService.criar(payload);
        showToast("success", "Ata cadastrada com sucesso.");
      }
      navigate("/atas");
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setSalvando(false);
    }
  }

  async function handleUploadDocumento(event: ChangeEvent<HTMLInputElement>) {
    const arquivo = event.target.files?.[0];
    event.target.value = "";
    if (!arquivo || !id) return;

    setEnviandoDocumento(true);
    try {
      const novo = await documentoAtaService.upload(Number(id), arquivo);
      setDocumentos((atual) => [novo, ...atual]);
      showToast("success", "Documento enviado com sucesso.");
    } catch (error) {
      showToast("error", extrairMensagemErro(error));
    } finally {
      setEnviandoDocumento(false);
    }
  }

  async function handleBaixarDocumento(documento: DocumentoAta) {
    try {
      await documentoAtaService.baixar(documento.id, documento.nomeOriginal);
    } catch (error) {
      showToast("error", extrairMensagemErro(error));
    }
  }

  async function confirmarExclusaoDocumento() {
    if (!documentoParaExcluir) return;
    setExcluindoDocumento(true);
    try {
      await documentoAtaService.remover(documentoParaExcluir.id);
      setDocumentos((atual) => atual.filter((d) => d.id !== documentoParaExcluir.id));
      showToast("success", "Documento removido.");
      setDocumentoParaExcluir(null);
    } catch (error) {
      showToast("error", extrairMensagemErro(error));
    } finally {
      setExcluindoDocumento(false);
    }
  }

  if (carregando) return <Loading texto="Carregando dados da ata..." />;

  return (
    <div>
      <PageHeader titulo={emEdicao ? "Editar ata" : "Nova ata"} />

      {erro && <Alert mensagem={erro} />}

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="campo">
            <label htmlFor="dataAta">Data da ata *</label>
            <input id="dataAta" type="date" value={form.dataAta} onChange={(e) => setForm({ ...form, dataAta: e.target.value })} required />
          </div>

          <div className="campo campo-largo">
            <label htmlFor="titulo">Título</label>
            <input id="titulo" type="text" value={form.titulo} maxLength={255} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
          </div>

          <div className="campo">
            <label htmlFor="idPessoaRedator">Redator (pessoa cadastrada)</label>
            <SelectComFoto
              id="idPessoaRedator"
              value={form.idPessoaRedator}
              onChange={(idPessoaRedator) => setForm({ ...form, idPessoaRedator })}
              textoVazio="Nenhuma"
              opcoes={pessoas.map((pessoa) => ({ value: pessoa.id, label: pessoa.nome, icone: <PessoaIcone pessoa={pessoa} /> }))}
            />
          </div>

          <div className="campo">
            <label htmlFor="nomeRedator">Ou nome do redator (sem cadastro)</label>
            <input
              id="nomeRedator"
              type="text"
              value={form.nomeRedator}
              maxLength={240}
              onChange={(e) => setForm({ ...form, nomeRedator: e.target.value })}
            />
          </div>

          <div className="campo campo-largo">
            <label htmlFor="conteudo">Conteúdo *</label>
            <textarea id="conteudo" rows={12} value={form.conteudo} onChange={(e) => setForm({ ...form, conteudo: e.target.value })} required />
          </div>

          {emEdicao && ataAtual && (
            <div className="campo campo-largo">
              <span className="campo-ajuda">
                Cadastrada em {formatarDataHora(ataAtual.dataHoraCadastro)} por {ataAtual.usuarioCadastro.pessoa?.nome ?? ataAtual.usuarioCadastro.login}.
                Última alteração em {formatarDataHora(ataAtual.dataHoraUltimaAlteracao)} por{" "}
                {ataAtual.usuarioUltimaAlteracao.pessoa?.nome ?? ataAtual.usuarioUltimaAlteracao.login}.
              </span>
            </div>
          )}
        </div>

        <div className="form-acoes">
          <button type="button" className="btn btn-secundario" onClick={() => navigate("/atas")} disabled={salvando}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primario" disabled={salvando}>
            {salvando ? <LoadingInline /> : "Salvar"}
          </button>
        </div>
      </form>

      {emEdicao && pode("ata:documento-visualizar") && (
        <div className="form-card">
          <h2 className="membro-detalhe-subtitulo">Documentos</h2>

          {pode("ata:documento-gerenciar") && (
            <>
              <label className="btn btn-secundario btn-sm">
                {enviandoDocumento ? <LoadingInline /> : "+ Enviar documento"}
                <input type="file" accept=".pdf,image/jpeg,image/png,image/webp,image/gif" hidden onChange={handleUploadDocumento} disabled={enviandoDocumento} />
              </label>
              <p className="campo-ajuda">Formatos aceitos: PDF, JPG, JPEG, PNG, WEBP ou GIF.</p>
            </>
          )}

          {documentos.length === 0 ? (
            <div className="tabela-vazia">
              <p>Nenhum documento enviado ainda.</p>
            </div>
          ) : (
            <div className="tabela-container">
              <table className="tabela">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Tamanho</th>
                    <th>Enviado em</th>
                    <th>Por</th>
                    <th className="col-acoes"></th>
                  </tr>
                </thead>
                <tbody>
                  {documentos.map((documento) => (
                    <tr key={documento.id}>
                      <td>{documento.nomeOriginal}</td>
                      <td>{(documento.tamanho / 1024).toFixed(0)} KB</td>
                      <td>{formatarDataHora(documento.dataUpload)}</td>
                      <td>{documento.usuarioUpload.pessoa?.nome ?? documento.usuarioUpload.login}</td>
                      <td className="col-acoes">
                        <button type="button" className="btn btn-secundario btn-sm btn-icone" title="Baixar" onClick={() => handleBaixarDocumento(documento)}>
                          ⬇
                        </button>{" "}
                        {pode("ata:documento-gerenciar") && (
                          <button
                            type="button"
                            className="btn btn-perigo btn-sm btn-icone"
                            title="Excluir"
                            onClick={() => setDocumentoParaExcluir(documento)}
                          >
                            🗑
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        aberto={documentoParaExcluir !== null}
        titulo="Excluir documento"
        mensagem={`Tem certeza de que deseja excluir o documento "${documentoParaExcluir?.nomeOriginal}"?`}
        carregando={excluindoDocumento}
        onCancelar={() => setDocumentoParaExcluir(null)}
        onConfirmar={confirmarExclusaoDocumento}
      />
    </div>
  );
}
