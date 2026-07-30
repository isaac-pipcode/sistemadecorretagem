"use client";

import { useActionState } from "react";

import { Aviso } from "@/componentes/aviso";
import { BotaoEnviar } from "@/componentes/botao-enviar";
import { definirPrimeiraSenha, type Resultado } from "@/lib/acoes";

export function FormularioPrimeiraSenha() {
  const [resultado, acao] = useActionState<Resultado | null, FormData>(
    definirPrimeiraSenha,
    null,
  );

  return (
    <form action={acao} className="mt-5 space-y-4">
      <div>
        <label className="rotulo" htmlFor="senha">
          Sua senha nova
        </label>
        <input
          id="senha"
          name="senha"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="campo"
          placeholder="••••••••"
        />
      </div>
      <div>
        <label className="rotulo" htmlFor="confirmacao">
          Digite a senha nova de novo
        </label>
        <input
          id="confirmacao"
          name="confirmacao"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="campo"
          placeholder="••••••••"
        />
      </div>

      {resultado ? (
        <Aviso tipo={resultado.ok ? "sucesso" : "erro"}>
          {resultado.mensagem}
        </Aviso>
      ) : null}

      <BotaoEnviar className="botao-base botao-principal w-full text-xl">
        Salvar e entrar
      </BotaoEnviar>
    </form>
  );
}
