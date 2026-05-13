import { Redis } from '@upstash/redis';

// Ročna inicializacija s spremenljivkami, ki jih imaš v Storage razdelku
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Metoda ni dovoljena" });
  }

  try {
    const danes = new Date().toISOString().split('T')[0]; // Format: 2026-05-13

    // 1. Preverimo, če ključ za danes že obstaja
    const obstaja = await redis.get(danes);

    if (obstaja) {
      return res.status(403).json({ error: "Za danes je obrazec že oddan in zaklenjen!" });
    }

    // 2. Če ne obstaja, shranimo vsebino, ki pride iz tvojega HTML obrazca
    const { vsebina } = req.body;
    
    if (!vsebina) {
        return res.status(400).json({ error: "Vnos ne sme biti prazen." });
    }

    await redis.set(danes, { 
        vsebina: vsebina, 
        oddano_ob: new Date().toLocaleTimeString() 
    });

    return res.status(200).json({ success: "Uspešno shranjeno v Redis!" });

  } catch (error) {
    console.error("Napaka v bazi:", error);
    return res.status(500).json({ error: "Težava pri povezavi z bazo." });
  }
}