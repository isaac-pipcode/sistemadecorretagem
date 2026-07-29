"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import { compactoSemMoeda, mesCurto, reaisCompacto } from "@/lib/formato";

type Props = {
  dados: { mes: string; valor: number }[];
  meta: number;
};

type PropsRotulo = {
  x?: number | string;
  y?: number | string;
  width?: number | string;
  value?: number | string;
};

/** Rótulo em cima da barra. Escrito à mão porque o padrão do Recharts
    quebra "R$ 1,1 mi" em duas linhas quando a barra é estreita. */
function RotuloAcima(props: unknown) {
  const { x, y, width, value } = props as PropsRotulo;
  const numero = Number(value ?? 0);
  if (numero <= 0) return null;
  return (
    <text
      x={Number(x) + Number(width) / 2}
      y={Number(y) - 8}
      textAnchor="middle"
      fontSize={15}
      fontWeight={700}
      fill="#1a1414"
    >
      {compactoSemMoeda(numero)}
    </text>
  );
}

/** Valor vendido mês a mês, com a linha da meta atravessando o gráfico. */
export function GraficoMeses({ dados, meta }: Props) {
  const pontos = dados.map((d) => ({ ...d, rotulo: mesCurto(d.mes) }));
  const maior = Math.max(meta, ...pontos.map((p) => p.valor));

  return (
    <div>
      <p className="mb-1 font-bold text-tinta-suave lg:hidden">
        Arraste o gráfico para o lado para ver os outros meses →
      </p>
      <div className="overflow-x-auto">
        <div style={{ minWidth: Math.max(560, pontos.length * 64) }}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={pontos}
              margin={{ top: 26, right: 12, left: 4, bottom: 4 }}
              barCategoryGap="18%"
            >
              <CartesianGrid stroke="#e6dede" vertical={false} />
              <XAxis
                dataKey="rotulo"
                tick={{ fontSize: 15, fill: "#1a1414", fontWeight: 700 }}
                tickLine={false}
                axisLine={{ stroke: "#e6dede" }}
                interval={0}
              />
              <YAxis
                domain={[0, Math.ceil((maior * 1.15) / 250000) * 250000]}
                tickFormatter={(v: number) => reaisCompacto(v)}
                tick={{ fontSize: 15, fill: "#5a4d4d" }}
                tickLine={false}
                axisLine={false}
                width={80}
              />
              <ReferenceLine
                y={meta}
                stroke="#344054"
                strokeWidth={3}
                strokeDasharray="8 6"
                label={{
                  value: `Meta ${reaisCompacto(meta)}`,
                  position: "insideTopLeft",
                  fill: "#344054",
                  fontSize: 15,
                  fontWeight: 700,
                }}
              />
              <Bar
                dataKey="valor"
                fill="#c4161c"
                radius={[6, 6, 0, 0]}
                isAnimationActive={false}
              >
                <LabelList dataKey="valor" content={RotuloAcima} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
