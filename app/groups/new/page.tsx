import Link from "next/link";
import { createGroup } from "@/app/actions/groups";
import { requireUser } from "@/lib/auth";

export default async function NewGroupPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireUser();
  const { error } = await searchParams;

  return (
    <main className="min-h-screen bg-[#fff4df] px-6 py-8 text-stone-950 md:px-10">
      <div className="mx-auto max-w-3xl">
        <Link className="font-bold text-orange-700" href="/dashboard">← Volver</Link>
        <div className="mt-8 rounded-[2rem] bg-white p-6 shadow-xl shadow-orange-900/5 md:p-10">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-orange-700">Nuevo grupo</p>
          <h1 className="mt-3 text-5xl font-black tracking-tight">Prepara el sorteo</h1>
          {error ? <p className="mt-5 rounded-2xl bg-red-100 px-5 py-4 font-semibold text-red-800">{error}</p> : null}
          <form action={createGroup} className="mt-8 space-y-5">
            <div>
              <label className="text-sm font-bold" htmlFor="name">Nombre</label>
              <input className="mt-2 min-h-12 w-full rounded-2xl border border-stone-950/10 bg-orange-50 px-4 outline-none focus:border-orange-500" id="name" name="name" placeholder="Navidad familia 2026" required />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="text-sm font-bold" htmlFor="maxPrice">Precio máximo</label>
                <input className="mt-2 min-h-12 w-full rounded-2xl border border-stone-950/10 bg-orange-50 px-4 outline-none focus:border-orange-500" id="maxPrice" name="maxPrice" min="1" step="0.01" type="number" placeholder="25" required />
              </div>
              <div>
                <label className="text-sm font-bold" htmlFor="exchangeDate">Fecha opcional</label>
                <input className="mt-2 min-h-12 w-full rounded-2xl border border-stone-950/10 bg-orange-50 px-4 outline-none focus:border-orange-500" id="exchangeDate" name="exchangeDate" type="date" />
              </div>
            </div>
            <div>
              <label className="text-sm font-bold" htmlFor="message">Mensaje para el grupo</label>
              <textarea className="mt-2 min-h-28 w-full rounded-2xl border border-stone-950/10 bg-orange-50 px-4 py-3 outline-none focus:border-orange-500" id="message" name="message" placeholder="Nada de tarjetas regalo, por favor." />
            </div>
            <div>
              <label className="text-sm font-bold" htmlFor="giftSuggestions">Tus sugerencias</label>
              <textarea className="mt-2 min-h-32 w-full rounded-2xl border border-stone-950/10 bg-orange-50 px-4 py-3 outline-none focus:border-orange-500" id="giftSuggestions" name="giftSuggestions" placeholder="Libros, café de especialidad, plantas..." />
            </div>
            <button className="w-full rounded-full bg-stone-950 px-6 py-4 font-black text-orange-50" type="submit">Crear grupo</button>
          </form>
        </div>
      </div>
    </main>
  );
}
