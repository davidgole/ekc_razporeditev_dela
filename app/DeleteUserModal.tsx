'use client';

import { useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface Props {
  users: User[];
  onClose: () => void;
  onDeleted: () => void;
}

export default function DeleteUserModal({ users, onClose, onDeleted }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [localUsers, setLocalUsers] = useState<User[]>(users);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error('Napaka pri brisanju.');

      setLocalUsers(prev => prev.filter(u => u.id !== id));
      onDeleted();
    } catch {
      alert('Napaka pri brisanju. Poskusite znova.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg mx-4 p-8 animate-in fade-in zoom-in-95 duration-200">

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-slate-800">Upravljanje zaposlenih</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {localUsers.length === 0 ? (
          <p className="text-center text-slate-400 py-8">Ni zaposlenih v bazi.</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-100">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Ime</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">E-pošta</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {localUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-800">{user.name}</td>
                    <td className="px-4 py-3 text-slate-500 text-sm">{user.email}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={deletingId === user.id}
                        className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-sm font-bold hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingId === user.id ? '...' : 'Izbriši'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl border-2 border-slate-100 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
          >
            Zapri
          </button>
        </div>

      </div>
    </div>
  );
}