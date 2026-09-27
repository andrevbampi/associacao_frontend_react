import type { RelatorioLivroCaixaLinha } from "../types/relatorio";

export type NivelSubtotalCaixa = "caixa" | "mes";

export interface LinhaExibicaoDadoCaixa {
  tipo: "dado";
  linha: RelatorioLivroCaixaLinha;
}

export interface LinhaExibicaoSubtotalCaixa {
  tipo: "subtotal";
  nivel: NivelSubtotalCaixa;
  profundidade: number;
  rotulo: string;
  valorEntrada: number;
  valorSaida: number;
}

export type LinhaExibicaoCaixa = LinhaExibicaoDadoCaixa | LinhaExibicaoSubtotalCaixa;

const ROTULO_NIVEL: Record<NivelSubtotalCaixa, string> = {
  caixa: "Subtotal do caixa",
  mes: "Subtotal do mês",
};

function chaveDoNivel(linha: RelatorioLivroCaixaLinha, nivel: NivelSubtotalCaixa): string {
  return nivel === "caixa" ? linha.caixa ?? "" : linha.mes ?? "";
}

function rotuloDoNivel(linha: RelatorioLivroCaixaLinha, nivel: NivelSubtotalCaixa): string {
  if (nivel === "caixa") return linha.caixa ?? "(sem caixa)";
  return linha.mes ?? "(sem mês)";
}

/**
 * Mesmo algoritmo de "control break" do relatório de consumo de produtos
 * (utils/relatorioSubtotais.ts), mas aqui os dois níveis (Caixa, Mês) sempre
 * recebem subtotal quando ativos — diferente do outro relatório, as linhas
 * deste (lançamentos individuais + linhas resumidas de comandas/mensalidades)
 * não são "uma por combinação de nível", então não existe um nível mais
 * interno redundante a excluir.
 */
export function montarLinhasComSubtotaisLivroCaixa(
  linhas: RelatorioLivroCaixaLinha[],
  agruparPorCaixa: boolean,
  agruparPorMes: boolean
): LinhaExibicaoCaixa[] {
  const niveis: NivelSubtotalCaixa[] = [];
  if (agruparPorCaixa) niveis.push("caixa");
  if (agruparPorMes) niveis.push("mes");

  if (niveis.length === 0) {
    return linhas.map((linha) => ({ tipo: "dado", linha }));
  }

  interface Acumulador {
    rotulo: string;
    entrada: number;
    saida: number;
  }
  const acumuladores = new Map<NivelSubtotalCaixa, Acumulador>();
  niveis.forEach((nivel) => acumuladores.set(nivel, { rotulo: "", entrada: 0, saida: 0 }));

  const resultado: LinhaExibicaoCaixa[] = [];
  let chavesAnteriores: string[] | null = null;

  function fecharNivel(indiceNivel: number) {
    const nivel = niveis[indiceNivel];
    const acumulador = acumuladores.get(nivel);
    if (!acumulador) return;
    resultado.push({
      tipo: "subtotal",
      nivel,
      profundidade: indiceNivel,
      rotulo: `${ROTULO_NIVEL[nivel]}: ${acumulador.rotulo}`,
      valorEntrada: acumulador.entrada,
      valorSaida: acumulador.saida,
    });
    acumulador.rotulo = "";
    acumulador.entrada = 0;
    acumulador.saida = 0;
  }

  linhas.forEach((linha) => {
    const chavesAtuais = niveis.map((nivel) => chaveDoNivel(linha, nivel));

    if (chavesAnteriores) {
      let indiceDivergencia = niveis.length;
      for (let i = 0; i < niveis.length; i++) {
        if (chavesAnteriores[i] !== chavesAtuais[i]) {
          indiceDivergencia = i;
          break;
        }
      }
      for (let i = niveis.length - 1; i >= indiceDivergencia; i--) {
        fecharNivel(i);
      }
    }

    resultado.push({ tipo: "dado", linha });

    niveis.forEach((nivel) => {
      const acumulador = acumuladores.get(nivel);
      if (!acumulador) return;
      acumulador.rotulo = rotuloDoNivel(linha, nivel);
      acumulador.entrada += linha.valorEntrada;
      acumulador.saida += linha.valorSaida;
    });

    chavesAnteriores = chavesAtuais;
  });

  for (let i = niveis.length - 1; i >= 0; i--) {
    fecharNivel(i);
  }

  return resultado;
}
