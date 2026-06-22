"use client";
export default function AdminError({error}:{error:Error}){return <main className="bg-slate-950 p-6 text-red-200"><h1>Ошибка админ-панели</h1><pre>{error.message}</pre></main>}
