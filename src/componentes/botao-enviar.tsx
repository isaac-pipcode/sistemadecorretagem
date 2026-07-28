"use client";

import { useFormStatus } from "react-dom";

type Props = {
  children: React.ReactNode;
  className?: string;
  textoEnviando?: string;
  formAction?: (formData: FormData) => void | Promise<void>;
  title?: string;
};

/** Botão de formulário que se desabilita e avisa enquanto salva. */
export function BotaoEnviar({
  children,
  className = "botao-base botao-principal",
  textoEnviando = "Salvando…",
  formAction,
  title,
}: Props) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      formAction={formAction}
      title={title}
      disabled={pending}
      className={`${className} disabled:opacity-60`}
    >
      {pending ? textoEnviando : children}
    </button>
  );
}
