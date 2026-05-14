import Link from "next/link";
import { signOut } from "@/app/auth/actions";
import { joinGroupByCode } from "@/app/actions/groups";
import { requireUser } from "@/lib/auth";
import { getDashboardGroups } from "@/lib/groups";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await requireUser();
  const groups = await getDashboardGroups(user.id);
  const { error } = await searchParams;

  return (
    <main className="min-h-screen bg-[#fff4df] px-6 py-8 text-stone-950 md:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-5 rounded-[2rem] bg-stone-950 p-6 text-orange-50 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.24em] text-orange-300">Panel</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight">Tus sorteos</h1>
          </div>
          <form action={signOut}>
            <button className="rounded-full border border-orange-100/20 px-5 py-3 text-sm font-bold" type="submit">
              Cerrar sesión
            </button>
          </form>
        </header>

        {error ? <p className="rounded-2xl bg-red-100 px-5 py-4 font-semibold text-red-800">{error}</p> : null}

        <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] bg-orange-400 p-6 shadow-xl shadow-orange-500/20">
            <p className="text-sm font-black uppercase tracking-[0.22em]">Crear</p>
            <h2 className="mt-3 text-3xl font-black leading-tight">Organiza un grupo nuevo</h2>
            <p className="mt-4 text-stone-800">Define precio máximo, comparte el código y espera a que todos completen sus sugerencias.</p>
            <Link className="mt-8 inline-flex rounded-full bg-stone-950 px-6 py-3 font-black text-orange-50" href="/groups/new">
              Crear grupo
            </Link>
          </div>

          <form action={joinGroupByCode} className="rounded-[2rem] border border-stone-950/10 bg-white/70 p-6">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-orange-700">Unirse</p>
            <h2 className="mt-3 text-3xl font-black leading-tight">Tengo un código</h2>
            <label className="mt-6 block text-sm font-bold" htmlFor="code">Código del grupo</label>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <input className="min-h-12 flex-1 rounded-2xl border border-stone-950/10 bg-white px-4 font-bold outline-none focus:border-orange-500" id="code" name="code" placeholder="NAVIDAD-8K3P" required />
              <button className="rounded-2xl bg-stone-950 px-6 py-3 font-black text-orange-50" type="submit">Unirme</button>
            </div>
          </form>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-black">Mis grupos</h2>
          {groups.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-stone-950/20 bg-white/50 p-10 text-center">
              <p className="text-lg font-bold">Todavía no participas en ningún grupo.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {groups.map((group) => (
                <Link key={group.id} className="group rounded-[2rem] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl" href={`/groups/${group.id}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-700">{group.status === "drawn" ? "Sorteado" : "Preparando"}</p>
                      <h3 className="mt-3 text-3xl font-black tracking-tight">{group.name}</h3>
                    </div>
                    <span className="rounded-full bg-stone-950 px-3 py-1 text-xs font-black text-orange-50">{group.member_count} pers.</span>
                  </div>
                  <p className="mt-6 font-bold">Máximo {group.max_price.toFixed(2)} €</p>
                  <p className="mt-2 text-sm text-stone-500">Código {group.join_code}</p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
