"use client";

import { useEffect } from "react";

type Props = {
  titulo: string;
  aoFechar: () => void;
  children: React.ReactNode;
};

/** Janela que cobre a tela — no celular vira uma página inteira. */
export function Janela({ titulo, aoFechar, children }: Props) {
  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") aoFechar();
    };
    document.addEventListener("keydown", aoTeclar);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = "";
    };
  }, [aoFechar]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
    >
      <div className="flex max-h-dvh w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border-2 border-borda bg-carta sm:rounded-2xl">
        <div className="flex items-center justify-between gap-3 border-b-2 border-borda px-4 py-3">
          <h2 className="text-xl font-black">{titulo}</h2>
          <button
            type="button"
            onClick={aoFechar}
            className="botao-base botao-neutro !min-h-11 !px-3"
          >
            Fechar
          </button>
        </div>
        <div className="overflow-y-auto px-4 py-4">{children}</div>
      </div>
    </div>
  );
}
