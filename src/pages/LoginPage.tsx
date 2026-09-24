import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Alert } from "../components/common/Alert";
import { LoadingInline } from "../components/common/Loading";
import "./LoginPage.css";

export function LoginPage() {
  const { autenticado, login, mensagemSessao } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [loginInformado, setLoginInformado] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [entrando, setEntrando] = useState(false);

  if (autenticado) {
    const destino = (location.state as { from?: Location })?.from?.pathname ?? "/";
    return <Navigate to={destino} replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErro(null);
    setEntrando(true);
    try {
      await login(loginInformado, senha);
      const destino = (location.state as { from?: Location })?.from?.pathname ?? "/";
      navigate(destino, { replace: true });
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível entrar.");
    } finally {
      setEntrando(false);
    }
  }

  return (
    <div className="login-pagina">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-marca">
          <span className="login-marca-icone">🌿</span>
          <h1>Associação</h1>
        </div>
        <p className="login-subtitulo">Entre com seu login e senha para continuar.</p>

        {mensagemSessao && <Alert tipo="info" mensagem={mensagemSessao} />}
        {erro && <Alert mensagem={erro} />}

        <div className="campo">
          <label htmlFor="login">Login</label>
          <input
            id="login"
            type="text"
            autoComplete="username"
            value={loginInformado}
            onChange={(e) => setLoginInformado(e.target.value)}
            autoFocus
            required
          />
        </div>

        <div className="campo">
          <label htmlFor="senha">Senha</label>
          <input
            id="senha"
            type="password"
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primario login-botao" disabled={entrando}>
          {entrando ? <LoadingInline /> : "Entrar"}
        </button>
      </form>
    </div>
  );
}
