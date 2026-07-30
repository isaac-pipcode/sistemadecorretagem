"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  compactoSemMoeda,
  nomeMes,
  numero,
  reais,
  reaisCompacto,
} from "@/lib/formato";
import { ORIGENS, SEGMENTOS, type Segmento, type Venda } from "@/lib/tipos";

type Props = {
  vendas: Venda[];
  hoje: string;
  metaMensal: number;
};

const CORES_SEGMENTO: Record<Segmento, string> = {
  Imóveis: "#c4161c",
  Motos: "#344054",
  Serviços: "#b54708",
  Agro: "#067647",
};

/** Faixas de tíquete — mostram em que tamanho de cota ela realmente vende. */
const FAIXAS: { rotulo: string; ate: number }[] = [
  { rotulo: "até R$ 50 mil", ate: 50_000 },
  { rotulo: "R$ 50 a 100 mil", ate: 100_000 },
  { rotulo: "R$ 100 a 200 mil", ate: 200_000 },
  { rotulo: "R$ 200 a 500 mil", ate: 500_000 },
  { rotulo: "acima de R$ 500 mil", ate: Infinity },
];

function somar(vendas: Venda[]): number {
  return vendas.reduce((t, v) => t + v.valor, 0);
}

export function PainelAnalises({ vendas, hoje, metaMensal }: Props) {
  const anoAtual = hoje.slice(0, 4);

  const anos = useMemo(
    () =>
      [...new Set(vendas.map((v) => v.data_venda.slice(0, 4)))].sort((a, b) =>
        b.localeCompare(a),
      ),
    [vendas],
  );

  const [ano, setAno] = useState<string>(
    anos.includes(anoAtual) ? anoAtual : (anos[0] ?? anoAtual),
  );
  const [segmento, setSegmento] = useState<Segmento | "Todos">("Todos");
  const [soConvertidas, setSoConvertidas] = useState(true);

  const filtradas = useMemo(() => {
    return vendas.filter((v) => {
      if (v.status === "Inválida") return false;
      if (soConvertidas && v.status === "Desistiu") return false;
      if (ano !== "Tudo" && v.data_venda.slice(0, 4) !== ano) return false;
      if (segmento !== "Todos" && v.segmento !== segmento) return false;
      return true;
    });
  }, [vendas, ano, segmento, soConvertidas]);

  const total = somar(filtradas);
  const ticket = filtradas.length > 0 ? total / filtradas.length : 0;

  const porSegmento = useMemo(
    () =>
      SEGMENTOS.map((s) => {
        const doSegmento = filtradas.filter((v) => v.segmento === s);
        return {
          nome: s,
          valor: somar(doSegmento),
          cotas: doSegmento.length,
        };
      })
        .filter((d) => d.cotas > 0)
        .sort((a, b) => b.valor - a.valor),
    [filtradas],
  );

  const porOrigem = useMemo(() => {
    const semOrigem = filtradas.filter((v) => !v.origem);
    const linhas = ORIGENS.map((o) => {
      const daOrigem = filtradas.filter((v) => v.origem === o);
      return { nome: o as string, valor: somar(daOrigem), cotas: daOrigem.length };
    });
    if (semOrigem.length > 0) {
      linhas.push({
        nome: "Não anotado",
        valor: somar(semOrigem),
        cotas: semOrigem.length,
      });
    }
    return linhas.filter((d) => d.cotas > 0).sort((a, b) => b.valor - a.valor);
  }, [filtradas]);

  const porMes = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const mes = String(i + 1).padStart(2, "0");
        const doMes = filtradas.filter((v) => v.data_venda.slice(5, 7) === mes);
        return {
          mes: nomeMes(i + 1).slice(0, 3),
          valor: somar(doMes),
          cotas: doMes.length,
        };
      }),
    [filtradas],
  );

  const porFaixa = useMemo(
    () =>
      FAIXAS.map((f, i) => {
        // O piso de cada faixa é o teto da anterior — nada de acumulador,
        // que o compilador do React não deixa reatribuir durante o render.
        const piso = i === 0 ? 0 : FAIXAS[i - 1].ate;
        const naFaixa = filtradas.filter(
          (v) => v.valor > piso && v.valor <= f.ate,
        );
        return { nome: f.rotulo, valor: somar(naFaixa), cotas: naFaixa.length };
      }).filter((d) => d.cotas > 0),
    [filtradas],
  );

  const topClientes = useMemo(() => {
    const mapa = new Map<string, { valor: number; cotas: number }>();
    for (const v of filtradas) {
      const atual = mapa.get(v.nome_cliente) ?? { valor: 0, cotas: 0 };
      mapa.set(v.nome_cliente, {
        valor: atual.valor + v.valor,
        cotas: atual.cotas + 1,
      });
    }
    return [...mapa.entries()]
      .map(([nome, d]) => ({ nome, ...d }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 10);
  }, [filtradas]);

  const topIndicadores = useMemo(() => {
    const mapa = new Map<string, { valor: number; cotas: number }>();
    for (const v of filtradas) {
      const quem = v.indicado_por?.trim();
      if (!quem) continue;
      const atual = mapa.get(quem) ?? { valor: 0, cotas: 0 };
      mapa.set(quem, { valor: atual.valor + v.valor, cotas: atual.cotas + 1 });
    }
    return [...mapa.entries()]
      .map(([nome, d]) => ({ nome, ...d }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 10);
  }, [filtradas]);

  // Projeção: só faz sentido no ano corrente, com meses já vividos.
  const projecao = useMemo(() => {
    if (ano !== anoAtual) return null;
    const mesesCorridos = Number(hoje.slice(5, 7));
    const doAno = filtradas.filter(
      (v) => v.data_venda.slice(0, 4) === anoAtual,
    );
    const realizado = somar(doAno);
    const mediaMensal = realizado / mesesCorridos;
    const restantes = 12 - mesesCorridos;
    return {
      mesesCorridos,
      realizado,
      mediaMensal,
      restantes,
      projetado: realizado + mediaMensal * restantes,
      metaAno: metaMensal * 12,
      precisaPorMes:
        restantes > 0
          ? Math.max(0, (metaMensal * 12 - realizado) / restantes)
          : 0,
    };
  }, [filtradas, ano, anoAtual, hoje, metaMensal]);

  const melhorMes = porMes.reduce(
    (max, m) => (m.valor > max.valor ? m : max),
    porMes[0] ?? { mes: "—", valor: 0, cotas: 0 },
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black text-marca">Análises</h1>

      {/* ── Filtros: mudam todos os quadros de uma vez ─────────────── */}
      <div className="carta space-y-4 p-4">
        <Chips
          rotulo="Ano"
          opcoes={["Tudo", ...anos]}
          valor={ano}
          aoEscolher={setAno}
        />
        <Chips
          rotulo="Segmento"
          opcoes={["Todos", ...SEGMENTOS]}
          valor={segmento}
          aoEscolher={(v) => setSegmento(v as Segmento | "Todos")}
        />
        <div>
          <p className="rotulo">O que entra na conta</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              aria-pressed={soConvertidas}
              onClick={() => setSoConvertidas(true)}
              className={`botao-base !min-h-11 !rounded-full !px-4 ${
                soConvertidas ? "botao-principal" : "botao-neutro"
              }`}
            >
              Só quem ficou
            </button>
            <button
              type="button"
              aria-pressed={!soConvertidas}
              onClick={() => setSoConvertidas(false)}
              className={`botao-base !min-h-11 !rounded-full !px-4 ${
                !soConvertidas ? "botao-principal" : "botao-neutro"
              }`}
            >
              Com as desistências
            </button>
          </div>
          <p className="mt-1.5 text-tinta-suave">
            Vendas marcadas como Inválida nunca entram.
          </p>
        </div>
      </div>

      {/* ── Os quatro números do recorte ───────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Numero rotulo="Vendido" valor={reais(total)} />
        <Numero rotulo="Cotas" valor={numero(filtradas.length)} />
        <Numero rotulo="Tíquete médio" valor={reais(ticket)} />
        <Numero
          rotulo="Melhor mês"
          valor={melhorMes.valor > 0 ? melhorMes.mes : "—"}
          apoio={melhorMes.valor > 0 ? reaisCompacto(melhorMes.valor) : ""}
        />
      </div>

      {projecao ? (
        <div className="carta border-l-6 border-l-marca p-4">
          <h2 className="text-xl font-black text-marca">
            Se o ritmo continuar assim
          </h2>
          <p className="numeros mt-1">
            Em {numero(projecao.mesesCorridos)}{" "}
            {projecao.mesesCorridos === 1 ? "mês" : "meses"} de {anoAtual} você
            vendeu <strong>{reais(projecao.realizado)}</strong> — média de{" "}
            <strong>{reais(projecao.mediaMensal)}</strong> por mês.
          </p>
          <p className="numeros mt-2 text-xl font-black">
            {anoAtual} fecha em {reaisCompacto(projecao.projetado)}
          </p>
          <p className="numeros text-tinta-suave">
            A meta do ano é {reaisCompacto(projecao.metaAno)}.{" "}
            {projecao.restantes > 0
              ? `Para alcançar, faltam ${reais(projecao.precisaPorMes)} por mês nos ${numero(projecao.restantes)} meses que sobram.`
              : "O ano acabou."}
          </p>
        </div>
      ) : null}

      {/* ── Distribuições ──────────────────────────────────────────── */}
      <Quadro
        titulo="Onde está o dinheiro"
        apoio="Quanto cada segmento representa do total do recorte."
      >
        <Barras dados={porSegmento} total={total} cor={(n) => CORES_SEGMENTO[n as Segmento] ?? "#c4161c"} />
      </Quadro>

      <Quadro
        titulo="De onde vêm as vendas"
        apoio="Se a maior fatia for Indicação, pedir indicação é o que mais rende."
      >
        <Barras dados={porOrigem} total={total} cor={() => "#344054"} />
      </Quadro>

      <Quadro
        titulo="Em que tamanho de cota você vende"
        apoio="Uma cota grande vale por várias pequenas — dá para escolher onde gastar o tempo."
      >
        <Barras dados={porFaixa} total={total} cor={() => "#b54708"} />
      </Quadro>

      <Quadro
        titulo="Os meses do ano"
        apoio="Mês forte e mês fraco, para planejar o esforço."
      >
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={porMes} margin={{ top: 8, right: 4, left: 4, bottom: 4 }}>
            <CartesianGrid stroke="#e6dede" vertical={false} />
            <XAxis
              dataKey="mes"
              tick={{ fontSize: 13, fill: "#5a4d4d", fontWeight: 700 }}
              tickLine={false}
              axisLine={{ stroke: "#e6dede" }}
              interval={0}
            />
            <YAxis
              tickFormatter={(v: number) => compactoSemMoeda(v)}
              tick={{ fontSize: 13, fill: "#5a4d4d" }}
              tickLine={false}
              axisLine={false}
              width={58}
            />
            <Tooltip
              cursor={{ fill: "#fdecec" }}
              formatter={(v) => [reais(Number(v ?? 0)), "Vendido"]}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e6dede",
                fontWeight: 700,
              }}
            />
            <Bar
              dataKey="valor"
              fill="#c4161c"
              radius={[6, 6, 0, 0]}
              isAnimationActive={false}
            >
              {porMes.map((m) => (
                <Cell
                  key={m.mes}
                  fill={m.valor === melhorMes.valor && m.valor > 0 ? "#067647" : "#c4161c"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Quadro>

      {/* ── Rankings ───────────────────────────────────────────────── */}
      <Quadro
        titulo="Seus dez maiores clientes"
        apoio="São eles que sustentam o ano — e os primeiros a procurar de novo."
      >
        <Ranking linhas={topClientes} />
      </Quadro>

      <Quadro
        titulo="Quem mais te indica"
        apoio={
          topIndicadores.length > 0
            ? "Vale agradecer — e voltar a pedir."
            : "Ninguém anotado ainda. Preencha “indicado por” ao registrar a venda e este quadro se enche sozinho."
        }
      >
        {topIndicadores.length > 0 ? <Ranking linhas={topIndicadores} /> : null}
      </Quadro>

      {filtradas.length === 0 ? (
        <p className="carta p-5 text-center text-lg font-bold text-tinta-suave">
          Nenhuma venda nesse recorte.
        </p>
      ) : null}
    </div>
  );
}

function Numero({
  rotulo,
  valor,
  apoio,
}: {
  rotulo: string;
  valor: string;
  apoio?: string;
}) {
  return (
    <div className="carta p-3">
      <p className="font-bold text-tinta-suave">{rotulo}</p>
      <p className="numeros text-xl font-black break-words">{valor}</p>
      {apoio ? (
        <p className="numeros font-bold text-tinta-suave">{apoio}</p>
      ) : null}
    </div>
  );
}

function Quadro({
  titulo,
  apoio,
  children,
}: {
  titulo: string;
  apoio?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="carta p-4">
      <h2 className="text-xl font-black text-marca">{titulo}</h2>
      {apoio ? <p className="mb-3 text-tinta-suave">{apoio}</p> : null}
      {children}
    </section>
  );
}

/**
 * Barra deitada com o rótulo por cima — em vez de pizza. No celular a pizza
 * vira um borrão; a barra continua legível e dá para comparar de relance.
 */
function Barras({
  dados,
  total,
  cor,
}: {
  dados: { nome: string; valor: number; cotas: number }[];
  total: number;
  cor: (nome: string) => string;
}) {
  if (dados.length === 0)
    return <p className="text-tinta-suave">Nada por aqui ainda.</p>;

  const maior = Math.max(...dados.map((d) => d.valor), 1);

  return (
    <ul className="space-y-3">
      {dados.map((d) => {
        const fatia = total > 0 ? (d.valor / total) * 100 : 0;
        return (
          <li key={d.nome}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <p className="min-w-0 font-bold">{d.nome}</p>
              <p className="numeros font-bold">
                {reaisCompacto(d.valor)}
                <span className="ml-2 text-tinta-suave">
                  {fatia.toFixed(0)}% · {numero(d.cotas)}{" "}
                  {d.cotas === 1 ? "cota" : "cotas"}
                </span>
              </p>
            </div>
            <div className="mt-1 h-4 overflow-hidden rounded-full bg-fundo ring-1 ring-borda">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.max(2, (d.valor / maior) * 100)}%`,
                  background: cor(d.nome),
                }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function Ranking({
  linhas,
}: {
  linhas: { nome: string; valor: number; cotas: number }[];
}) {
  if (linhas.length === 0)
    return <p className="text-tinta-suave">Nada por aqui ainda.</p>;

  const maior = Math.max(...linhas.map((l) => l.valor), 1);

  return (
    <ol className="space-y-2">
      {linhas.map((l, i) => (
        <li key={l.nome} className="flex items-center gap-3">
          <span className="numeros w-7 shrink-0 text-right text-lg font-black text-tinta-suave">
            {i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <p className="min-w-0 font-bold">{l.nome}</p>
              <p className="numeros font-bold">
                {reaisCompacto(l.valor)}
                <span className="ml-2 text-tinta-suave">
                  {numero(l.cotas)} {l.cotas === 1 ? "cota" : "cotas"}
                </span>
              </p>
            </div>
            <div className="mt-1 h-3 overflow-hidden rounded-full bg-fundo ring-1 ring-borda">
              <div
                className="h-full rounded-full bg-marca"
                style={{ width: `${Math.max(2, (l.valor / maior) * 100)}%` }}
              />
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Chips<T extends string>({
  rotulo,
  opcoes,
  valor,
  aoEscolher,
}: {
  rotulo: string;
  opcoes: readonly T[];
  valor: T;
  aoEscolher: (v: T) => void;
}) {
  return (
    <div>
      <p className="rotulo">{rotulo}</p>
      <div className="flex flex-wrap gap-2">
        {opcoes.map((o) => {
          const ativa = valor === o;
          return (
            <button
              key={o}
              type="button"
              aria-pressed={ativa}
              onClick={() => aoEscolher(o)}
              className={`botao-base !min-h-11 !rounded-full !px-4 ${
                ativa ? "botao-principal" : "botao-neutro"
              }`}
            >
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}
