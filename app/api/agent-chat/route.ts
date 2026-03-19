import { NextResponse } from "next/server";
import { runAgent } from "@/lib/agent";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body?.message;
    const messages = body?.messages ?? [];

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Geen geldig bericht ontvangen." },
        { status: 400 }
      );
    }

    const result = await runAgent(message, messages);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Fout in /api/agent-chat:", error);

    return NextResponse.json(
  {
    answer:
      "Er ging wat mis bij het beantwoorden van je vraag. Probeer de pagina te herladen en stel je vraag opnieuw. Blijft het probleem? Neem dan contact op met het Service Center via 0345 851 963 voor je vraag."
  },
  { status: 200 }
);
  }
}