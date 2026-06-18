"use client";
import { Button } from "@/components/ui/Button";

export function Footer() {
  const telegramUsername = process.env.NEXT_PUBLIC_TELEGRAM_USERNAME || '';
  const handleClick = () => {
    window.open(`https://t.me/${telegramUsername}`, "_blank");
  };

  return (
    <footer className="mt-20 border-t border-white/10 bg-black/90 py-12 text-center text-white/70">
      <p className="mb-4">Свяжитесь через Telegram для заявки или вопросов</p>
      <Button onClick={handleClick}>Написать в Telegram</Button>
      <p className="mt-6 text-sm text-zinc-500">© {new Date().getFullYear()} Vibecode Studio. Все права защищены.</p>
    </footer>
  );
}