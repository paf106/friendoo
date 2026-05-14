import Link from "next/link";
import { signInWithGoogle } from "@/app/auth/actions";
import { getUser } from "@/lib/auth";

export default async function Home() {
  const user = await getUser();

  return (
    <main className="min-h-screen overflow-hidden bg-[#fff4df] text-stone-950">
      <section className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 md:px-10">
        <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-orange-300/50 blur-3xl" />
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-yellow-200/70 blur-3xl" />
        <nav className="relative z-10 flex items-center justify-between">
          <p className="text-lg font-black tracking-tight">Friendoo</p>
          {user ? (
            <Link className="rounded-full bg-stone-950 px-5 py-3 text-sm font-bold text-orange-50" href="/dashboard">
              Ir al dashboard
            </Link>
          ) : (
            <form action={signInWithGoogle}>
              <button className="rounded-full bg-stone-950 px-5 py-3 text-sm font-bold text-orange-50" type="submit">
                Entrar con Google
              </button>
            </form>
          )}
        </nav>

        <div className="relative z-10 grid flex-1 items-center gap-12 py-20 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="mb-5 inline-flex rounded-full border border-orange-300 bg-white/50 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-orange-700">
              Sorteos secretos, grupos reales
            </p>
            <h1 className="max-w-4xl text-6xl font-black leading-[0.9] tracking-[-0.06em] md:text-8xl">
              El amigo invisible sin caos en el chat.
            </h1>
            <p className="mt-8 max-w-2xl text-xl leading-8 text-stone-700">
              Crea un grupo, comparte un código, deja que todos entren con Google y lanza un sorteo que envía por email a quién debe regalar cada persona.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              {user ? (
                <Link className="rounded-full bg-orange-500 px-7 py-4 text-center font-black text-stone-950 shadow-xl shadow-orange-500/20" href="/groups/new">
                  Crear mi grupo
                </Link>
              ) : (
                <form action={signInWithGoogle}>
                  <button className="w-full rounded-full bg-orange-500 px-7 py-4 font-black text-stone-950 shadow-xl shadow-orange-500/20" type="submit">
                    Empezar con Google
                  </button>
                </form>
              )}
              <Link className="rounded-full border border-stone-950/15 bg-white/50 px-7 py-4 text-center font-bold" href="/dashboard">
                Unirme con código
              </Link>
            </div>
          </div>

          <div className="relative rounded-[3rem] bg-stone-950 p-6 text-orange-50 shadow-2xl shadow-orange-900/20">
            <div className="absolute -right-8 -top-8 rounded-full bg-orange-400 px-6 py-5 text-4xl font-black text-stone-950 shadow-xl rotate-12">
              ?
            </div>
            <div className="rounded-[2.4rem] border border-orange-200/20 bg-[radial-gradient(circle_at_50%_0%,rgba(251,146,60,0.35),transparent_45%)] p-8">
              <p className="text-sm font-black uppercase tracking-[0.24em] text-orange-200">Noche del sorteo</p>
              <div className="mt-10 space-y-4">
                {["Ana", "Pablo", "Lucía", "Marco"].map((name, index) => (
                  <div key={name} className="flex items-center justify-between rounded-2xl bg-white/8 px-5 py-4">
                    <span className="font-bold">{name}</span>
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-black text-stone-950">
                      Sobre {index + 1}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-8 rounded-3xl bg-orange-100 p-5 text-stone-950">
                <p className="text-sm font-black uppercase tracking-[0.2em] text-orange-700">Email privado</p>
                <p className="mt-3 text-2xl font-black leading-tight">Te ha tocado regalar a...</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
