import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader";
import { Loading } from "../../components/common/Loading";
import { Alert } from "../../components/common/Alert";
import { LoadingInline } from "../../components/common/Loading";
import { pessoaService } from "../../services/pessoaService";
import { extrairMensagemErro } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { pessoaVazia, TIPO_PESSOA_FISICA, TIPO_PESSOA_JURIDICA, type PessoaFormData } from "../../types/pessoa";
import { paraDataInput } from "../../utils/formatters";
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

  if (carregando) return <Loading texto="Carregando dados da pessoa..." />;

  return (
    <div>
      <PageHeader titulo={emEdicao ? "Editar pessoa" : "Nova pessoa"} />

      {erro && <Alert mensagem={erro} />}

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
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
    </div>
  );
}
