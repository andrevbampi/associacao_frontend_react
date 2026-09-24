import "./Alert.css";

export function Alert({ tipo = "error", mensagem }: { tipo?: "error" | "info"; mensagem: string }) {
  return (
    <div className={`alert alert-${tipo}`} role="alert">
      {mensagem}
    </div>
  );
}
