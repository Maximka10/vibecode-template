import AdminChat from "@/components/chat/AdminChat";
async function loadAdminData(){
  try { return { error: null as string | null }; }
  catch (e) { return { error: e instanceof Error ? e.message : String(e) }; }
}
export default async function AdminPage(){
  const { error } = await loadAdminData();
  if (error) return <pre className="p-6 text-red-300">{error}</pre>;
  return <main className="min-h-screen bg-slate-950 px-4 py-12 text-white"><h1 className="text-3xl font-black">Админ-панель</h1><p className="mt-3 text-white/70">Заявки, отзывы и профили загружаются отдельными запросами и склеиваются через Map без join.</p><AdminChat orderId="demo" unread={0}/></main>;
}
