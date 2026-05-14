"use server";

import { randomBytes, randomInt } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { sendDrawEmail } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/admin";

const groupSchema = z.object({
  name: z.string().trim().min(2),
  maxPrice: z.coerce.number().positive(),
  exchangeDate: z.string().optional(),
  message: z.string().trim().optional(),
  giftSuggestions: z.string().trim().optional(),
});

const suggestionsSchema = z.object({
  groupId: z.string().uuid(),
  giftSuggestions: z.string().trim().max(2000).optional(),
});

type MemberWithProfile = {
  user_id: string;
  gift_suggestions: string | null;
  profiles:
    | {
        email?: string | null;
        name?: string | null;
      }
    | Array<{
        email?: string | null;
        name?: string | null;
      }>
    | null;
};

export async function createGroup(formData: FormData) {
  const user = await requireUser();
  const parsed = groupSchema.safeParse({
    name: formData.get("name"),
    maxPrice: formData.get("maxPrice"),
    exchangeDate: formData.get("exchangeDate") || undefined,
    message: formData.get("message") || undefined,
    giftSuggestions: formData.get("giftSuggestions") || undefined,
  });

  if (!parsed.success) {
    redirect("/groups/new?error=Revisa los datos del grupo");
  }

  const admin = createAdminClient();
  const code = await createUniqueJoinCode(parsed.data.name);
  const { data: group, error: groupError } = await admin
    .from("groups")
    .insert({
      owner_id: user.id,
      name: parsed.data.name,
      max_price: parsed.data.maxPrice,
      exchange_date: parsed.data.exchangeDate || null,
      message: parsed.data.message || null,
      join_code: code,
    })
    .select("id")
    .single();

  if (groupError || !group) {
    redirect("/groups/new?error=No se pudo crear el grupo");
  }

  await admin.from("group_members").insert({
    group_id: group.id,
    user_id: user.id,
    role: "owner",
    gift_suggestions: parsed.data.giftSuggestions || null,
  });

  revalidatePath("/dashboard");
  redirect(`/groups/${group.id}`);
}

export async function joinGroupByCode(formData: FormData) {
  const rawCode = String(formData.get("code") ?? "");
  await joinGroup(rawCode);
}

export async function joinGroupFromRoute(code: string) {
  await joinGroup(code);
}

async function joinGroup(rawCode: string) {
  const user = await requireUser();
  const code = normalizeCode(rawCode);

  if (!code) {
    redirect("/dashboard?error=Código no válido");
  }

  const admin = createAdminClient();
  const { data: group } = await admin
    .from("groups")
    .select("id, status")
    .eq("join_code", code)
    .single();

  if (!group) {
    redirect("/dashboard?error=No existe ningún grupo con ese código");
  }

  if (group.status !== "draft") {
    redirect(`/groups/${group.id}?error=El sorteo ya se ha realizado`);
  }

  await admin.from("group_members").upsert(
    {
      group_id: group.id,
      user_id: user.id,
      role: "participant",
    },
    { onConflict: "group_id,user_id", ignoreDuplicates: true },
  );

  revalidatePath("/dashboard");
  redirect(`/groups/${group.id}`);
}

export async function updateGiftSuggestions(formData: FormData) {
  const user = await requireUser();
  const parsed = suggestionsSchema.safeParse({
    groupId: formData.get("groupId"),
    giftSuggestions: formData.get("giftSuggestions") || undefined,
  });

  if (!parsed.success) {
    redirect("/dashboard?error=No se pudieron guardar las sugerencias");
  }

  const admin = createAdminClient();
  await admin
    .from("group_members")
    .update({ gift_suggestions: parsed.data.giftSuggestions || null })
    .eq("group_id", parsed.data.groupId)
    .eq("user_id", user.id);

  revalidatePath(`/groups/${parsed.data.groupId}`);
  redirect(`/groups/${parsed.data.groupId}?saved=1`);
}

export async function runDraw(formData: FormData) {
  const user = await requireUser();
  const groupId = String(formData.get("groupId") ?? "");

  if (!z.string().uuid().safeParse(groupId).success) {
    redirect("/dashboard?error=Grupo no válido");
  }

  const admin = createAdminClient();
  const { data: group } = await admin
    .from("groups")
    .select("id, owner_id, name, max_price, message, status")
    .eq("id", groupId)
    .single();

  if (!group || group.owner_id !== user.id) {
    redirect(`/groups/${groupId}?error=Solo el organizador puede realizar el sorteo`);
  }

  if (group.status === "drawn") {
    redirect(`/groups/${groupId}/reveal`);
  }

  const { data: members } = await admin
    .from("group_members")
    .select("user_id, gift_suggestions, profiles(id, email, name)")
    .eq("group_id", groupId);

  if (!members || members.length < 3) {
    redirect(`/groups/${groupId}?error=Necesitas al menos 3 participantes`);
  }

  const shuffled = shuffle([...members]);
  const assignments = shuffled.map((member, index) => {
    const receiver = shuffled[(index + 1) % shuffled.length];
    return {
      group_id: groupId,
      giver_id: member.user_id,
      receiver_id: receiver.user_id,
    };
  });

  const { data: inserted, error: insertError } = await admin
    .from("draw_assignments")
    .insert(assignments)
    .select("id, giver_id, receiver_id");

  if (insertError || !inserted) {
    redirect(`/groups/${groupId}?error=No se pudo guardar el sorteo`);
  }

  await admin.from("groups").update({ status: "drawn" }).eq("id", groupId);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const memberMap = new Map(members.map((member) => [member.user_id, normalizeMember(member)]));

  await Promise.all(
    inserted.map(async (assignment) => {
      const giver = memberMap.get(assignment.giver_id);
      const receiver = memberMap.get(assignment.receiver_id);

      if (!giver?.email || !receiver) {
        return;
      }

      const result = await sendDrawEmail({
        to: giver.email,
        groupName: group.name,
        maxPrice: Number(group.max_price),
        giverName: giver.name,
        receiverName: receiver.name,
        receiverSuggestions: receiver.giftSuggestions,
        message: group.message,
        groupUrl: `${siteUrl}/groups/${groupId}`,
      });

      await admin.from("email_deliveries").insert({
        group_id: groupId,
        assignment_id: assignment.id,
        recipient_user_id: assignment.giver_id,
        resend_id: result.id,
        status: result.error ? "failed" : "sent",
        error: result.error,
        sent_at: result.error ? null : new Date().toISOString(),
      });
    }),
  );

  revalidatePath(`/groups/${groupId}`);
  redirect(`/groups/${groupId}/reveal`);
}

async function createUniqueJoinCode(name: string) {
  const admin = createAdminClient();

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const prefix = name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "")
      .slice(0, 7)
      .toUpperCase()
      .padEnd(4, "X");
    const code = `${prefix}-${randomBytes(2).toString("hex").toUpperCase()}`;
    const { data } = await admin.from("groups").select("id").eq("join_code", code).maybeSingle();

    if (!data) {
      return code;
    }
  }

  return randomBytes(5).toString("hex").toUpperCase();
}

function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}

function shuffle<T>(items: T[]) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(index + 1);
    [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
  }

  return items;
}

function normalizeMember(member: MemberWithProfile) {
  const profile = Array.isArray(member.profiles) ? member.profiles[0] : member.profiles;

  return {
    email: profile?.email as string | undefined,
    name: (profile?.name as string | undefined) ?? "Participante",
    giftSuggestions: (member.gift_suggestions as string | null) ?? null,
  };
}
