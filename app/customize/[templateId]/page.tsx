"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { getTemplateById } from "@/lib/templates/getTemplateById";
import type { CustomizationState, TemplateService } from "@/types/template";

type CustomizePageProps = {
  params: {
    templateId: string;
  };
};

export default function CustomizePage({ params }: CustomizePageProps) {
  const template = useMemo(() => getTemplateById(params.templateId), [params.templateId]);

  if (!template) {
    return (
      <div className="px-6 py-16 bg-black text-white max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold">Шаблон не найден</h1>
        <p className="mt-3 text-zinc-400">
          Проверьте ссылку или выберите другой шаблон в разделе «Выберите шаблон».
        </p>
      </div>
    );
  }

  const [customization, setCustomization] = useState<CustomizationState>({
    businessName: template.content.heroTitle,
    subtitle: template.content.heroSubtitle,
    services: template.content.services,
    telegramUsername: "",
  });

  /**
   * Isolated field updater keeps form handlers short and readable.
   */
  const updateField = <K extends keyof CustomizationState>(key: K, value: CustomizationState[K]) => {
    setCustomization((prev) => ({ ...prev, [key]: value }));
  };

  const updateService = (index: number, key: keyof TemplateService, value: string) => {
    setCustomization((prev) => {
      const newServices = prev.services.map((service, serviceIndex) =>
        serviceIndex === index ? { ...service, [key]: value } : service
      );
      return { ...prev, services: newServices };
    });
  };

  const handleSubmit = () => {
    const message = encodeURIComponent(
      `Новая заявка на шаблон: ${template.name}\n` +
        `Название бизнеса: ${customization.businessName}\n` +
        `Подзаголовок: ${customization.subtitle}\n` +
        `Сервисы:\n${customization.services.map((s) => `- ${s.title}: ${s.description}`).join("\n")}`
    );
    const url = `https://t.me/${customization.telegramUsername}?text=${message}`;
    window.open(url, "_blank");
  };

  return (
    <div className="px-6 py-16 bg-black text-white max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">Кастомизация: {template.name}</h1>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div>
          <label className="block mb-4">
            Название бизнеса:
            <input
              type="text"
              value={customization.businessName}
              onChange={(e) => updateField("businessName", e.target.value)}
              className="mt-1 block w-full rounded-lg border border-white/10 bg-white/5 p-2 text-black"
            />
          </label>

          <label className="block mb-4">
            Подзаголовок:
            <input
              type="text"
              value={customization.subtitle}
              onChange={(e) => updateField("subtitle", e.target.value)}
              className="mt-1 block w-full rounded-lg border border-white/10 bg-white/5 p-2 text-black"
            />
          </label>

          <label className="block mb-4">
            Telegram username:
            <input
              type="text"
              value={customization.telegramUsername}
              onChange={(e) => updateField("telegramUsername", e.target.value)}
              className="mt-1 block w-full rounded-lg border border-white/10 bg-white/5 p-2 text-black"
            />
          </label>

          <h2 className="text-xl font-semibold mt-6 mb-2">Сервисы</h2>
          {customization.services.map((service, i) => (
            <div key={`${service.title}-${i}`} className="mb-4">
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

          <Button onClick={handleSubmit}>Отправить заявку</Button>
        </div>

        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
          <h2 className="text-2xl font-bold mb-2">{customization.businessName}</h2>
          <p className="text-zinc-400 mb-6">{customization.subtitle}</p>

          <div className="grid gap-4 md:grid-cols-2">
            {customization.services.map((service, i) => (
              <div key={`${service.title}-preview-${i}`} className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                <h3 className="font-semibold text-white">{service.title}</h3>
                <p className="text-zinc-400">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
