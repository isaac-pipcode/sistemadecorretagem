import { FormularioSenha } from "@/componentes/formulario-senha";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export default async function PaginaConta() {
  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-black text-marca">Minha conta</h1>

      <div className="carta p-4">
        <p className="font-bold text-tinta-suave">Meu e-mail de acesso</p>
        <p className="text-lg font-black break-words">{user?.email}</p>
      </div>

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
