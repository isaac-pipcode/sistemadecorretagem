import { ListaCarteira, type ItemCarteira } from "@/componentes/lista-carteira";
import {
  hojeIso,
  listarClientes,
  listarConversas,
  listarVendas,
  montarCarteira,
} from "@/lib/dados";

export default async function PaginaCarteira() {
  const hoje = hojeIso();
  const [clientes, vendas, conversas] = await Promise.all([
    listarClientes(),
    listarVendas(),
    listarConversas(),
  ]);

  const ultimaNota = new Map<string, string | null>();
  for (const c of conversas) {
    if (!ultimaNota.has(c.cliente_id)) ultimaNota.set(c.cliente_id, c.nota);
  }

  const itens: ItemCarteira[] = montarCarteira(clientes, vendas, hoje).map(
    (linha) => ({
      id: linha.cliente.id,
      nome: linha.cliente.nome,
      telefone: linha.cliente.telefone,
      segmentos: linha.segmentos,
      cotas: linha.cotas,
      valorTotal: linha.valorTotal,
      ultimoNegocio: linha.ultimoNegocio,
      statusCotas: linha.statusCotas,
      ultimaConversa: linha.cliente.ultima_conversa,
      ultimaNota: ultimaNota.get(linha.cliente.id) ?? null,
      proximaAcao: linha.cliente.proxima_acao,
      proximaAcaoData: linha.cliente.proxima_acao_data,
      indicacoesPedidas: linha.cliente.indicacoes_pedidas ?? 0,
      diasSemContato: linha.diasSemContato,
    }),
  );

  return <ListaCarteira itens={itens} />;
}
