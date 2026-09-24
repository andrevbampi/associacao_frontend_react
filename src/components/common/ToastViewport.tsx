import { useToast } from "../../context/ToastContext";
import "./ToastViewport.css";

const ICONE: Record<string, string> = {
  success: "✓",
  error: "✕",
  info: "ℹ",
};

export function ToastViewport() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-viewport" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <span className="toast-icone">{ICONE[toast.type]}</span>
          <span className="toast-mensagem">{toast.message}</span>
          <button
            type="button"
            className="toast-fechar"
            aria-label="Fechar aviso"
            onClick={() => dismissToast(toast.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
