import { ListaLeads, type ItemLead } from "@/componentes/lista-leads";
import {
  hojeIso,
  listarClientes,
  listarLeads,
  listarVendas,
  montarDiretorio,
} from "@/lib/dados";

export default async function PaginaLeads() {
  const hoje = hojeIso();
  const [clientes, vendas, leads] = await Promise.all([
    listarClientes(),
    listarVendas(),
    listarLeads(),
  ]);

  const itens: ItemLead[] = montarDiretorio(clientes, vendas, leads, hoje).map(
    (linha) => ({
      id: linha.cliente.id,
      nome: linha.cliente.nome,
      telefone: linha.cliente.telefone,
      segmentos: linha.segmentos,
      cotas: linha.cotas,
      valorTotal: linha.valorTotal,
      valorEstimado: linha.valorEstimado,
      situacao: linha.situacao,
      temperatura: linha.temperatura,
      diasSemContato: linha.diasSemContato,
      ultimoContato: linha.ultimoContato,
      etapa: linha.etapa,
      motivoPerda: linha.motivoPerda,
    }),
  );

  return <ListaLeads itens={itens} />;
}
