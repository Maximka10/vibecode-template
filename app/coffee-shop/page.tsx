"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { templates } from "@/content/templates";
import { Button } from "@/components/ui/Button";

export default function CustomizePage() {
  const params = useParams();
  const template = templates.find((t) => t.id === params.templateId);

  if (!template) return <p className="text-white p-8">Шаблон не найден</p>;

  // Состояния для кастомизации
  const [businessName, setBusinessName] = useState(template.content.heroTitle);
  const [subtitle, setSubtitle] = useState(template.content.heroSubtitle);
  const [services, setServices] = useState(template.content.services);
  const [telegramUsername, setTelegramUsername] = useState("");

  // Изменение сервисов
  const updateService = (index: number, key: "title" | "description", value: string) => {
    const newServices = [...services];
    newServices[index][key] = value;
    setServices(newServices);
  };

  // Отправка заявки в Telegram
  const handleSubmit = () => {
    const message = encodeURIComponent(
      `Новая заявка на шаблон: ${template.name}\n` +
      `Название бизнеса: ${businessName}\n` +
      `Подзаголовок: ${subtitle}\n` +
      `Сервисы:\n${services.map(s => `- ${s.title}: ${s.description}`).join("\n")}`
    );
    const url = `https://t.me/${telegramUsername}?text=${message}`;
    window.open(url, "_blank");
  };

  return (
    <div className="px-6 py-16 bg-black text-white max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">Кастомизация: {template.name}</h1>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Форма */}
        <div>
          <label className="block mb-4">
            Название бизнеса:
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-white/10 bg-white/5 p-2 text-black"
            />
          </label>

          <label className="block mb-4">
            Подзаголовок:
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-white/10 bg-white/5 p-2 text-black"
            />
          </label>

          <label className="block mb-4">
            Telegram username:
            <input
              type="text"
              value={telegramUsername}
              onChange={(e) => setTelegramUsername(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-white/10 bg-white/5 p-2 text-black"
            />
          </label>

          <h2 className="text-xl font-semibold mt-6 mb-2">Сервисы</h2>
          {services.map((service, i) => (
            <div key={i} className="mb-4">
              <input
                type="text"
                value={service.title}
                onChange={(e) => updateService(i, "title", e.target.value)}
                placeholder="Название сервиса"
                className="mb-1 block w-full rounded-lg border border-white/10 bg-white/5 p-2 text-black"
              />
              <input
                type="text"
                value={service.description}
                onChange={(e) => updateService(i, "description", e.target.value)}
                placeholder="Описание сервиса"
                className="block w-full rounded-lg border border-white/10 bg-white/5 p-2 text-black"
              />
            </div>
          ))}

          <Button onClick={handleSubmit} className="mt-4">
            Отправить заявку
          </Button>
        </div>

        {/* Live preview */}
        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
          <h2 className="text-2xl font-bold mb-2">{businessName}</h2>
          <p className="text-zinc-400 mb-6">{subtitle}</p>

          <div className="grid gap-4 md:grid-cols-2">
            {services.map((s, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                <h3 className="font-semibold text-white">{s.title}</h3>
                <p className="text-zinc-400">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}