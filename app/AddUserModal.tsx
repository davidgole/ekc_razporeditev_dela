'use client';

import { useState } from 'react';

interface Props {
  onClose: () => void;
  onAdded: () => void;
}

export default function AddUserModal({ onClose, onAdded }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Izpolnite vsa polja.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const id = Date.now().toString();
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name: name.trim(), email: email.trim() }),
      });

      if (!res.ok) throw new Error('Napaka pri dodajanju.');

      onAdded();
      onClose();
    } catch {
      setError('Napaka pri shranjevanju. Poskusite znova.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md mx-4 p-8 animate-in fade-in zoom-in-95 duration-200">

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-slate-800">Dodaj zaposlenega</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">
              Ime in priimek
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="npr. Ana Novak"
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-blue-400 focus:outline-none transition-colors text-slate-800"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">
              E-pošta
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="npr. ana@podjetje.si"
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-blue-400 focus:outline-none transition-colors text-slate-800"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm font-medium">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl border-2 border-slate-100 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
            >
              Prekliči
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Shranjujem...' : 'Dodaj'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}