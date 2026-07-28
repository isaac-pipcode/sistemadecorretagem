"use client";

import { useActionState } from "react";

import { entrar, type Resultado } from "@/lib/acoes";
import { BotaoEnviar } from "@/componentes/botao-enviar";
import { Aviso } from "@/componentes/aviso";

export function FormularioEntrar() {
  const [resultado, acao] = useActionState<Resultado | null, FormData>(
    entrar,
    null,
  );

  return (
    <form action={acao} className="mt-5 space-y-4">
      <div>
        <label className="rotulo" htmlFor="email">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          inputMode="email"
          required
          className="campo"
          placeholder="seu@email.com"
        />
      </div>

      <div>
        <label className="rotulo" htmlFor="senha">
          Senha
        </label>
        <input
          id="senha"
          name="senha"
          type="password"
          autoComplete="current-password"
          required
          className="campo"
          placeholder="••••••••"
        />
      </div>

      {resultado && !resultado.ok ? (
        <Aviso tipo="erro">{resultado.mensagem}</Aviso>
      ) : null}

      <BotaoEnviar className="botao-base botao-principal w-full text-xl">
        Entrar
      </BotaoEnviar>
    </form>
  );
}
