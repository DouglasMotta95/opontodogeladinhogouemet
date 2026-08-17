export function brl(value: number | string | null | undefined) {
  const n = typeof value === "string" ? Number(value) : (value ?? 0);
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    Number.isFinite(n) ? n : 0,
  );
}

export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function maskPhone(value: string) {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export const ORDER_STATUS_LABEL: Record<string, string> = {
  received: "Pedido recebido",
  confirmed: "Pedido confirmado",
  preparing: "Em preparação",
  out_for_delivery: "Saiu para entrega",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

export const PAYMENT_STATUS_LABEL: Record<string, string> = {
  pending: "Aguardando pagamento",
  approved: "Pagamento aprovado",
  rejected: "Pagamento recusado",
  in_process: "Pagamento pendente",
  cancelled: "Pagamento cancelado",
  refunded: "Pagamento estornado",
  not_required: "Pagamento na entrega",
};

export const PAYMENT_METHOD_LABEL: Record<string, string> = {
  pix: "Pix",
  online_card: "Cartão online",
  cash: "Dinheiro na entrega",
  card_on_delivery: "Cartão na entrega",
};

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}
