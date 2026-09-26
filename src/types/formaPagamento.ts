export type FormaPagamento = "DINHEIRO" | "PIX" | "CARTAO" | "TRANSFERENCIA" | "OUTRO";

export const FORMA_PAGAMENTO_LABEL: Record<FormaPagamento, string> = {
  DINHEIRO: "Dinheiro",
  PIX: "Pix",
  CARTAO: "Cartão",
  TRANSFERENCIA: "Transferência",
  OUTRO: "Outro",
};

export const FORMAS_PAGAMENTO: FormaPagamento[] = ["DINHEIRO", "PIX", "CARTAO", "TRANSFERENCIA", "OUTRO"];
