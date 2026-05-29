/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect, useState } from 'react';
import { ClassItem } from '../types';

interface ClassSettingsModalProps {
  isOpen: boolean;
  classItem: ClassItem | null;
  onClose: () => void;
  onSave: (poolSize: number, drawCount: number) => void;
}

export default function ClassSettingsModal({
  isOpen,
  classItem,
  onClose,
  onSave,
}: ClassSettingsModalProps) {
  const [poolSize, setPoolSize] = useState(30);
  const [drawCount, setDrawCount] = useState(2);

  useEffect(() => {
    if (classItem) {
      setPoolSize(classItem.poolSize ?? 30);
      setDrawCount(classItem.drawCount ?? 2);
    }
  }, [classItem, isOpen]);

  if (!isOpen || !classItem) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalSize = Math.max(1, Math.min(99, poolSize));
    const finalDraw = Math.max(1, Math.min(20, drawCount));
    onSave(finalSize, finalDraw);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-200 flex items-center justify-center p-3 backdrop-blur-xs"
      onClick={onClose}
    >
      <form
        className="bg-brand-paper-light dark:bg-brand-paper-dark border-2 border-brand-line-light dark:border-brand-line-dark rounded-2xl p-6 w-full max-w-[440px] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h2 className="text-xl font-bold text-brand-ink-light dark:text-brand-ink-dark mb-4">
          ⚙️ Ustawienia klasy {classItem.name}
        </h2>

        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between gap-4">
            <label className="text-sm font-semibold text-brand-ink2-light dark:text-brand-ink2-dark font-sans">
              Liczba uczniów w puli (1–99):
            </label>
            <input
              type="number"
              min={1}
              max={99}
              value={poolSize}
              onChange={(e) => setPoolSize(parseInt(e.target.value) || 1)}
              className="w-20 font-mono text-center text-[15px] p-2 border-1.5 border-brand-line-light dark:border-brand-line-dark rounded-lg bg-brand-bg-light dark:bg-brand-bg-dark text-brand-ink-light dark:text-brand-ink-dark outline-none focus:border-brand-accent-light dark:focus:border-brand-accent-dark"
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <label className="text-sm font-semibold text-brand-ink2-light dark:text-brand-ink2-dark font-sans">
              Rozmiar losowania (ile osób naraz):
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={drawCount}
              onChange={(e) => setDrawCount(parseInt(e.target.value) || 1)}
              className="w-20 font-mono text-center text-[15px] p-2 border-1.5 border-brand-line-light dark:border-brand-line-dark rounded-lg bg-brand-bg-light dark:bg-brand-bg-dark text-brand-ink-light dark:text-brand-ink-dark outline-none focus:border-brand-accent-light dark:focus:border-brand-accent-dark"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2.5">
          <button
            type="button"
            className="font-serif text-[15px] font-semibold py-2 px-4 rounded-lg bg-transparent border-1.5 border-brand-line-light dark:border-brand-line-dark text-brand-muted-light dark:text-brand-muted-dark hover:bg-brand-bg-light dark:hover:bg-brand-bg-dark cursor-pointer transition-all"
            onClick={onClose}
          >
            Anuluj
          </button>
          <button
            type="submit"
            className="font-serif text-[15px] font-semibold py-2 px-5 rounded-lg bg-brand-accent2-light dark:bg-brand-accent2-dark text-white shadow-md cursor-pointer hover:brightness-110 active:scale-97 transition-all"
          >
            Zapisz
          </button>
        </div>
      </form>
    </div>
  );
}
