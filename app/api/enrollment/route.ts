import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { sendTelegramNotification } from "@/lib/telegram";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side client with service_role — bypasses RLS (insert allowed regardless of policy)
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { parent_name, child_age, interest, interest_label, phone, comment } = body;

    if (!parent_name || !child_age || !interest || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from("enrollments").insert({
      parent_name,
      child_age,
      interest: interest || "",
      interest_label: interest_label || interest || "",
      phone,
      comment: comment || "",
    });

    if (error) {
      console.error("Supabase insert error:", error.message);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    // Уведомление в Telegram (асинхронно, не блокирует ответ)
    sendTelegramNotification({
      parentName: parent_name,
      childAge: child_age,
      interest: interest || interest_label || "",
      contact: phone,
      comment: comment || "",
    }).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("API error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
