import { FormularioPerfil } from "@/componentes/formulario-perfil";
import { FormularioSenha } from "@/componentes/formulario-senha";
import { carregarPerfil } from "@/lib/dados";

export default async function PaginaConta() {
  const perfil = await carregarPerfil();

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-black text-marca">Minha conta</h1>

      <div className="carta p-4">
        <p className="font-bold text-tinta-suave">Meu e-mail de acesso</p>
        <p className="text-lg font-black break-words">{perfil?.email}</p>
        <p className="mt-3 text-tinta-suave">
          As vendas, os interessados e a carteira desta tela são só seus.
          Nenhuma outra consultora enxerga o que você anota aqui.
        </p>
      </div>

      <section className="carta p-4">
        <h2 className="text-xl font-black text-marca">Meus dados</h2>
        <p className="text-tinta-suave">
          É o nome que aparece no topo do sistema.
        </p>
        <div className="mt-3">
          <FormularioPerfil
            nome={perfil?.nome ?? ""}
            cidade={perfil?.cidade ?? null}
          />
        </div>
      </section>

      <section className="carta p-4">
        <h2 className="text-xl font-black text-marca">Trocar a senha</h2>
        <p className="text-tinta-suave">
          Escolha uma senha com 8 letras ou números, no mínimo. Anote em um
          lugar seguro.
        </p>
        <div className="mt-3">
          <FormularioSenha />
        </div>
      </section>
    </div>
  );
}
