export const FUSO = "America/Sao_Paulo";

const MOEDA = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
});

const MOEDA_CURTA = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

/** R$ 1.234.567,89 */
export function reais(valor: number | string | null | undefined): string {
  return MOEDA.format(Number(valor ?? 0));
}

/** R$ 1.234.568 — para eixos e rótulos de gráfico */
export function reaisCurto(valor: number | string | null | undefined): string {
  return MOEDA_CURTA.format(Number(valor ?? 0));
}

/** R$ 1,2 mi — só onde o espaço é curto mesmo (eixo do gráfico no celular) */
export function reaisCompacto(valor: number): string {
  if (Math.abs(valor) >= 1_000_000) {
    return `R$ ${(valor / 1_000_000).toLocaleString("pt-BR", {
      maximumFractionDigits: 1,
    })} mi`;
  }
  if (Math.abs(valor) >= 1_000) {
    return `R$ ${(valor / 1_000).toLocaleString("pt-BR", {
      maximumFractionDigits: 0,
    })} mil`;
  }
  return reaisCurto(valor);
}

/** "1,5 mi" / "363 mil" — para caber sobre barras estreitas do gráfico. */
export function compactoSemMoeda(valor: number): string {
  if (Math.abs(valor) >= 1_000_000) {
    return `${(valor / 1_000_000).toLocaleString("pt-BR", {
      maximumFractionDigits: 1,
    })} mi`;
  }
  if (Math.abs(valor) >= 1_000) {
    return `${(valor / 1_000).toLocaleString("pt-BR", {
      maximumFractionDigits: 0,
    })} mil`;
  }
  return numero(valor);
}

export function numero(valor: number | string | null | undefined): string {
  return Number(valor ?? 0).toLocaleString("pt-BR");
}

/** "2025-11-29" → "29/11/2025". Não usa Date para não escorregar de fuso. */
export function dataBr(iso: string | null | undefined): string {
  if (!iso) return "—";
  const [ano, mes, dia] = iso.slice(0, 10).split("-");
  if (!ano || !mes || !dia) return "—";
  return `${dia}/${mes}/${ano}`;
}

/** "29/11/2025" → "2025-11-29" (aceita também já em ISO) */
export function brParaIso(texto: string): string | null {
  const limpo = texto.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(limpo)) return limpo;
  const m = limpo.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  return `${m[3]}-${m[2]}-${m[1]}`;
}

const MESES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

const MESES_CURTOS = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

export function nomeMes(mes1a12: number): string {
  return MESES[mes1a12 - 1] ?? "";
}

/** "2025-11" → "nov/25" */
export function mesCurto(anoMes: string): string {
  const [ano, mes] = anoMes.split("-");
  return `${MESES_CURTOS[Number(mes) - 1]}/${ano.slice(2)}`;
}

/** Data de hoje em São Paulo, no formato "AAAA-MM-DD". */
export function hojeIso(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Constrói uma data "neutra" (meio-dia UTC) a partir de "AAAA-MM-DD". */
function comoData(iso: string): Date {
  const [a, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d, 12));
}

export function isoDeData(data: Date): string {
  return data.toISOString().slice(0, 10);
}

/** Diferença em dias inteiros entre duas datas ISO (b − a). */
export function diasEntre(a: string, b: string): number {
  const ms = comoData(b).getTime() - comoData(a).getTime();
  return Math.round(ms / 86_400_000);
}

export function somarDias(iso: string, dias: number): string {
  const d = comoData(iso);
  d.setUTCDate(d.getUTCDate() + dias);
  return isoDeData(d);
}

/** Segunda-feira da semana da data informada (semana começa na segunda). */
export function segundaDaSemana(iso: string): string {
  const d = comoData(iso);
  const diaSemana = d.getUTCDay(); // 0 = domingo
  const recuo = diaSemana === 0 ? 6 : diaSemana - 1;
  return somarDias(iso, -recuo);
}

/** "2025-11-24" → "24/11 a 30/11" */
export function faixaDaSemana(segundaIso: string): string {
  const fim = somarDias(segundaIso, 6);
  return `${dataBr(segundaIso).slice(0, 5)} a ${dataBr(fim).slice(0, 5)}`;
}

/** Lista dos "AAAA-MM" dos últimos `n` meses, terminando no mês de `ateIso`. */
export function ultimosMeses(ateIso: string, n: number): string[] {
  const [ano, mes] = ateIso.slice(0, 7).split("-").map(Number);
  const lista: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const total = ano * 12 + (mes - 1) - i;
    const a = Math.floor(total / 12);
    const m = (total % 12) + 1;
    lista.push(`${a}-${String(m).padStart(2, "0")}`);
  }
  return lista;
}

/** Só os dígitos de um telefone. */
export function digitos(texto: string | null | undefined): string {
  return (texto ?? "").replace(/\D/g, "");
}

/** (19) 99999-9999 */
export function telefoneBr(texto: string | null | undefined): string {
  const d = digitos(texto);
  if (d.length === 11)
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10)
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return texto ?? "";
}

/** Link do WhatsApp: https://wa.me/55DDDNÚMERO */
export function linkWhatsapp(
  telefone: string | null | undefined,
): string | null {
  const d = digitos(telefone);
  if (d.length < 10) return null;
  const comPais = d.startsWith("55") ? d : `55${d}`;
  return `https://wa.me/${comPais}`;
}

/** "1.234,56" ou "R$ 1.234,56" → 1234.56 */
export function moedaParaNumero(texto: string): number {
  const limpo = (texto ?? "").replace(/[^\d,.-]/g, "");
  if (!limpo) return 0;
  const semMilhar = limpo.replace(/\./g, "").replace(",", ".");
  const n = Number(semMilhar);
  return Number.isFinite(n) ? n : 0;
}
