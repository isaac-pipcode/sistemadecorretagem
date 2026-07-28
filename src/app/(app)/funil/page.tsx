import { QuadroFunil } from "@/componentes/quadro-funil";
import { hojeIso, listarLeads, taxaDeConversao } from "@/lib/dados";

export default async function PaginaFunil() {
  const hoje = hojeIso();
  const leads = await listarLeads();
  const conversao = taxaDeConversao(leads, hoje);

  return <QuadroFunil leads={leads} hoje={hoje} conversao={conversao} />;
}
