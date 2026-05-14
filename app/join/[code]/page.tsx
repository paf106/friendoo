import Link from "next/link";
import { joinGroupFromRoute } from "@/app/actions/groups";
import { requireUser } from "@/lib/auth";

export default async function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  await requireUser();
  const { code } = await params;
  const joinAction = joinGroupFromRoute.bind(null, code);

  return (
    <main className="grid min-h-screen place-items-center bg-[#fff4df] px-6 py-8 text-stone-950">
      <div className="w-full max-w-xl rounded-[2.5rem] bg-white p-8 text-center shadow-2xl shadow-orange-900/10">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-orange-700">Invitación</p>
        <h1 className="mt-4 text-5xl font-black tracking-tight">Unirte al grupo</h1>
        <p className="mt-5 text-lg text-stone-600">Vas a entrar con el código:</p>
        <p className="mt-4 rounded-2xl bg-orange-100 px-5 py-4 text-3xl font-black">{decodeURIComponent(code).toUpperCase()}</p>
        <form action={joinAction} className="mt-8">
          <button className="w-full rounded-full bg-stone-950 px-6 py-4 font-black text-orange-50" type="submit">Confirmar unión</button>
        </form>
        <Link className="mt-5 inline-flex font-bold text-orange-700" href="/dashboard">Cancelar</Link>
      </div>
    </main>
  );
}
