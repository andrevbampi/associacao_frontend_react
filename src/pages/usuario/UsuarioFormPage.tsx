import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader";
import { Loading, LoadingInline } from "../../components/common/Loading";
import { Alert } from "../../components/common/Alert";
import { usuarioService } from "../../services/usuarioService";
import { pessoaService } from "../../services/pessoaService";
import { extrairMensagemErro } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { usuarioVazio, type UsuarioFormData, type UsuarioRequest } from "../../types/usuario";
import type { Pessoa } from "../../types/pessoa";

export function UsuarioFormPage() {
  const { id } = useParams();
  const emEdicao = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState<UsuarioFormData>(usuarioVazio);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      setErro(null);
      try {
        const listaPessoas = await pessoaService.listar();
        setPessoas(listaPessoas);

        if (emEdicao) {
          const usuarios = await usuarioService.listar();
          const usuario = usuarios.find((u) => u.id === Number(id));
          if (!usuario) {
            setErro("Usuário não encontrado.");
            return;
          }
          setForm({
            id: usuario.id,
            login: usuario.login,
            senha: "",
            idPessoa: usuario.pessoa.id,
            ativo: usuario.ativo,
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

    if (form.idPessoa === "") {
      setErro("Selecione a pessoa vinculada ao usuário.");
      return;
    }

    setSalvando(true);
    const payload: UsuarioRequest = {
      login: form.login,
      senha: form.senha,
      idPessoa: Number(form.idPessoa),
      ativo: form.ativo,
    };

    try {
      if (emEdicao) {
        await usuarioService.atualizar({ ...payload, id: Number(id) });
        showToast("success", "Usuário atualizado com sucesso.");
      } else {
        await usuarioService.criar(payload);
        showToast("success", "Usuário cadastrado com sucesso.");
      }
      navigate("/usuarios");
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) return <Loading texto="Carregando dados do usuário..." />;

  return (
    <div>
      <PageHeader titulo={emEdicao ? "Editar usuário" : "Novo usuário"} />

      {erro && <Alert mensagem={erro} />}

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="campo">
            <label htmlFor="login">Login *</label>
            <input
              id="login"
              type="text"
              value={form.login}
              maxLength={100}
              onChange={(e) => setForm({ ...form, login: e.target.value })}
              required
            />
          </div>

          <div className="campo">
            <label htmlFor="senha">
              Senha {emEdicao ? <span className="campo-ajuda">(deixe em branco para manter a atual)</span> : "*"}
            </label>
            <input
              id="senha"
              type="password"
              value={form.senha}
              autoComplete="new-password"
              onChange={(e) => setForm({ ...form, senha: e.target.value })}
              required={!emEdicao}
            />
          </div>

          <div className="campo campo-largo">
            <label htmlFor="idPessoa">Pessoa *</label>
            <select
              id="idPessoa"
              value={form.idPessoa}
              onChange={(e) => setForm({ ...form, idPessoa: e.target.value ? Number(e.target.value) : "" })}
              required
            >
              <option value="">Selecione uma pessoa...</option>
              {pessoas.map((pessoa) => (
                <option key={pessoa.id} value={pessoa.id}>
                  {pessoa.nome} ({pessoa.documento})
                </option>
              ))}
            </select>
          </div>

          <div className="campo campo-checkbox campo-largo">
            <input
              id="ativo"
              type="checkbox"
              checked={form.ativo}
              onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
            />
            <label htmlFor="ativo">Usuário ativo</label>
          </div>
        </div>

        <div className="form-acoes">
          <button type="button" className="btn btn-secundario" onClick={() => navigate("/usuarios")} disabled={salvando}>
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
