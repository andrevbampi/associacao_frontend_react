import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../components/common/PageHeader";
import { LoadingInline } from "../components/common/Loading";
import { Alert } from "../components/common/Alert";
import { authService } from "../services/authService";
import { extrairMensagemErro } from "../services/api";
import { useToast } from "../context/ToastContext";

const TAMANHO_MINIMO = 6;

export function AlterarSenhaPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErro(null);

    if (novaSenha.length < TAMANHO_MINIMO) {
      setErro(`A nova senha deve ter pelo menos ${TAMANHO_MINIMO} caracteres.`);
      return;
    }
    if (novaSenha !== confirmacao) {
      setErro("A confirmação não confere com a nova senha.");
      return;
    }
    if (novaSenha === senhaAtual) {
      setErro("A nova senha deve ser diferente da senha atual.");
      return;
    }

    setSalvando(true);
    try {
      await authService.alterarSenha(senhaAtual, novaSenha);
      showToast("success", "Senha alterada com sucesso.");
      navigate("/");
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div>
      <PageHeader titulo="Alterar minha senha" subtitulo="Informe a senha atual e escolha uma nova senha." />

      {erro && <Alert mensagem={erro} />}

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="campo campo-largo">
            <label htmlFor="senhaAtual">Senha atual *</label>
            <input
              id="senhaAtual"
              type="password"
              autoComplete="current-password"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              required
            />
          </div>
          <div className="campo">
            <label htmlFor="novaSenha">Nova senha *</label>
            <input
              id="novaSenha"
              type="password"
              autoComplete="new-password"
              value={novaSenha}
              minLength={TAMANHO_MINIMO}
              onChange={(e) => setNovaSenha(e.target.value)}
              required
            />
            <span className="campo-ajuda">Mínimo de {TAMANHO_MINIMO} caracteres.</span>
          </div>
          <div className="campo">
            <label htmlFor="confirmacao">Confirmar nova senha *</label>
            <input
              id="confirmacao"
              type="password"
              autoComplete="new-password"
              value={confirmacao}
              onChange={(e) => setConfirmacao(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-acoes">
          <button type="button" className="btn btn-secundario" onClick={() => navigate("/")} disabled={salvando}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primario" disabled={salvando}>
            {salvando ? <LoadingInline /> : "Alterar senha"}
          </button>
        </div>
      </form>
    </div>
  );
}
