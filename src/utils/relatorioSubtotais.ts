import type { RelatorioConsumoProdutoLinha } from "../types/relatorio";

export type NivelSubtotal = "mes" | "pessoa" | "produto";

export interface LinhaExibicaoDado {
  tipo: "dado";
  linha: RelatorioConsumoProdutoLinha;
}

export interface LinhaExibicaoSubtotal {
  tipo: "subtotal";
  nivel: NivelSubtotal;
  profundidade: number;
  rotulo: string;
  quantidadeTotal: number;
  valorTotal: number;
}

export type LinhaExibicao = LinhaExibicaoDado | LinhaExibicaoSubtotal;

type NivelChave = "mes" | "pessoa" | "produto" | "status";

const ROTULO_NIVEL: Record<NivelSubtotal, string> = {
  mes: "Subtotal do mês",
  pessoa: "Subtotal da pessoa",
  produto: "Subtotal do produto",
};

function chaveDoNivel(linha: RelatorioConsumoProdutoLinha, nivel: NivelChave): string {
  switch (nivel) {
    case "mes":
      return linha.mes ?? "";
    case "pessoa":
      return linha.pessoa ?? "";
    case "produto":
      return String(linha.idProduto);
    case "status":
      return linha.status ?? "";
  }
}

function rotuloDoNivel(linha: RelatorioConsumoProdutoLinha, nivel: NivelSubtotal): string {
  switch (nivel) {
    case "mes":
      return linha.mes ?? "(sem mês)";
    case "pessoa":
      return linha.pessoa ?? "(sem pessoa)";
    case "produto":
      return linha.produto;
  }
}

/**
 * Insere uma linha de subtotal ao final de cada grupo, em cada nível de
 * agrupamento ativo — exceto o nível mais interno, que já É a granularidade
 * das próprias linhas (um subtotal dele seria idêntico à linha).
 *
 * A prioridade dos níveis é sempre mês > pessoa > produto > status (mesma do
 * back-end, que já devolve as linhas ordenadas nessa ordem). Como Produto
 * está sempre presente, ele só vira um nível de subtotal quando existe algo
 * mais interno que ele — ou seja, quando "Status da comanda" está marcado.
 */
export function montarLinhasComSubtotais(
  linhas: RelatorioConsumoProdutoLinha[],
  agruparPorMes: boolean,
  agruparPorPessoa: boolean,
  agruparPorStatus: boolean
): LinhaExibicao[] {
  const niveis: NivelChave[] = [];
  if (agruparPorMes) niveis.push("mes");
  if (agruparPorPessoa) niveis.push("pessoa");
  niveis.push("produto");
  if (agruparPorStatus) niveis.push("status");

  const niveisComSubtotal = niveis.slice(0, -1) as NivelSubtotal[];

  if (niveisComSubtotal.length === 0) {
    return linhas.map((linha) => ({ tipo: "dado", linha }));
  }

  interface Acumulador {
    rotulo: string;
    quantidade: number;
    valor: number;
  }
  const acumuladores = new Map<NivelSubtotal, Acumulador>();
  niveisComSubtotal.forEach((nivel) => acumuladores.set(nivel, { rotulo: "", quantidade: 0, valor: 0 }));

  const resultado: LinhaExibicao[] = [];
  let chavesAnteriores: string[] | null = null;

  function fecharNivel(indiceNivel: number) {
    const nivel = niveis[indiceNivel] as NivelSubtotal;
    const acumulador = acumuladores.get(nivel);
    if (!acumulador) return;
    resultado.push({
      tipo: "subtotal",
      nivel,
      profundidade: indiceNivel,
      rotulo: `${ROTULO_NIVEL[nivel]}: ${acumulador.rotulo}`,
      quantidadeTotal: acumulador.quantidade,
      valorTotal: acumulador.valor,
    });
    acumulador.rotulo = "";
    acumulador.quantidade = 0;
    acumulador.valor = 0;
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
      // Fecha do nível mais interno até o primeiro nível que mudou (nunca o
      // último nível da lista, que não tem subtotal).
      for (let i = niveis.length - 2; i >= indiceDivergencia; i--) {
        fecharNivel(i);
      }
    }

    resultado.push({ tipo: "dado", linha });

    niveisComSubtotal.forEach((nivel) => {
      const acumulador = acumuladores.get(nivel);
      if (!acumulador) return;
      acumulador.rotulo = rotuloDoNivel(linha, nivel);
      acumulador.quantidade += linha.quantidadeTotal;
      acumulador.valor += linha.valorTotal;
    });

    chavesAnteriores = chavesAtuais;
  });

  for (let i = niveis.length - 2; i >= 0; i--) {
    fecharNivel(i);
  }

  return resultado;
}
