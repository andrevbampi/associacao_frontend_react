/**
 * Máscara e validação de CPF/CNPJ no front-end, para dar feedback imediato.
 * A validação definitiva (que não pode ser burlada) é sempre a do back-end
 * (DocumentoValidador.java), que usa exatamente o mesmo algoritmo.
 *
 * O CNPJ segue o novo padrão alfanumérico da Receita Federal: os 12
 * primeiros caracteres podem ser dígitos ou letras maiúsculas; os 2 últimos
 * continuam sendo dígitos verificadores numéricos.
 */

export function mascararCpf(valor: string): string {
  const digitos = valor.replace(/\D/g, "").slice(0, 11);
  return digitos
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function mascararCnpj(valor: string): string {
  const caracteres = valor
    .toUpperCase()
    .replace(/[^0-9A-Z]/g, "")
    .slice(0, 14);

  const base = caracteres.slice(0, 12);
  const digitosVerificadores = caracteres.slice(12, 14);

  let resultado = base
    .replace(/([0-9A-Z]{2})([0-9A-Z])/, "$1.$2")
    .replace(/([0-9A-Z]{3})([0-9A-Z])/, "$1.$2")
    .replace(/([0-9A-Z]{3})([0-9A-Z]{1,4})$/, "$1/$2");

  if (digitosVerificadores) {
    resultado += `-${digitosVerificadores}`;
  }
  return resultado;
}

export function mascararDocumento(valor: string, tipo: 1 | 2): string {
  return tipo === 1 ? mascararCpf(valor) : mascararCnpj(valor);
}

const PESOS_CPF_1 = [10, 9, 8, 7, 6, 5, 4, 3, 2];
const PESOS_CPF_2 = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
const PESOS_CNPJ_1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const PESOS_CNPJ_2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

function digitoVerificador(valores: number[], quantidade: number, pesos: number[]): number {
  let soma = 0;
  for (let i = 0; i < quantidade; i++) {
    soma += valores[i] * pesos[i];
  }
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

export function validarCpf(cpf: string): boolean {
  const limpo = cpf.replace(/\D/g, "");
  if (limpo.length !== 11 || /^(\d)\1{10}$/.test(limpo)) return false;

  const digitos = limpo.split("").map(Number);
  return digitoVerificador(digitos, 9, PESOS_CPF_1) === digitos[9] && digitoVerificador(digitos, 10, PESOS_CPF_2) === digitos[10];
}

export function validarCnpj(cnpj: string): boolean {
  const limpo = cnpj.toUpperCase().replace(/[^0-9A-Z]/g, "");
  if (limpo.length !== 14 || !/^[0-9A-Z]{12}[0-9]{2}$/.test(limpo) || /^(.)\1{13}$/.test(limpo)) return false;

  const valores = limpo.split("").map((c) => c.charCodeAt(0) - 48);
  return digitoVerificador(valores, 12, PESOS_CNPJ_1) === valores[12] && digitoVerificador(valores, 13, PESOS_CNPJ_2) === valores[13];
}

export function validarDocumento(documento: string, tipo: 1 | 2): boolean {
  return tipo === 1 ? validarCpf(documento) : validarCnpj(documento);
}
