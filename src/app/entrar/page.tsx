import { FormularioEntrar } from "@/componentes/formulario-entrar";

export default function PaginaEntrar() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-10">
      <h1 className="text-3xl font-black leading-tight text-marca">
        Minhas Vendas
      </h1>
      <p className="mt-1 text-xl font-bold text-tinta-suave">Consórcios</p>

      <div className="carta mt-6 p-5">
        <h2 className="text-2xl font-bold">Entrar</h2>
        <p className="mt-1 text-tinta-suave">
          Use o e-mail e a senha que você recebeu.
        </p>
        <FormularioEntrar />
      </div>
    </main>
  );
}
