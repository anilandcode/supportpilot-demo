import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseAdminEnv, hasSupabaseEnv } from "@/lib/supabase/config";
import { makeUniqueSlug, makeWidgetKey, ONBOARDING_CHECKLIST } from "@/lib/auth/onboarding";

export async function POST(request: Request) {
  if (!hasSupabaseEnv() || !hasSupabaseAdminEnv()) {
    return NextResponse.json({ ok: true, demo: true, redirectTo: "/admin" });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const orgName = String(body.orgName ?? "").trim();
  const workspaceName = String(body.workspaceName ?? "").trim();
  const supportUrl = String(body.supportUrl ?? "").trim();
  const timezone = String(body.timezone ?? "UTC").trim() || "UTC";

  if (!orgName || !workspaceName) {
    return NextResponse.json({ error: "Organization and workspace names are required" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Supabase service role is not configured" }, { status: 500 });
  }

  const { data: existingMembership } = await admin
    .from("memberships")
    .select("workspace_id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existingMembership?.workspace_id) {
    return NextResponse.json({ ok: true, workspaceId: existingMembership.workspace_id, redirectTo: "/admin" });
  }

  const email = user.email ?? "";
  const fullName = String(user.user_metadata?.full_name ?? email);

  const { error: profileError } = await admin.from("users").upsert({
    id: user.id,
    email,
    full_name: fullName,
    role: "admin",
  });
  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 });

  const { data: organization, error: orgError } = await admin
    .from("organizations")
    .insert({
      name: orgName,
      slug: makeUniqueSlug(orgName),
      plan: "Lite",
    })
    .select("id")
    .single();
  if (orgError || !organization) return NextResponse.json({ error: orgError?.message ?? "Could not create organization" }, { status: 500 });

  const { data: workspace, error: workspaceError } = await admin
    .from("workspaces")
    .insert({
      tenant_id: organization.id,
      name: workspaceName,
      slug: makeUniqueSlug(workspaceName),
      bot_name: "Pilot",
      brand_color: "#4f46e5",
      accent_foreground: "#ffffff",
      welcome_message: `Hi, I'm Pilot. Ask me anything about ${workspaceName}.`,
      escalation_email: email,
      calendly_url: supportUrl || null,
      widget_key: makeWidgetKey(),
      monthly_reply_limit: 1000,
    })
    .select("id,widget_key")
    .single();
  if (workspaceError || !workspace) return NextResponse.json({ error: workspaceError?.message ?? "Could not create workspace" }, { status: 500 });

  const baseRows = {
    tenant_id: organization.id,
    workspace_id: workspace.id,
  };

  const { error: membershipError } = await admin.from("memberships").insert({
    ...baseRows,
    user_id: user.id,
    role: "owner",
    status: "active",
    accepted_at: new Date().toISOString(),
  });
  if (membershipError) return NextResponse.json({ error: membershipError.message }, { status: 500 });

  await Promise.all([
    admin.from("widget_configs").insert({
      ...baseRows,
      launcher_label: "Chat with Pilot",
      position: "bottom-right",
      show_branding: true,
      privacy_text: "Answers are generated from approved support sources and may be escalated to a human.",
    }),
    admin.from("workspace_onboarding_sessions").insert({
      ...baseRows,
      current_step: "brand_voice",
      completed_steps: ["create_workspace"],
      created_by: user.id,
    }),
    admin.from("workspace_checklist_items").insert(
      ONBOARDING_CHECKLIST.map((item) => ({
        ...baseRows,
        step: item.step,
        label: item.label,
        description: item.description,
        completed: false,
      })),
    ),
    admin.from("audit_logs").insert({
      ...baseRows,
      ticket_id: null,
      user_id: user.id,
      action: "workspace.created",
      details: { orgName, workspaceName, timezone, supportUrl },
    }),
  ]);

  return NextResponse.json({ ok: true, workspaceId: workspace.id, widgetKey: workspace.widget_key, redirectTo: "/onboarding" });
}
