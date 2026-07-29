import { numero, reais } from "@/lib/formato";

type Props = {
  valor: number;
  meta: number;
  cotas: number;
};

/**
 * Medidor da meta do mês — o número mais importante do sistema.
 * Fica em cima da faixa azul do cabeçalho, em todas as abas.
 */
export function MedidorMeta({ valor, meta, cotas }: Props) {
  const percentual = meta > 0 ? (valor / meta) * 100 : 0;
  const largura = Math.min(100, Math.max(0, percentual));
  const bateu = valor >= meta;
  const faltam = Math.max(0, meta - valor);

  return (
    <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/20 backdrop-blur-sm sm:p-4">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
        <div>
          <p className="text-base font-bold text-white/80">Vendido neste mês</p>
          <p className="numeros text-[28px] leading-none font-black text-white sm:text-[36px]">
            {reais(valor)}
          </p>
        </div>
        <p
          className={`numeros shrink-0 rounded-full px-3 py-1 text-lg font-black ${
            bateu ? "bg-verde text-white" : "bg-white text-marca"
          }`}
        >
          {percentual.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}% da
          meta
        </p>
      </div>

      <div
        className="mt-2 h-4 w-full overflow-hidden rounded-full bg-white/25"
        role="progressbar"
        aria-valuenow={Math.round(percentual)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Quanto já vendi da meta do mês"
      >
        <div
          className={`h-full rounded-full ${bateu ? "bg-verde" : "bg-white"}`}
          style={{ width: `${largura}%` }}
        />
      </div>

      <p className="numeros mt-2 text-base font-bold text-white/85">
        {numero(cotas)} {cotas === 1 ? "cota" : "cotas"} ·{" "}
        {bateu
          ? "meta do mês batida!"
          : `faltam ${reais(faltam)} para a meta`}
      </p>
    </div>
  );
}
