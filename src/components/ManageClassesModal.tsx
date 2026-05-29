/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState } from 'react';
import { ClassItem } from '../types';

interface ManageClassesModalProps {
  isOpen: boolean;
  classes: ClassItem[];
  onClose: () => void;
  onDeleteSelected: (ids: string[]) => void;
}

export default function ManageClassesModal({
  isOpen,
  classes,
  onClose,
  onDeleteSelected,
}: ManageClassesModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDelete = () => {
    if (selectedIds.length === 0) {
      alert('Nie zaznaczono żadnej klasy do usunięcia.');
      return;
    }
    const names = classes
      .filter((c) => selectedIds.includes(c.id))
      .map((c) => c.name)
      .join(', ');

    if (
      window.confirm(
        `Czy na pewno chcesz permanentnie usunąć te klasy (${selectedIds.length}): ${names}?`
      )
    ) {
      onDeleteSelected(selectedIds);
      setSelectedIds([]);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-200 flex items-center justify-center p-3 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-brand-paper-light dark:bg-brand-paper-dark border-2 border-brand-line-light dark:border-brand-line-dark rounded-2xl p-6 w-full max-w-[500px] shadow-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-brand-ink-light dark:text-brand-ink-dark mb-2">
          🗂 Zarządzaj klasami
        </h2>
        <p className="text-sm italic text-brand-muted-light dark:text-brand-muted-dark mb-4 font-serif">
          Zaznacz klasy, które chcesz usunąć ze swojego dziennika, a następnie kliknij „Usuń zaznaczone".
        </p>

        <div className="flex-1 overflow-y-auto mb-4 border border-brand-line-light dark:border-brand-line-dark rounded-lg divide-y divide-brand-line-light dark:divide-brand-line-dark">
          {classes.length === 0 ? (
            <p className="text-center italic py-10 text-brand-muted-light dark:text-brand-muted-dark font-serif">
              Brak klas do wyboru.
            </p>
          ) : (
            classes.map((cls) => (
              <label
                key={cls.id}
                className="flex items-center gap-3 p-3.5 hover:bg-brand-bg-light dark:hover:bg-brand-bg-dark cursor-pointer select-none font-sans"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(cls.id)}
                  onChange={() => handleToggle(cls.id)}
                  className="w-5 h-5 accent-brand-accent-light dark:accent-brand-accent-dark cursor-pointer rounded-sm"
                />
                <span className="font-bold text-[15px] text-brand-ink-light dark:text-brand-ink-dark">
                  {cls.name}
                </span>
                <span className="text-xs text-brand-muted-light dark:text-brand-muted-dark ml-auto">
                  {cls.pool.filter((p) => p.included).length} uczniów w puli
                </span>
              </label>
            ))
          )}
        </div>

        <div className="flex justify-end gap-2 text-sm pt-2 border-t border-brand-line-light dark:border-brand-line-dark">
          <button
            className="font-serif text-[15px] font-semibold py-2 px-4 rounded-lg bg-transparent border-1.5 border-brand-line-light dark:border-brand-line-dark text-brand-muted-light dark:text-brand-muted-dark hover:bg-brand-bg-light dark:hover:bg-brand-bg-dark cursor-pointer transition-all"
            onClick={onClose}
          >
            Zamknij
          </button>
          <button
            className="font-serif text-[15px] font-semibold py-2 px-5 rounded-lg bg-transparent border-1.5 border-brand-accent-light dark:border-brand-accent-dark text-brand-accent-light dark:text-brand-accent-dark hover:bg-brand-accent-light hover:text-white dark:hover:bg-brand-accent-dark cursor-pointer transition-all"
            onClick={handleDelete}
            disabled={selectedIds.length === 0}
          >
            Usuń zaznaczone
          </button>
        </div>
      </div>
    </div>
  );
}
