import { LoadingInline } from "./Loading";
import "./ConfirmDialog.css";

interface ConfirmDialogProps {
  aberto: boolean;
  titulo: string;
  mensagem: string;
  carregando?: boolean;
  textoConfirmar?: string;
  textoCancelar?: string;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export function ConfirmDialog({
  aberto,
  titulo,
  mensagem,
  carregando = false,
  textoConfirmar = "Excluir",
  textoCancelar = "Cancelar",
  onConfirmar,
  onCancelar,
}: ConfirmDialogProps) {
  if (!aberto) return null;

  return (
    <div className="dialog-overlay" role="dialog" aria-modal="true" aria-labelledby="dialog-titulo">
      <div className="dialog-caixa">
        <h2 id="dialog-titulo">{titulo}</h2>
        <p>{mensagem}</p>
        <div className="dialog-acoes">
          <button type="button" className="btn btn-secundario" onClick={onCancelar} disabled={carregando}>
            {textoCancelar}
          </button>
          <button type="button" className="btn btn-perigo" onClick={onConfirmar} disabled={carregando}>
            {carregando ? <LoadingInline /> : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
