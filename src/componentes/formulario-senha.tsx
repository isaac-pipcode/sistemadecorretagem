"use client";

import { useActionState } from "react";

import { Aviso } from "@/componentes/aviso";
import { BotaoEnviar } from "@/componentes/botao-enviar";
import { trocarSenha, type Resultado } from "@/lib/acoes";

export function FormularioSenha() {
  const [resultado, acao] = useActionState<Resultado | null, FormData>(
    trocarSenha,
    null,
  );

  return (
    <form action={acao} className="space-y-4">
      <div>
        <label className="rotulo" htmlFor="senha-nova">
          Senha nova
        </label>
        <input
          id="senha-nova"
          name="senha"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="campo"
        />
      </div>
      <div>
        <label className="rotulo" htmlFor="senha-confirmacao">
          Digite a senha nova de novo
        </label>
        <input
          id="senha-confirmacao"
          name="confirmacao"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="campo"
        />
      </div>

      {resultado ? (
        <Aviso tipo={resultado.ok ? "sucesso" : "erro"}>
          {resultado.mensagem}
        </Aviso>
      ) : null}

      <BotaoEnviar className="botao-base botao-principal w-full text-lg sm:w-auto">
        Trocar senha
      </BotaoEnviar>
    </form>
  );
}
