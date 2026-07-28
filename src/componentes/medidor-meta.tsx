import { numero, reais } from "@/lib/formato";

type Props = {
  valor: number;
  meta: number;
  cotas: number;
};

/** Barra de progresso da meta do mês — aparece em todas as abas. */
export function MedidorMeta({ valor, meta, cotas }: Props) {
  const percentual = meta > 0 ? (valor / meta) * 100 : 0;
  const largura = Math.min(100, Math.max(0, percentual));
  const bateu = valor >= meta;

  return (
    <div className="mt-2">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <p className="text-base font-bold">
          Meta do mês:{" "}
          <span className="numeros text-tinta-suave">{reais(meta)}</span>
        </p>
        <p className="numeros text-base font-bold">
          {numero(cotas)} {cotas === 1 ? "cota" : "cotas"}
        </p>
      </div>

      <div
        className="mt-1 h-7 w-full overflow-hidden rounded-full border-2 border-borda bg-fundo"
        role="progressbar"
        aria-valuenow={Math.round(percentual)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Quanto já vendi da meta do mês"
      >
        <div
          className={`h-full ${bateu ? "bg-verde" : "bg-marca"}`}
          style={{ width: `${largura}%` }}
        />
      </div>

      <p className="numeros mt-1 text-lg font-black">
        {reais(valor)}{" "}
        <span
          className={`font-bold ${bateu ? "text-verde" : "text-tinta-suave"}`}
        >
          ({percentual.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}%
          da meta)
        </span>
      </p>
    </div>
  );
}
