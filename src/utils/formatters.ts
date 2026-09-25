export function formatarData(data: string | null | undefined): string {
  if (!data) return "-";
  const [ano, mes, dia] = data.split("-");
  if (!ano || !mes || !dia) return data;
  return `${dia}/${mes}/${ano}`;
}

export function paraDataInput(data: string | null | undefined): string {
  if (!data) return "";
  return data.substring(0, 10);
}

/** "2026-09-25T14:26:24" -> "25/09/2026 14:26" */
export function formatarDataHora(data: string | null | undefined): string {
  if (!data) return "-";
  const [parteData, parteHora] = data.split("T");
  const dataFormatada = formatarData(parteData);
  if (!parteHora) return dataFormatada;
  return `${dataFormatada} ${parteHora.substring(0, 5)}`;
}

/** ISO "2026-09-25T14:33:00" -> valor aceito por <input type="datetime-local"> */
export function paraDataHoraInput(data: string | null | undefined): string {
  if (!data) return "";
  return data.substring(0, 16);
}

export function formatarMoeda(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return "-";
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
