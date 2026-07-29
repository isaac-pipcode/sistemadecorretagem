type Props = {
  /** "claro" = sobre a faixa vermelha; "escuro" = sobre fundo branco. */
  tom?: "claro" | "escuro";
  tamanho?: "normal" | "grande";
};

/** Selo quadrado com o telhado — mesma ideia do símbolo da Ademicon. */
function Selo({ claro, lado }: { claro: boolean; lado: number }) {
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center rounded-[22%] ${
        claro ? "bg-white" : "bg-marca"
      }`}
      style={{ width: lado, height: lado }}
    >
      <svg
        viewBox="0 0 48 48"
        width={lado * 0.62}
        height={lado * 0.62}
        fill="none"
        stroke={claro ? "#c4161c" : "#ffffff"}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 22 24 8l18 14" />
        <path d="M11 26v12h26V26" />
      </svg>
    </span>
  );
}

/**
 * Lockup da marca: selo + nome do sistema + assinatura da Ademicon.
 * O selo é uma versão simplificada do símbolo; quando o arquivo oficial
 * estiver à mão, troque <Selo /> por <img src="/ademicon.svg" alt="" />.
 */
export function Marca({ tom = "claro", tamanho = "normal" }: Props) {
  const claro = tom === "claro";
  const grande = tamanho === "grande";

  return (
    <span className="flex items-center gap-3">
      <Selo claro={claro} lado={grande ? 56 : 42} />
      <span className="min-w-0 leading-tight">
        <span
          className={`block font-black tracking-tight ${
            grande ? "text-3xl" : "text-lg sm:text-xl"
          } ${claro ? "text-white" : "text-marca"}`}
        >
          Minhas Vendas
        </span>
        <span
          className={`block font-bold tracking-[0.16em] uppercase ${
            grande ? "text-lg" : "text-base"
          } ${claro ? "text-white/85" : "text-tinta-suave"}`}
        >
          Ademicon
        </span>
      </span>
    </span>
  );
}
