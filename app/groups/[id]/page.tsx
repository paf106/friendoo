import Link from "next/link";
import { runDraw, updateGiftSuggestions } from "@/app/actions/groups";
import { CopyButton } from "@/components/copy-button";
import { requireUser } from "@/lib/auth";
import { getGroupForUser } from "@/lib/groups";

export default async function GroupPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const { error, saved } = await searchParams;
  const { group, members, currentMember, assignment } = await getGroupForUser(id, user.id);
  const isOwner = group.owner_id === user.id;
  const joinUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/join/${group.join_code}`;

  return (
    <main className="min-h-screen bg-[#fff4df] px-6 py-8 text-stone-950 md:px-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <Link className="font-bold text-orange-700" href="/dashboard">← Dashboard</Link>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2.5rem] bg-stone-950 p-8 text-orange-50 shadow-2xl shadow-orange-900/10">
            <p className="text-sm font-black uppercase tracking-[0.24em] text-orange-300">{group.status === "drawn" ? "Sorteo realizado" : "Grupo abierto"}</p>
            <h1 className="mt-4 text-5xl font-black leading-none tracking-tight md:text-7xl">{group.name}</h1>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl bg-white/8 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-orange-200">Precio</p>
                <p className="mt-2 text-2xl font-black">{group.max_price.toFixed(2)} €</p>
              </div>
              <div className="rounded-3xl bg-white/8 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-orange-200">Personas</p>
                <p className="mt-2 text-2xl font-black">{members.length}</p>
              </div>
              <div className="rounded-3xl bg-white/8 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-orange-200">Fecha</p>
                <p className="mt-2 text-2xl font-black">{group.exchange_date ?? "Libre"}</p>
              </div>
            </div>
            {group.message ? <p className="mt-6 rounded-3xl bg-orange-100 p-5 font-semibold text-stone-950">{group.message}</p> : null}
          </div>

          <aside className="space-y-5">
            {error ? <p className="rounded-2xl bg-red-100 px-5 py-4 font-semibold text-red-800">{error}</p> : null}
            {saved ? <p className="rounded-2xl bg-green-100 px-5 py-4 font-semibold text-green-800">Sugerencias guardadas.</p> : null}

            {group.status === "draft" ? (
              <div className="rounded-[2rem] bg-orange-400 p-6">
                <p className="text-sm font-black uppercase tracking-[0.22em]">Código compartible</p>
                <p className="mt-4 rounded-2xl bg-orange-100 px-4 py-3 text-3xl font-black tracking-tight">{group.join_code}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <CopyButton value={group.join_code} label="Copiar código" />
                  <CopyButton value={joinUrl} label="Copiar enlace" />
                </div>
              </div>
            ) : null}

            {assignment ? (
              <div className="rounded-[2rem] bg-white p-6 shadow-sm">
                <p className="text-sm font-black uppercase tracking-[0.22em] text-orange-700">Tu resultado</p>
                <p className="mt-4 text-2xl font-black">Te toca regalar a {assignment.receiver.name}</p>
              </div>
            ) : null}

            {isOwner && group.status === "draft" ? (
              <form action={runDraw} className="rounded-[2rem] bg-white p-6 shadow-sm">
                <input type="hidden" name="groupId" value={group.id} />
                <p className="text-sm font-black uppercase tracking-[0.22em] text-orange-700">Organizador</p>
                <p className="mt-3 text-stone-600">Cuando todos estén dentro, lanza el sorteo. Se enviará un email a cada participante.</p>
                <button className="mt-5 w-full rounded-full bg-stone-950 px-5 py-4 font-black text-orange-50 disabled:opacity-50" disabled={members.length < 3} type="submit">
                  Realizar sorteo
                </button>
              </form>
            ) : null}

            {isOwner && group.status === "drawn" ? (
              <Link className="block rounded-[2rem] bg-orange-500 p-6 text-center text-xl font-black text-stone-950 shadow-xl shadow-orange-500/20" href={`/groups/${group.id}/reveal`}>
                Abrir revelación extraordinaria
              </Link>
            ) : null}
          </aside>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <form action={updateGiftSuggestions} className="rounded-[2rem] bg-white p-6 shadow-sm">
            <input type="hidden" name="groupId" value={group.id} />
            <p className="text-sm font-black uppercase tracking-[0.22em] text-orange-700">Tus ideas</p>
            <h2 className="mt-3 text-3xl font-black">Sugerencias de regalo</h2>
            <textarea
              className="mt-5 min-h-40 w-full rounded-2xl border border-stone-950/10 bg-orange-50 px-4 py-3 outline-none focus:border-orange-500"
              defaultValue={currentMember?.gift_suggestions ?? ""}
              name="giftSuggestions"
              placeholder="Cuanto más concreto, mejor: tallas, gustos, tiendas, no-goes..."
            />
            <button className="mt-4 rounded-full bg-stone-950 px-5 py-3 font-black text-orange-50" type="submit">Guardar sugerencias</button>
          </form>

          <div className="rounded-[2rem] bg-white/70 p-6">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-orange-700">Participantes</p>
            <div className="mt-5 grid gap-3">
              {members.map((member) => (
                <div key={member.user_id} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                  <div>
                    <p className="font-black">{member.profile.name}</p>
                    <p className="text-sm text-stone-500">{member.role === "owner" ? "Organizador" : "Participante"}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-black ${member.gift_suggestions ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}`}>
                    {member.gift_suggestions ? "Con sugerencias" : "Pendiente"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
