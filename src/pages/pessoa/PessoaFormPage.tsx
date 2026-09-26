import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader";
import { Loading } from "../../components/common/Loading";
import { Alert } from "../../components/common/Alert";
import { LoadingInline } from "../../components/common/Loading";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { ImagemAutenticada } from "../../components/common/ImagemAutenticada";
import { pessoaService } from "../../services/pessoaService";
import { documentoPessoaService } from "../../services/documentoPessoaService";
import { extrairMensagemErro } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { pessoaVazia, TIPO_PESSOA_FISICA, TIPO_PESSOA_JURIDICA, type PessoaFormData } from "../../types/pessoa";
import type { DocumentoPessoa } from "../../types/documentoPessoa";
import { paraDataInput, formatarDataHora } from "../../utils/formatters";
import { mascararDocumento, validarDocumento } from "../../utils/documento";

export function PessoaFormPage() {
  const { id } = useParams();
  const emEdicao = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState<PessoaFormData>(pessoaVazia);
  const [carregando, setCarregando] = useState(emEdicao);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [temFoto, setTemFoto] = useState(false);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [removendoFotoAberto, setRemovendoFotoAberto] = useState(false);
  const [removendoFoto, setRemovendoFoto] = useState(false);

  const [documentos, setDocumentos] = useState<DocumentoPessoa[]>([]);
  const [enviandoDocumento, setEnviandoDocumento] = useState(false);
  const [documentoParaExcluir, setDocumentoParaExcluir] = useState<DocumentoPessoa | null>(null);
  const [excluindoDocumento, setExcluindoDocumento] = useState(false);

  useEffect(() => {
    if (!emEdicao) return;

    async function carregar() {
      setCarregando(true);
      setErro(null);
      try {
        const pessoas = await pessoaService.listar();
        const pessoa = pessoas.find((p) => p.id === Number(id));
        if (!pessoa) {
          setErro("Pessoa não encontrada.");
          return;
        }
        setForm({ ...pessoa, dataNascimento: paraDataInput(pessoa.dataNascimento) });
        setTemFoto(pessoa.temFoto);
        setDocumentos(await documentoPessoaService.listar(pessoa.id));
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

    if (!validarDocumento(form.documento, form.tipo)) {
      setErro(form.tipo === TIPO_PESSOA_FISICA ? "CPF inválido." : "CNPJ inválido.");
      return;
    }

    setSalvando(true);

    const payload: PessoaFormData = {
      ...form,
      dataNascimento: form.dataNascimento || null,
      telefone: form.telefone || null,
      email: form.email || null,
      endereco: form.endereco || null,
    };
    // temFoto é só leitura (derivado no back-end); não faz sentido reenviá-lo.
    delete (payload as Partial<PessoaFormData>).temFoto;

    try {
      if (emEdicao) {
        await pessoaService.atualizar({ ...payload, id: Number(id) });
        showToast("success", "Pessoa atualizada com sucesso.");
      } else {
        await pessoaService.criar(payload);
        showToast("success", "Pessoa cadastrada com sucesso.");
      }
      navigate("/pessoas");
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setSalvando(false);
    }
  }

  async function handleUploadFoto(event: ChangeEvent<HTMLInputElement>) {
    const arquivo = event.target.files?.[0];
    event.target.value = "";
    if (!arquivo || !id) return;

    setEnviandoFoto(true);
    try {
      await pessoaService.uploadFoto(Number(id), arquivo);
      setTemFoto(true);
      showToast("success", "Foto atualizada com sucesso.");
    } catch (error) {
      showToast("error", extrairMensagemErro(error));
    } finally {
      setEnviandoFoto(false);
    }
  }

  async function confirmarRemocaoFoto() {
    if (!id) return;
    setRemovendoFoto(true);
    try {
      await pessoaService.removerFoto(Number(id));
      setTemFoto(false);
      setRemovendoFotoAberto(false);
      showToast("success", "Foto removida.");
    } catch (error) {
      showToast("error", extrairMensagemErro(error));
    } finally {
      setRemovendoFoto(false);
    }
  }

  async function handleUploadDocumento(event: ChangeEvent<HTMLInputElement>) {
    const arquivo = event.target.files?.[0];
    event.target.value = "";
    if (!arquivo || !id) return;

    setEnviandoDocumento(true);
    try {
      const novo = await documentoPessoaService.upload(Number(id), arquivo);
      setDocumentos((atual) => [novo, ...atual]);
      showToast("success", "Documento enviado com sucesso.");
    } catch (error) {
      showToast("error", extrairMensagemErro(error));
    } finally {
      setEnviandoDocumento(false);
    }
  }

  async function handleBaixarDocumento(documento: DocumentoPessoa) {
    try {
      await documentoPessoaService.baixar(documento.id, documento.nomeOriginal);
    } catch (error) {
      showToast("error", extrairMensagemErro(error));
    }
  }

  async function confirmarExclusaoDocumento() {
    if (!documentoParaExcluir) return;
    setExcluindoDocumento(true);
    try {
      await documentoPessoaService.remover(documentoParaExcluir.id);
      setDocumentos((atual) => atual.filter((d) => d.id !== documentoParaExcluir.id));
      showToast("success", "Documento removido.");
      setDocumentoParaExcluir(null);
    } catch (error) {
      showToast("error", extrairMensagemErro(error));
    } finally {
      setExcluindoDocumento(false);
    }
  }

  if (carregando) return <Loading texto="Carregando dados da pessoa..." />;

  return (
    <div>
      <PageHeader titulo={emEdicao ? "Editar pessoa" : "Nova pessoa"} />

      {erro && <Alert mensagem={erro} />}

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="campo campo-largo">
            <label>Foto</label>
            {emEdicao ? (
              <div className="foto-linha">
                {temFoto ? (
                  <ImagemAutenticada src={`/pessoa/${id}/foto`} alt="Foto da pessoa" className="foto-thumbnail" />
                ) : (
                  <span className="campo-ajuda">Nenhuma foto cadastrada ainda.</span>
                )}
                <div className="foto-acoes">
                  <label className="btn btn-secundario btn-sm">
                    {enviandoFoto ? <LoadingInline /> : temFoto ? "Trocar foto" : "Enviar foto"}
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={handleUploadFoto} disabled={enviandoFoto} />
                  </label>
                  {temFoto && (
                    <button type="button" className="btn btn-perigo btn-sm" onClick={() => setRemovendoFotoAberto(true)} disabled={enviandoFoto}>
                      Remover
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <span className="campo-ajuda">Salve a pessoa primeiro para poder adicionar uma foto.</span>
            )}
          </div>

          <div className="campo campo-largo">
            <label htmlFor="nome">Nome *</label>
            <input
              id="nome"
              type="text"
              value={form.nome}
              maxLength={240}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              required
            />
          </div>

          <div className="campo">
            <label htmlFor="tipo">Tipo *</label>
            <select
              id="tipo"
              value={form.tipo}
              onChange={(e) => {
                const novoTipo = Number(e.target.value) as PessoaFormData["tipo"];
                setForm({ ...form, tipo: novoTipo, documento: mascararDocumento(form.documento, novoTipo) });
              }}
            >
              <option value={TIPO_PESSOA_FISICA}>Física</option>
              <option value={TIPO_PESSOA_JURIDICA}>Jurídica</option>
            </select>
          </div>

          <div className="campo">
            <label htmlFor="documento">{form.tipo === TIPO_PESSOA_FISICA ? "CPF *" : "CNPJ *"}</label>
            <input
              id="documento"
              type="text"
              value={form.documento}
              placeholder={form.tipo === TIPO_PESSOA_FISICA ? "000.000.000-00" : "00.000.000/0000-00"}
              maxLength={form.tipo === TIPO_PESSOA_FISICA ? 14 : 18}
              onChange={(e) => setForm({ ...form, documento: mascararDocumento(e.target.value, form.tipo) })}
              required
            />
          </div>

          <div className="campo">
            <label htmlFor="dataNascimento">Data de nascimento</label>
            <input
              id="dataNascimento"
              type="date"
              value={form.dataNascimento ?? ""}
              onChange={(e) => setForm({ ...form, dataNascimento: e.target.value })}
            />
          </div>

          <div className="campo">
            <label htmlFor="telefone">Telefone</label>
            <input
              id="telefone"
              type="text"
              value={form.telefone ?? ""}
              maxLength={50}
              onChange={(e) => setForm({ ...form, telefone: e.target.value })}
            />
          </div>

          <div className="campo">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              value={form.email ?? ""}
              maxLength={100}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="campo campo-largo">
            <label htmlFor="endereco">Endereço</label>
            <input
              id="endereco"
              type="text"
              value={form.endereco ?? ""}
              maxLength={255}
              onChange={(e) => setForm({ ...form, endereco: e.target.value })}
            />
          </div>
        </div>

        <div className="form-acoes">
          <button type="button" className="btn btn-secundario" onClick={() => navigate("/pessoas")} disabled={salvando}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primario" disabled={salvando}>
            {salvando ? <LoadingInline /> : "Salvar"}
          </button>
        </div>
      </form>

      {emEdicao && (
        <div className="form-card">
          <h2 className="membro-detalhe-subtitulo">Documentos</h2>

          <label className="btn btn-secundario btn-sm">
            {enviandoDocumento ? <LoadingInline /> : "+ Enviar documento"}
            <input type="file" accept=".pdf,image/jpeg,image/png,image/webp,image/gif" hidden onChange={handleUploadDocumento} disabled={enviandoDocumento} />
          </label>
          <p className="campo-ajuda">Formatos aceitos: PDF, JPG, JPEG, PNG, WEBP ou GIF.</p>

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
                        <button
                          type="button"
                          className="btn btn-perigo btn-sm btn-icone"
                          title="Excluir"
                          onClick={() => setDocumentoParaExcluir(documento)}
                        >
                          🗑
                        </button>
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
        aberto={removendoFotoAberto}
        titulo="Remover foto"
        mensagem="Tem certeza de que deseja remover a foto desta pessoa?"
        carregando={removendoFoto}
        onCancelar={() => setRemovendoFotoAberto(false)}
        onConfirmar={confirmarRemocaoFoto}
      />

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
