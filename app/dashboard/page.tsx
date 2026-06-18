import ClientChat from "@/components/chat/ClientChat";
export default function DashboardPage(){return <main className="min-h-screen bg-slate-950 px-4 py-12 text-white"><h1 className="text-3xl font-black">Личный кабинет</h1><p className="mt-3 text-white/70">Здесь появятся ваши заявки и чат по каждому заказу.</p><ClientChat orderId="demo"/></main>}
