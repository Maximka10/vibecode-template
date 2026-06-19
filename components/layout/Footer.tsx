"use client";
import { Btn } from "@/components/ui/Btn";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-white/10 bg-black/90 py-12 text-center text-white/70">
      <p className="mb-4">Свяжитесь через Telegram для заявки или вопросов</p>
      <Btn href="https://t.me/vibecode_studio" variant="outline" external>
        Написать в Telegram
      </Btn>
      <p className="mt-6 text-sm text-zinc-500">© {new Date().getFullYear()} Vibecode Studio. Все права защищены.</p>
    </footer>
  );
}
