"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

type Props = {
  dados: { semana: string; contatos: number; propostas: number }[];
};

/** Contatos e propostas das últimas 12 semanas. */
export function GraficoSemanas({ dados }: Props) {
  return (
    <div>
      <p className="mb-1 font-bold text-tinta-suave lg:hidden">
        Arraste o gráfico para o lado para ver as outras semanas →
      </p>
      <div className="overflow-x-auto">
        <div style={{ minWidth: Math.max(560, dados.length * 64) }}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={dados}
              margin={{ top: 24, right: 8, left: 0, bottom: 4 }}
            >
              <CartesianGrid stroke="#e6dede" vertical={false} />
              <XAxis
                dataKey="semana"
                tick={{ fontSize: 15, fill: "#1a1414", fontWeight: 700 }}
                tickLine={false}
                axisLine={{ stroke: "#e6dede" }}
                interval={0}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 15, fill: "#5a4d4d" }}
                tickLine={false}
                axisLine={false}
                width={36}
              />
              <Legend
                verticalAlign="top"
                height={32}
                formatter={(valor) => (
                  <span
                    style={{ fontSize: 17, fontWeight: 700, color: "#1a1414" }}
                  >
                    {valor}
                  </span>
                )}
              />
              <Bar
                dataKey="contatos"
                name="Contatos"
                fill="#c4161c"
                radius={[6, 6, 0, 0]}
                isAnimationActive={false}
              >
                <LabelList
                  dataKey="contatos"
                  position="top"
                  formatter={(v) => (Number(v) > 0 ? String(v) : "")}
                  style={{ fontSize: 15, fontWeight: 700, fill: "#1a1414" }}
                />
              </Bar>
              <Bar
                dataKey="propostas"
                name="Propostas"
                fill="#344054"
                radius={[6, 6, 0, 0]}
                isAnimationActive={false}
              >
                <LabelList
                  dataKey="propostas"
                  position="top"
                  formatter={(v) => (Number(v) > 0 ? String(v) : "")}
                  style={{ fontSize: 15, fontWeight: 700, fill: "#1a1414" }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
