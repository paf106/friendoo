"use client";

import { useState } from "react";

type Assignment = {
  id: string;
  giverName: string;
  giverAvatar: string | null;
  receiverName: string;
  receiverAvatar: string | null;
};

export function RevealStage({ assignments }: { assignments: Assignment[] }) {
  const [visible, setVisible] = useState(0);
  const revealed = assignments.slice(0, visible);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setVisible((current) => Math.min(assignments.length, current + 1))}
          className="rounded-full bg-orange-400 px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-stone-950 shadow-[0_0_40px_rgba(251,146,60,0.45)] transition hover:-translate-y-1"
        >
          Revelar siguiente
        </button>
        <button
          type="button"
          onClick={() => setVisible(assignments.length)}
          className="rounded-full border border-orange-200/30 px-5 py-3 text-sm font-bold text-orange-50 transition hover:bg-orange-50/10"
        >
          Revelar todos
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {assignments.map((assignment, index) => {
          const isVisible = index < visible;

          return (
            <article
              key={assignment.id}
              className={`relative min-h-48 overflow-hidden rounded-[2rem] border p-6 transition duration-700 ${
                isVisible
                  ? "rotate-0 border-orange-200/50 bg-orange-50 text-stone-950 shadow-2xl"
                  : "-rotate-1 border-orange-200/15 bg-white/5 text-orange-50 blur-[1px]"
              }`}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(251,146,60,0.28),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(253,224,71,0.18),transparent_35%)]" />
              <div className="relative">
                <p className="text-xs font-black uppercase tracking-[0.24em] opacity-70">Sobre {index + 1}</p>
                {isVisible ? (
                  <div className="mt-10 space-y-3">
                    <p className="text-3xl font-black leading-tight md:text-4xl">{assignment.giverName}</p>
                    <p className="text-lg font-semibold opacity-75">regala a</p>
                    <p className="text-3xl font-black leading-tight text-orange-700 md:text-4xl">{assignment.receiverName}</p>
                  </div>
                ) : (
                  <div className="mt-12">
                    <p className="text-4xl font-black tracking-tight">?</p>
                    <p className="mt-3 text-sm uppercase tracking-[0.2em] opacity-70">Sellado hasta la revelación</p>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {revealed.length > 0 ? (
        <div className="rounded-[2rem] border border-orange-200/20 bg-black/30 p-6 text-orange-50">
          <p className="mb-4 text-sm font-black uppercase tracking-[0.24em] text-orange-200">Constelación final</p>
          <div className="grid gap-3 md:grid-cols-2">
            {revealed.map((assignment) => (
              <p key={`line-${assignment.id}`} className="rounded-2xl bg-white/5 px-4 py-3 text-sm">
                <strong>{assignment.giverName}</strong> → {assignment.receiverName}
              </p>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
