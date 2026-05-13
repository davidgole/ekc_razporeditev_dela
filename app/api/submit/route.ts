import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

// Inicializacija Redis klienta
const redis = new Redis({
  url: process.env.KV_REST_API_URL as string,
  token: process.env.KV_REST_API_TOKEN as string,
});

// Tip za vhodne podatke
interface SubmitRequestBody {
  vsebina: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SubmitRequestBody = await request.json();
    const { vsebina } = body;

    if (!vsebina) {
      return NextResponse.json({ error: "Vsebina je obvezna!" }, { status: 400 });
    }

    const danes = new Date().toISOString().split('T')[0];

    // Preverimo, če v Redis-u že obstaja ključ za današnji datum
    const obstaja = await redis.get(danes);
    if (obstaja) {
      return NextResponse.json(
        { error: "Za danes je obrazec že oddan in zaklenjen!" }, 
        { status: 403 }
      );
    }

    // Shranimo vsebino kot objekt
    await redis.set(danes, {
      vsebina,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: "Podatki so varno shranjeni!" });

  } catch (err) {
    console.error("Server Error:", err);
    return NextResponse.json(
      { error: "Napaka na strežniku pri povezavi z bazo." }, 
      { status: 500 }
    );
  }
}