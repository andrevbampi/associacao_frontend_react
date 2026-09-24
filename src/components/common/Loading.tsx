import "./Loading.css";

export function Loading({ texto = "Carregando..." }: { texto?: string }) {
  return (
    <div className="loading-container">
      <div className="loading-spinner" aria-hidden="true" />
      <span>{texto}</span>
    </div>
  );
}

export function LoadingInline() {
  return <span className="loading-spinner loading-spinner-sm" aria-hidden="true" />;
}
