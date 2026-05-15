'use client';

import React, { useState, useEffect } from 'react';
import AddUserModal from './AddUserModal';
import DeleteUserModal from './DeleteUserModal';

interface User {
  id: string
  name: string
  email: string
}

interface Rezultat {
  ime: string
  vloga: string
}

interface Props {
  users: User[]
  initialJeZaklenjen: boolean
  initialRezultati: Rezultat[]
}

export default function HomeClient({ users: initialUsers, initialJeZaklenjen, initialRezultati }: Props) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [izbrani, setIzbrani] = useState<string[]>([]);
  const [rezultati, setRezultati] = useState<{ ime: string; vloga: string }[]>(initialRezultati)
  const [generirano, setGenerirano] = useState(initialJeZaklenjen) 

  // Zaklep generiranja
  const [jeZaklenjen, setJeZaklenjen] = useState(initialJeZaklenjen);
  const [ttl, setTtl] = useState<number | null>(null);

  const vsiZaposleni = users.map(u => u.name);

  // Ob nalaganju preveri ali je generiranje že bilo opravljeno
  useEffect(() => {
  const preveriStatus = async () => {
    const res = await fetch('/api/puzzle');
    const data = await res.json();
    setJeZaklenjen(data.solved);
    if (data.ttl) setTtl(data.ttl);
    if (data.rezultati?.length > 0) setRezultati(data.rezultati); // ← dodaj
  };
  preveriStatus();
}, []);

  // Odštevalnik — vsako sekundo zmanjša ttl za 1
  useEffect(() => {
    if (!jeZaklenjen || ttl === null) return;

    const interval = setInterval(() => {
      setTtl(prev => {
        if (prev === null || prev <= 1) {
          setJeZaklenjen(false);
          clearInterval(interval);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [jeZaklenjen]);

  // Formatira sekunde v berljiv čas (1m 30s ali 2h 15m)
  const formatirajCas = (sekunde: number): string => {
    if (sekunde < 60) return `${sekunde}s`;
    if (sekunde < 3600) return `${Math.floor(sekunde / 60)}m ${sekunde % 60}s`;
    const ure = Math.floor(sekunde / 3600);
    const minute = Math.floor((sekunde % 3600) / 60);
    return `${ure}h ${minute}m`;
  };

  // Osveži seznam uporabnikov iz API-ja
  const refreshUsers = async () => {
    const res = await fetch('/api/users', { cache: 'no-store' });
    const data = await res.json();
    setUsers(data);
    setIzbrani(prev => prev.filter(ime => data.some((u: User) => u.name === ime)));
  };

  const toggleZaposleni = (ime: string) => {
    setGenerirano(false);
    if (izbrani.includes(ime)) {
      setIzbrani(izbrani.filter(i => i !== ime));
    } else {
      setIzbrani([...izbrani, ime]);
    }
  };

  const generirajRazpored = async () => {
    const n = izbrani.length;
    if (n === 0 || jeZaklenjen) return;

    let vloge: string[] = [];

    if (n % 2 === 0) {
      const pol = n / 2;
      vloge = [...Array(pol).fill("OMNI"), ...Array(pol).fill("Maximo")];
    } else {
      const ostalo = (n - 1) / 2;
      vloge = ["Vmesni", ...Array(ostalo).fill("OMNI"), ...Array(ostalo).fill("Maximo")];
    }

    const premisaneVloge = [...vloge];
    for (let i = premisaneVloge.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [premisaneVloge[i], premisaneVloge[j]] = [premisaneVloge[j], premisaneVloge[i]];
    }

    let noviRezultati = izbrani.map((ime, index) => ({
      ime,
      vloga: premisaneVloge[index]
    }));

    const neSmejoDobitiVmesni = ["Marko"];

    for (const ime of neSmejoDobitiVmesni) {
      const index = noviRezultati.findIndex(r => r.ime === ime && r.vloga === "Vmesni");
      if (index !== -1) {
        const zamenjavaIndex = noviRezultati.findIndex(r => !neSmejoDobitiVmesni.includes(r.ime) && r.vloga !== "Vmesni");
        if (zamenjavaIndex !== -1) {
          const temp = noviRezultati[index].vloga;
          noviRezultati[index].vloga = noviRezultati[zamenjavaIndex].vloga;
          noviRezultati[zamenjavaIndex].vloga = temp;
        }
      }
    }

    setRezultati(noviRezultati);
    setGenerirano(true);

    // Zakleni gumb in shrani rezultate v Redis
      await fetch('/api/puzzle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rezultati: noviRezultati })  // ← dodaj
      })
      setJeZaklenjen(true)
      setTtl(60)
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

        {/* Gumba za upravljanje zaposlenih */}
        <div className="flex justify-between mb-8">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-sm hover:bg-blue-100 transition-colors border border-blue-100"
          >
            <span className="text-lg leading-none">+</span>
            Dodaj zaposlenega
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 transition-colors border border-red-100"
          >
            <span className="text-lg leading-none">−</span>
            Odstrani zaposlenega
          </button>
        </div>

        {/* Mreža za izbiro zaposlenih */}
        {vsiZaposleni.length === 0 ? (
          <p className="text-center text-slate-400 mb-10 py-6">Ni zaposlenih v bazi. Dodajte prvega zaposlenega.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
            {vsiZaposleni.map((ime) => {
              const jeIzbran = izbrani.includes(ime);
              return (
                <button
                  key={ime}
                  onClick={() => toggleZaposleni(ime)}
                  disabled={jeZaklenjen}
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
        )}

        {/* Gumb za generiranje */}
        <div className="flex flex-col items-center gap-3 mb-10">
          <button
            onClick={generirajRazpored}
            disabled={izbrani.length === 0 || jeZaklenjen}
            className={`px-10 py-4 rounded-full font-black text-xl uppercase tracking-widest transition-all ${
              izbrani.length > 0 && !jeZaklenjen
                ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-xl shadow-emerald-100 active:scale-95'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {jeZaklenjen ? 'Že generirano' : 'Generiraj delo'}
          </button>

          {/* Odštevalnik */}
          {jeZaklenjen && ttl !== null && (
            <p className="text-sm text-slate-400 font-medium">
              Ponastavitev čez{' '}
              <span className="font-black text-slate-600">{formatirajCas(ttl)}</span>
            </p>
          )}
        </div>

        {/* Rezultati */}
        {rezultati.length > 0 && (
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

      {/* Modalna okna */}
      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onAdded={refreshUsers}
        />
      )}

      {showDeleteModal && (
        <DeleteUserModal
          users={users}
          onClose={() => setShowDeleteModal(false)}
          onDeleted={refreshUsers}
        />
      )}
    </main>
  );
}