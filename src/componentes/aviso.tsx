type Props = {
  tipo: "erro" | "sucesso" | "atencao";
  children: React.ReactNode;
};

const ESTILOS = {
  erro: "bg-vermelho-claro text-vermelho border-vermelho",
  sucesso: "bg-verde-claro text-verde border-verde",
  atencao: "bg-ambar-claro text-ambar border-ambar",
} as const;

export function Aviso({ tipo, children }: Props) {
  return (
    <p
      role={tipo === "erro" ? "alert" : "status"}
      className={`rounded-xl border-2 px-4 py-3 font-bold ${ESTILOS[tipo]}`}
    >
      {children}
    </p>
  );
}
