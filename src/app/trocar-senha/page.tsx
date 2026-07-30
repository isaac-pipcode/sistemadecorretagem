import { FormularioPrimeiraSenha } from "@/componentes/formulario-primeira-senha";
import { Marca } from "@/componentes/marca";
import { carregarPerfil } from "@/lib/dados";

export default async function PaginaTrocarSenha() {
  const perfil = await carregarPerfil();
  const primeiroNome = perfil?.nome.split(" ")[0] ?? "";

  return (
    <main className="flex min-h-dvh flex-col lg:flex-row">
      <div className="faixa-marca relative flex flex-col justify-center overflow-hidden px-6 py-12 lg:w-1/2 lg:px-16">
        <span
          aria-hidden
          className="absolute top-6 left-6 h-16 w-16 rounded-tl-3xl border-t-8 border-l-8 border-white/70"
        />
        <span
          aria-hidden
          className="absolute right-6 bottom-6 h-16 w-16 rounded-br-3xl border-r-8 border-b-8 border-white/70"
        />

        <div className="relative">
          <Marca tamanho="grande" />
          <p className="mt-10 max-w-md text-[34px] leading-[1.1] font-black text-white lg:text-[44px]">
            Bem-vinda
            {primeiroNome ? (
              <>
                ,<br />
                <span className="text-white/70">{primeiroNome}.</span>
              </>
            ) : (
              "."
            )}
          </p>
          <p className="mt-6 max-w-md text-xl leading-snug font-bold text-white/90">
            Falta um passo: escolher uma senha que só você saiba. A que veio no
            e-mail era temporária.
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-10 lg:px-10">
        <div className="w-full max-w-md">
          <div className="carta p-6">
            <h1 className="text-2xl font-black text-marca">Crie sua senha</h1>
            <p className="mt-1 text-tinta-suave">
              No mínimo 8 letras ou números. Anote em um lugar seguro — é com
              ela que você entra daqui para a frente.
            </p>
            <FormularioPrimeiraSenha />
          </div>
        </div>
      </div>
    </main>
  );
}
