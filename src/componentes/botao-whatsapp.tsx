import { linkWhatsapp } from "@/lib/formato";

type Props = {
  telefone: string | null | undefined;
  rotulo?: string;
  className?: string;
};

/** Abre a conversa no WhatsApp. Some quando não há telefone anotado. */
export function BotaoWhatsapp({
  telefone,
  rotulo = "Abrir WhatsApp",
  className = "botao-base botao-secundario",
}: Props) {
  const link = linkWhatsapp(telefone);
  if (!link) return null;

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {rotulo}
    </a>
  );
}
