/**
 * Ponte simples entre o axios (fora de componentes React) e o AuthContext:
 * quando qualquer requisição autenticada volta com 401 (token ausente,
 * expirado ou inválido), o interceptor de api.ts chama emitUnauthorized().
 * O AuthProvider escuta esse evento para encerrar a sessão e mostrar um
 * aviso amigável na tela de login.
 */
type Listener = () => void;

let listeners: Listener[] = [];

export function onUnauthorized(listener: Listener): () => void {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

export function emitUnauthorized(): void {
  listeners.forEach((listener) => listener());
}
