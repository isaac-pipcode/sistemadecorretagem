type Props = {
  titulo: string;
  valor: string;
  detalhe?: string;
  tom?: "normal" | "alerta" | "bom";
};

const TONS = {
  normal: "text-tinta",
  alerta: "text-vermelho",
  bom: "text-verde",
} as const;

/** Cartão de destaque do Painel: rótulo por extenso e número grande. */
export function CartaoNumero({
  titulo,
  valor,
  detalhe,
  tom = "normal",
}: Props) {
  return (
    <div className="carta p-4">
      <p className="text-base font-bold text-tinta-suave">{titulo}</p>
      <p
        className={`numeros mt-1 text-[28px] leading-tight font-black ${TONS[tom]}`}
      >
        {valor}
      </p>
      {detalhe ? (
        <p className="numeros mt-1 text-base text-tinta-suave">{detalhe}</p>
      ) : null}
    </div>
  );
}
