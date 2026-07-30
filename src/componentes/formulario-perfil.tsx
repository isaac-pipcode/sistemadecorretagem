"use client";

import { useActionState } from "react";

import { Aviso } from "@/componentes/aviso";
import { BotaoEnviar } from "@/componentes/botao-enviar";
import { salvarPerfil, type Resultado } from "@/lib/acoes";

type Props = {
  nome: string;
  cidade: string | null;
};

export function FormularioPerfil({ nome, cidade }: Props) {
  const [resultado, acao] = useActionState<Resultado | null, FormData>(
    salvarPerfil,
    null,
  );

  return (
    <form action={acao} className="space-y-4">
      <div>
        <label className="rotulo" htmlFor="perfil-nome">
          Meu nome
        </label>
        <input
          id="perfil-nome"
          name="nome"
          type="text"
          autoComplete="name"
          required
          minLength={2}
          defaultValue={nome}
          className="campo"
        />
      </div>
      <div>
        <label className="rotulo" htmlFor="perfil-cidade">
          Minha cidade
        </label>
        <input
          id="perfil-cidade"
          name="cidade"
          type="text"
          defaultValue={cidade ?? ""}
          className="campo"
          placeholder="São João da Boa Vista"
        />
      </div>

      {resultado ? (
        <Aviso tipo={resultado.ok ? "sucesso" : "erro"}>
          {resultado.mensagem}
        </Aviso>
      ) : null}

      <BotaoEnviar className="botao-base botao-principal w-full text-lg sm:w-auto">
        Salvar
      </BotaoEnviar>
    </form>
  );
}
