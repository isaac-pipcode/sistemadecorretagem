type Props = {
  titulo: string;
  valor: string;
  detalhe?: string;
  tom?: "normal" | "alerta" | "bom";
};

const RAIL = {
  normal: "border-l-grafite",
  alerta: "border-l-marca",
  bom: "border-l-verde",
} as const;

const NUMERO = {
  normal: "text-tinta",
  alerta: "text-marca",
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
    <div className={`carta-destacada p-4 ${RAIL[tom]}`}>
      <p className="text-base font-bold text-tinta-suave">{titulo}</p>
      <p
        className={`numeros mt-1 text-[30px] leading-tight font-black ${NUMERO[tom]}`}
      >
        {valor}
      </p>
      {detalhe ? (
        <p className="numeros mt-1 text-base text-tinta-suave">{detalhe}</p>
      ) : null}
    </div>
  );
}
