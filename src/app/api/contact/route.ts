import { NextRequest, NextResponse } from "next/server";

const TOKEN = process.env.TELEGRAM_CONTACT_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CONTACT_CHAT_ID;

export async function POST(req: NextRequest) {
  if (!TOKEN || !CHAT_ID) {
    return NextResponse.json({ error: "Bot sozlanmagan" }, { status: 500 });
  }

  const { name, phone, message } = await req.json();

  if (!name?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Maydonlar to'ldirilmagan" }, { status: 400 });
  }

  const text = [
    "📬 <b>Yangi murojaat</b>",
    "",
    `👤 <b>Ism:</b> ${name}`,
    phone ? `📞 <b>Telefon:</b> ${phone}` : null,
    `💬 <b>Xabar:</b> ${message}`,
  ]
    .filter(Boolean)
    .join("\n");

  const res = await fetch(
    `https://api.telegram.org/bot${TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: "HTML" }),
    }
  );

  if (!res.ok) {
    return NextResponse.json({ error: "Telegram xatosi" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
