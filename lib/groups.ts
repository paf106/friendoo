import { notFound, redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

export type GroupSummary = {
  id: string;
  name: string;
  max_price: number;
  exchange_date: string | null;
  join_code: string;
  status: "draft" | "drawn";
  owner_id: string;
  member_count: number;
};

type DashboardGroupRow = {
  id: string;
  name: string;
  max_price: string | number;
  exchange_date: string | null;
  join_code: string;
  status: "draft" | "drawn";
  owner_id: string;
  group_members?: Array<{ count?: number }>;
};

type ProfileRow = {
  id?: string;
  email?: string | null;
  name?: string | null;
  avatar_url?: string | null;
};

type MemberRow = {
  user_id: string;
  role: "owner" | "participant";
  gift_suggestions: string | null;
  joined_at: string;
  profiles: ProfileRow | ProfileRow[] | null;
};

type AssignmentRow = {
  receiver_id: string;
  profiles: ProfileRow | ProfileRow[] | null;
};

type RevealAssignmentRow = {
  id: string;
  giver?: ProfileRow | null;
  receiver?: ProfileRow | null;
};

export async function getDashboardGroups(userId: string) {
  const admin = createAdminClient();
  const { data: memberships } = await admin
    .from("group_members")
    .select("group_id")
    .eq("user_id", userId);

  const ids = memberships?.map((membership) => membership.group_id) ?? [];

  if (ids.length === 0) {
    return [] as GroupSummary[];
  }

  const { data: groups } = await admin
    .from("groups")
    .select("id, name, max_price, exchange_date, join_code, status, owner_id, group_members(count)")
    .in("id", ids)
    .order("created_at", { ascending: false });

  return ((groups ?? []) as DashboardGroupRow[]).map((group) => ({
    id: group.id,
    name: group.name,
    max_price: Number(group.max_price),
    exchange_date: group.exchange_date,
    join_code: group.join_code,
    status: group.status,
    owner_id: group.owner_id,
    member_count: group.group_members?.[0]?.count ?? 0,
  })) as GroupSummary[];
}

export async function getGroupForUser(groupId: string, userId: string) {
  const admin = createAdminClient();
  const [groupResult, memberResult, assignmentResult] = await Promise.all([
    admin
      .from("groups")
      .select("id, owner_id, name, max_price, exchange_date, message, join_code, status, created_at")
      .eq("id", groupId)
      .single(),
    admin
      .from("group_members")
      .select("user_id, role, gift_suggestions, joined_at, profiles(id, email, name, avatar_url)")
      .eq("group_id", groupId)
      .order("joined_at", { ascending: true }),
    admin
      .from("draw_assignments")
      .select("receiver_id, profiles!draw_assignments_receiver_id_fkey(id, name, email, avatar_url)")
      .eq("group_id", groupId)
      .eq("giver_id", userId)
      .maybeSingle(),
  ]);

  if (!groupResult.data) {
    notFound();
  }

  const members = (memberResult.data ?? []).map(normalizeMember);
  const currentMember = members.find((member) => member.user_id === userId);

  if (!currentMember && groupResult.data.owner_id !== userId) {
    redirect("/dashboard?error=No perteneces a ese grupo");
  }

  return {
    group: {
      ...groupResult.data,
      max_price: Number(groupResult.data.max_price),
    },
    members,
    currentMember,
    assignment: assignmentResult.data ? normalizeAssignment(assignmentResult.data) : null,
  };
}

export async function getRevealForOwner(groupId: string, userId: string) {
  const admin = createAdminClient();
  const { data: group } = await admin
    .from("groups")
    .select("id, owner_id, name, max_price, status")
    .eq("id", groupId)
    .single();

  if (!group) {
    notFound();
  }

  if (group.owner_id !== userId) {
    redirect(`/groups/${groupId}?error=Solo el organizador puede ver esta revelación`);
  }

  const { data: assignments } = await admin
    .from("draw_assignments")
    .select(
      "id, giver_id, receiver_id, giver:profiles!draw_assignments_giver_id_fkey(id, name, avatar_url), receiver:profiles!draw_assignments_receiver_id_fkey(id, name, avatar_url)",
    )
    .eq("group_id", groupId)
    .order("created_at", { ascending: true });

  return {
    group: { ...group, max_price: Number(group.max_price) },
    assignments: ((assignments ?? []) as RevealAssignmentRow[]).map((assignment) => ({
      id: assignment.id,
      giverName: assignment.giver?.name ?? "Participante",
      giverAvatar: assignment.giver?.avatar_url ?? null,
      receiverName: assignment.receiver?.name ?? "Participante",
      receiverAvatar: assignment.receiver?.avatar_url ?? null,
    })),
  };
}

function normalizeMember(member: MemberRow) {
  const profile = Array.isArray(member.profiles) ? member.profiles[0] : member.profiles;

  return {
    user_id: member.user_id as string,
    role: member.role as "owner" | "participant",
    gift_suggestions: (member.gift_suggestions as string | null) ?? "",
    joined_at: member.joined_at as string,
    profile: {
      id: profile?.id as string,
      email: profile?.email as string | null,
      name: (profile?.name as string | null) ?? "Participante",
      avatar_url: profile?.avatar_url as string | null,
    },
  };
}

function normalizeAssignment(assignment: AssignmentRow) {
  const receiver = Array.isArray(assignment.profiles) ? assignment.profiles[0] : assignment.profiles;

  return {
    receiver_id: assignment.receiver_id as string,
    receiver: {
      id: receiver?.id as string,
      name: (receiver?.name as string | null) ?? "Participante",
      email: receiver?.email as string | null,
      avatar_url: receiver?.avatar_url as string | null,
    },
  };
}
