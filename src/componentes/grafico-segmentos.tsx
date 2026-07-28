"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import { reaisCompacto } from "@/lib/formato";
import type { Segmento } from "@/lib/tipos";

type Props = {
  dados: { segmento: Segmento; valor: number; cotas: number }[];
};

const CORES: Record<Segmento, string> = {
  Imóveis: "#123a6b",
  Motos: "#10643a",
  Serviços: "#8a5200",
  Agro: "#6b3fa0",
};

type PropsRotulo = {
  x?: number | string;
  y?: number | string;
  width?: number | string;
  height?: number | string;
  value?: number | string;
};

function RotuloDireita(props: unknown) {
  const { x, y, width, height, value } = props as PropsRotulo;
  return (
    <text
      x={Number(x) + Number(width) + 8}
      y={Number(y) + Number(height) / 2}
      dominantBaseline="middle"
      fontSize={15}
      fontWeight={700}
      fill="#14161a"
    >
      {reaisCompacto(Number(value ?? 0))}
    </text>
  );
}

/** Barras deitadas: no celular ficam bem mais legíveis que uma pizza. */
export function GraficoSegmentos({ dados }: Props) {
  const maior = Math.max(1, ...dados.map((d) => d.valor));

  return (
    <ResponsiveContainer width="100%" height={230}>
      <BarChart
        data={dados}
        layout="vertical"
        margin={{ top: 4, right: 78, left: 0, bottom: 4 }}
      >
        <CartesianGrid stroke="#d6d2ca" horizontal={false} />
        <XAxis type="number" domain={[0, maior * 1.15]} hide />
        <YAxis
          type="category"
          dataKey="segmento"
          width={92}
          tick={{ fontSize: 17, fill: "#14161a", fontWeight: 700 }}
          tickLine={false}
          axisLine={{ stroke: "#d6d2ca" }}
        />
        <Bar
          dataKey="valor"
          radius={[0, 6, 6, 0]}
          barSize={30}
          minPointSize={3}
          isAnimationActive={false}
        >
          {dados.map((d) => (
            <Cell key={d.segmento} fill={CORES[d.segmento]} />
          ))}
          {/* Rótulo desenhado à mão: o padrão do Recharts quebra a linha
              no meio de "R$ 820 mil" quando a barra é estreita. */}
          <LabelList dataKey="valor" content={RotuloDireita} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
