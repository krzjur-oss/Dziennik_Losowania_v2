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
  const [poolSizeInput, setPoolSizeInput] = useState('30');
  const [drawCountInput, setDrawCountInput] = useState('2');

  useEffect(() => {
    if (classItem && isOpen) {
      setPoolSizeInput(String(classItem.poolSize ?? 30));
      setDrawCountInput(String(classItem.drawCount ?? 2));
    }
  }, [classItem, isOpen]);

  if (!isOpen || !classItem) return null;

  const handlePoolSizeBlur = () => {
    const trimmed = poolSizeInput.trim();
    if (!trimmed) {
      setPoolSizeInput(String(classItem.poolSize ?? 30));
      return;
    }
    const val = parseInt(trimmed, 10);
    if (isNaN(val)) {
      setPoolSizeInput(String(classItem.poolSize ?? 30));
    } else {
      setPoolSizeInput(String(Math.max(1, Math.min(99, val))));
    }
  };

  const handleDrawCountBlur = () => {
    const trimmed = drawCountInput.trim();
    if (!trimmed) {
      setDrawCountInput(String(classItem.drawCount ?? 2));
      return;
    }
    const val = parseInt(trimmed, 10);
    if (isNaN(val)) {
      setDrawCountInput(String(classItem.drawCount ?? 2));
    } else {
      setDrawCountInput(String(Math.max(1, Math.min(20, val))));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedSize = parseInt(poolSizeInput, 10);
    const finalSize = isNaN(parsedSize) ? (classItem.poolSize ?? 30) : Math.max(1, Math.min(99, parsedSize));
    const parsedDraw = parseInt(drawCountInput, 10);
    const finalDraw = isNaN(parsedDraw) ? (classItem.drawCount ?? 2) : Math.max(1, Math.min(20, parsedDraw));
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
              value={poolSizeInput}
              onChange={(e) => setPoolSizeInput(e.target.value)}
              onBlur={handlePoolSizeBlur}
              onFocus={(e) => e.target.select()}
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
              value={drawCountInput}
              onChange={(e) => setDrawCountInput(e.target.value)}
              onBlur={handleDrawCountBlur}
              onFocus={(e) => e.target.select()}
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
