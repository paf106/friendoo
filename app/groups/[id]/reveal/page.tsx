import Link from "next/link";
import { RevealStage } from "@/components/reveal-stage";
import { requireUser } from "@/lib/auth";
import { getRevealForOwner } from "@/lib/groups";

export default async function RevealPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const { group, assignments } = await getRevealForOwner(id, user.id);

  return (
    <main className="min-h-screen overflow-hidden bg-stone-950 px-6 py-8 text-orange-50 md:px-10">
      <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-orange-500/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-yellow-300/10 blur-3xl" />
      <div className="relative mx-auto max-w-6xl space-y-8">
        <Link className="font-bold text-orange-300" href={`/groups/${group.id}`}>← Volver al grupo</Link>
        <header className="rounded-[3rem] border border-orange-200/20 bg-white/5 p-8 backdrop-blur">
          <p className="text-sm font-black uppercase tracking-[0.28em] text-orange-300">Ceremonia privada del organizador</p>
          <h1 className="mt-4 max-w-4xl text-6xl font-black leading-[0.9] tracking-[-0.05em] md:text-8xl">La revelación de {group.name}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-orange-100/75">
            Abre los sobres uno a uno o revela toda la constelación. Solo el organizador puede ver esta pantalla completa.
          </p>
        </header>
        {assignments.length === 0 ? (
          <div className="rounded-[2rem] border border-orange-200/20 bg-white/5 p-10 text-center">
            <p className="text-xl font-bold">Aún no hay resultados guardados.</p>
          </div>
        ) : (
          <RevealStage assignments={assignments} />
        )}
      </div>
    </main>
  );
}
