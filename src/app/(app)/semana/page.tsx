import { ContadorSemana } from "@/componentes/contador-semana";
import { FormularioSemana } from "@/componentes/formulario-semana";
import { GraficoSemanas } from "@/componentes/grafico-semanas";
import {
  carregarMetas,
  hojeIso,
  listarSemanas,
  listarVendas,
  ultimasSemanas,
  vendasDaSemana,
} from "@/lib/dados";
import { faixaDaSemana, numero, reais, segundaDaSemana } from "@/lib/formato";

export default async function PaginaSemana() {
  const hoje = hojeIso();
  const segunda = segundaDaSemana(hoje);

  const [semanas, vendas, { metasSemanais }] = await Promise.all([
    listarSemanas(),
    listarVendas(),
    carregarMetas(),
  ]);

  const porSemana = new Map(semanas.map((s) => [s.semana_inicio, s]));
  const atual = porSemana.get(segunda);
  const contatos = atual?.contatos ?? 0;
  const reunioes = atual?.reunioes ?? 0;
  const propostas = atual?.propostas ?? 0;
  const vendasSemana = vendasDaSemana(vendas, segunda);

  const historico = ultimasSemanas(hoje, 12).map((inicio) => {
    const registro = porSemana.get(inicio);
    return {
      semana: faixaDaSemana(inicio).slice(0, 5),
      contatos: registro?.contatos ?? 0,
      propostas: registro?.propostas ?? 0,
    };
  });

  const bateuTudo =
    contatos >= metasSemanais.contatos &&
    reunioes >= metasSemanais.reunioes &&
    propostas >= metasSemanais.propostas;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black">Minha semana</h1>
        <p className="numeros text-lg font-bold text-tinta-suave">
          Semana de {faixaDaSemana(segunda)} (começa na segunda-feira)
        </p>
      </div>

      {bateuTudo ? (
        <p className="carta border-verde bg-verde-claro p-4 text-lg font-black text-verde">
          Você bateu os três alvos desta semana. Parabéns!
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <ContadorSemana
          campo="contatos"
          rotulo="Contatos novos"
          feito={contatos}
          alvo={metasSemanais.contatos}
          semanaInicio={segunda}
        />
        <ContadorSemana
          campo="reunioes"
          rotulo="Reuniões"
          feito={reunioes}
          alvo={metasSemanais.reunioes}
          semanaInicio={segunda}
        />
        <ContadorSemana
          campo="propostas"
          rotulo="Propostas"
          feito={propostas}
          alvo={metasSemanais.propostas}
          semanaInicio={segunda}
        />
      </div>

      <div className="carta bg-marca-clara p-4">
        <p className="text-lg font-bold">Vendas desta semana</p>
        <p className="numeros text-[34px] leading-tight font-black">
          {reais(vendasSemana.valor)}
        </p>
        <p className="numeros font-bold text-tinta-suave">
          {numero(vendasSemana.quantidade)}{" "}
          {vendasSemana.quantidade === 1 ? "cota" : "cotas"} — contadas sozinhas
          a partir da aba Vendas.
        </p>
      </div>

      <section className="carta p-4">
        <h2 className="text-xl font-black">Corrigir os números na mão</h2>
        <p className="text-tinta-suave">
          Use quando esquecer de apertar o +1 durante o dia.
        </p>
        <div className="mt-3">
          <FormularioSemana
            semanaInicio={segunda}
            contatos={contatos}
            reunioes={reunioes}
            propostas={propostas}
          />
        </div>
      </section>

      <section className="carta p-4">
        <h2 className="text-xl font-black">Últimas 12 semanas</h2>
        <p className="text-tinta-suave">
          Alvos por semana: {metasSemanais.contatos} contatos,{" "}
          {metasSemanais.reunioes} reuniões e {metasSemanais.propostas}{" "}
          propostas.
        </p>
        <div className="mt-3">
          <GraficoSemanas dados={historico} />
        </div>
      </section>
    </div>
  );
}
