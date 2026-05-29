/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { ClassItem } from '../types';

interface StatsModalProps {
  isOpen: boolean;
  classItem: ClassItem | null;
  onClose: () => void;
}

export default function StatsModal({ isOpen, classItem, onClose }: StatsModalProps) {
  if (!isOpen || !classItem) return null;

  const totalDraws = classItem.history.length;

  // Count occurrences per student number
  const counts: Record<number, number> = {};
  classItem.history.forEach((h) => {
    const nums = h.nums ?? [h.n1 ?? '-', h.n2 ?? '-'];
    nums.forEach((n) => {
      if (typeof n === 'number') {
        counts[n] = (counts[n] ?? 0) + 1;
      }
    });
  });

  const totalRegisteredNums = Object.values(counts).reduce((a, b) => a + b, 0);

  // Sorting
  const sorted = Object.entries(counts)
    .map(([num, count]) => ({ n: parseInt(num), count }))
    .sort((a, b) => b.count - a.count);

  const maxDraws = sorted[0]?.count ?? 0;
  const minDraws = sorted.length > 0 ? sorted[sorted.length - 1].count : 0;

  const mostDrawn = sorted.filter((x) => x.count === maxDraws).map((x) => x.n);
  const leastDrawn = sorted.filter((x) => x.count === minDraws).map((x) => x.n);
  const neverDrawn = classItem.pool
    .filter((p) => p.included && !counts[p.n])
    .map((p) => p.n);

  return (
    <div
      className="fixed inset-0 bg-black/60 z-200 flex items-center justify-center p-3 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-brand-paper-light dark:bg-brand-paper-dark border-2 border-brand-line-light dark:border-brand-line-dark rounded-2xl p-6 w-full max-w-[540px] shadow-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-brand-ink-light dark:text-brand-ink-dark mb-4">
          📊 Statystyki losowań klasy {classItem.name}
        </h2>

        <div className="flex-1 overflow-y-auto space-y-5 text-[15px] font-serif hover:scrollbar-thin">
          {totalDraws === 0 ? (
            <div className="text-center italic py-16 text-brand-muted-light dark:text-brand-muted-dark">
              Brak danych statystycznych — wykonaj najpierw kilka losowań dla tej klasy.
            </div>
          ) : (
            <>
              <div className="p-3.5 bg-brand-bg-light dark:bg-brand-bg-dark rounded-xl border border-brand-line-light dark:border-brand-line-dark font-sans text-sm text-brand-ink2-light dark:text-brand-ink2-dark space-y-1">
                <div>
                  💡 <b>Łącznie losowań:</b> {totalDraws} rund
                </div>
                <div>
                  ✏️ <b>Suma wylosowanych typowań:</b> {totalRegisteredNums} razy
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-brand-accent-light dark:text-brand-accent-dark mb-1 font-sans">
                  Najczęściej losowani ({maxDraws}x)
                </h3>
                <div className="font-mono text-sm leading-relaxed p-2 bg-brand-bg-light dark:bg-brand-bg-dark rounded-lg flex flex-wrap gap-1.5 min-h-[36px] items-center">
                  {mostDrawn.length === 0 ? (
                    <span className="text-xs italic text-brand-muted-light">—</span>
                  ) : (
                    mostDrawn.map((n) => (
                      <span
                        key={n}
                        className="py-0.5 px-2 bg-brand-accent-light/10 text-brand-accent-light dark:text-brand-accent-dark font-bold rounded-sm text-sm"
                      >
                        {n}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-brand-accent2-light dark:text-brand-accent2-dark mb-1 font-sans">
                  Najrzadziej losowani ({minDraws}x)
                </h3>
                <div className="font-mono text-sm leading-relaxed p-2 bg-brand-bg-light dark:bg-brand-bg-dark rounded-lg flex flex-wrap gap-1.5 min-h-[36px] items-center">
                  {leastDrawn.length === 0 ? (
                    <span className="text-xs italic text-brand-muted-light">—</span>
                  ) : (
                    leastDrawn.map((n) => (
                      <span
                        key={n}
                        className="py-0.5 px-2 bg-brand-accent2-light/10 text-brand-accent2-light dark:text-brand-accent2-dark font-bold rounded-sm text-sm"
                      >
                        {n}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {neverDrawn.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-brand-muted-light dark:text-brand-muted-dark mb-1 font-sans">
                    Nigdy nie wylosowani ({neverDrawn.length} osób)
                  </h3>
                  <div className="font-mono text-sm leading-relaxed p-2 bg-brand-bg-light dark:bg-brand-bg-dark rounded-lg flex flex-wrap gap-1.5 min-h-[36px] items-center">
                    {neverDrawn.map((n) => (
                      <span
                        key={n}
                        className="py-0.5 px-2 bg-slate-400/10 text-slate-500 font-bold rounded-sm text-sm"
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-brand-ink-light dark:text-brand-ink-dark mb-3 font-sans">
                  Wylosowania wg numeru
                </h3>
                <div className="space-y-2 border border-brand-line-light dark:border-brand-line-dark rounded-xl p-3.5 bg-brand-bg-light/20">
                  {classItem.pool
                    .filter((p) => p.included)
                    .map((p) => {
                      const c = counts[p.n] ?? 0;
                      const pct = totalDraws > 0 ? Math.round((c / totalDraws) * 100) : 0;
                      return (
                        <div key={p.n} className="flex items-center gap-3.5">
                          <span className="font-mono font-bold text-sm min-w-8">
                            {p.n}
                          </span>
                          <div className="flex-1 h-4 bg-brand-line-light/30 dark:bg-brand-line-dark/40 rounded-sm overflow-hidden relative">
                            <div
                              style={{ width: `${pct}%` }}
                              className="h-full bg-brand-accent-light dark:bg-brand-accent-dark rounded-sm min-w-[3px] transition-all duration-300"
                            />
                          </div>
                          <span className="font-mono text-xs text-brand-muted-light dark:text-brand-muted-dark min-w-20 text-right">
                            {c}x ({pct}%)
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 flex justify-end pt-3 border-t border-brand-line-light dark:border-brand-line-dark">
          <button
            className="font-serif text-[15px] font-semibold py-2 px-6 rounded-lg bg-brand-accent-light dark:bg-brand-accent-dark text-white shadow-md cursor-pointer hover:brightness-110 active:scale-97 transition-all"
            onClick={onClose}
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
}
