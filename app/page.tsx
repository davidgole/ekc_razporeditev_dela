'use client';

import React, { useState } from 'react';

export default function Home() {
  const [vnos, setVnos] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const posljiPodatke = async (): Promise<void> => {
    if (!vnos) return;

    setLoading(true);
    setStatus('Pošiljam podatke...');

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vsebina: vnos }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus(`✅ ${data.success}`);
        setVnos(''); // Počistimo polje ob uspehu
      } else {
        setStatus(`❌ ${data.error}`);
      }
    } catch (error) {
      setStatus('❌ Prišlo je do napake pri povezavi.');
    } finally {
      setLoading(false);
    }
  };

  // Tipiziran event handler za input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVnos(e.target.value);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50 text-black">
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">Dnevna Oddaja</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vaše sporočilo
            </label>
            <input 
              className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              type="text" 
              value={vnos} 
              onChange={handleInputChange}
              placeholder="Vpišite nekaj..."
            />
          </div>

          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 w-full rounded-lg shadow transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            onClick={posljiPodatke}
            disabled={loading || !vnos}
          >
            {loading ? 'Obdelujem...' : 'Oddaj za danes'}
          </button>

          {status && (
            <div className={`mt-4 p-3 rounded-md text-sm text-center ${status.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {status}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}