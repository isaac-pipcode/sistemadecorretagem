import { PainelAnalises } from "@/componentes/painel-analises";
import { carregarMetas, hojeIso, listarVendas } from "@/lib/dados";

export default async function PaginaAnalises() {
  const [vendas, { metaMensal }] = await Promise.all([
    listarVendas(),
    carregarMetas(),
  ]);

  // `hoje` vem do servidor: se o navegador calculasse, a projeção mudaria
  // conforme o fuso de quem abre a tela.
  return (
    <PainelAnalises vendas={vendas} hoje={hojeIso()} metaMensal={metaMensal} />
  );
}
