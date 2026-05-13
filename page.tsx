'use client';

import React, { useState } from 'react';

export default function Home() {
  // Seznam vseh možnih zaposlenih
  const vsiZaposleni = ["Kristina", "Neira", "Tadej", "David", "Marko"];
  
  // Stanja
  const [izbrani, setIzbrani] = useState<string[]>([]);
  const [rezultati, setRezultati] = useState<{ ime: string; vloga: string }[]>([]);
  const [generirano, setGenerirano] = useState<boolean>(false);

  // Logika za izbiro/odstranitev zaposlenega (Multi-select)
  const toggleZaposleni = (ime: string) => {
    setGenerirano(false); // Ponastavi rezultate, če spreminjamo ekipo
    if (izbrani.includes(ime)) {
      setIzbrani(izbrani.filter(i => i !== ime));
    } else {
      setIzbrani([...izbrani, ime]);
    }
  };

const generirajRazpored = () => {
    const n = izbrani.length;
    if (n === 0) return;

    let vloge: string[] = [];

    // 1. Določimo število vlog (enako kot prej)
    if (n % 2 === 0) {
      const pol = n / 2;
      vloge = [...Array(pol).fill("OMNI"), ...Array(pol).fill("Maximo")];
    } else {
      const ostalo = (n - 1) / 2;
      vloge = ["Vmesni", ...Array(ostalo).fill("OMNI"), ...Array(ostalo).fill("Maximo")];
    }

    // 2. Premešamo vloge (Fisher-Yates)
    const premisaneVloge = [...vloge];
    for (let i = premisaneVloge.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [premisaneVloge[i], premisaneVloge[j]] = [premisaneVloge[j], premisaneVloge[i]];
    }

    // 3. Ustvarimo začasne rezultate
    let noviRezultati = izbrani.map((ime, index) => ({
      ime,
      vloga: premisaneVloge[index]
    }));

    // 4. LOGIKA ZA MARKA: Preverimo, če je Marko dobil "Vmesni"
    const markoIndex = noviRezultati.findIndex(r => r.ime === "Marko" && r.vloga === "Vmesni");

    if (markoIndex !== -1) {
      // Poiščemo nekoga, ki NI Marko in NI Vmesni (torej je OMNI ali Maximo)
      const zamenjavaIndex = noviRezultati.findIndex(r => r.ime !== "Marko" && r.vloga !== "Vmesni");

      if (zamenjavaIndex !== -1) {
        // Zamenjamo vlogi med Markom in to osebo
        const vlogaMarka = noviRezultati[markoIndex].vloga;
        noviRezultati[markoIndex].vloga = noviRezultati[zamenjavaIndex].vloga;
        noviRezultati[zamenjavaIndex].vloga = vlogaMarka;
      }
    }

    setRezultati(noviRezultati);
    setGenerirano(true);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50 text-slate-900">
      <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2">
            Delo danes
          </h1>
          <p className="text-slate-500">Izberite zaposlene, ki so danes prisotni</p>
        </div>

        {/* Mreža za izbiro zaposlenih */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
          {vsiZaposleni.map((ime) => {
            const jeIzbran = izbrani.includes(ime);
            return (
              <button
                key={ime}
                onClick={() => toggleZaposleni(ime)}
                className={`p-4 rounded-2xl font-bold transition-all duration-300 border-2 text-center ${
                  jeIzbran 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 scale-105' 
                    : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'
                }`}
              >
                {ime}
              </button>
            );
          })}
        </div>

        {/* Gumb za akcijo */}
        <div className="flex justify-center mb-10">
          <button
            onClick={generirajRazpored}
            disabled={izbrani.length === 0}
            className={`px-10 py-4 rounded-full font-black text-xl uppercase tracking-widest transition-all ${
              izbrani.length > 0
                ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-xl shadow-emerald-100 active:scale-95'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            Generiraj delo
          </button>
        </div>

        {/* Prikaz rezultatov */}
        {generirano && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-slate-700 mb-4 border-b pb-2">Današnji razpored:</h2>
            {rezultati.map((res) => (
              <div 
                key={res.ime} 
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100"
              >
                <span className="font-bold text-lg">{res.ime}</span>
                <span className={`px-4 py-1 rounded-full font-black text-sm ${
                    res.vloga === 'OMNI' 
                      ? 'bg-purple-100 text-purple-700' 
                      : res.vloga === 'Maximo' 
                        ? 'bg-orange-100 text-orange-700' 
                        : 'bg-gray-100 text-gray-700'
                  }`}>
                    {res.vloga}
                </span>
              </div>
            ))}
          </div>
        )}

      </div>
      
      <p className="mt-8 text-slate-400 text-xs uppercase tracking-widest font-bold">
        Izbranih: {izbrani.length} / {vsiZaposleni.length}
      </p>
    </main>
  );
}