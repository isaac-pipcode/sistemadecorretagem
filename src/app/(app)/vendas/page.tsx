import { TabelaVendas } from "@/componentes/tabela-vendas";
import { listarVendas } from "@/lib/dados";

export default async function PaginaVendas() {
  const vendas = await listarVendas();
  const anos = [...new Set(vendas.map((v) => v.data_venda.slice(0, 4)))].sort(
    (a, b) => b.localeCompare(a),
  );

  return <TabelaVendas vendas={vendas} anos={anos} />;
}
