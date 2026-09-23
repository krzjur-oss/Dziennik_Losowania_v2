/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useRef } from 'react';
import { ChevronDown, RotateCcw, Award, Play, RefreshCw, Trash2, Undo } from 'lucide-react';
import { ClassItem } from '../types';

interface ClassViewProps {
  classItem: ClassItem;
  onToggleNumber: (n: number) => void;
  onToggleAbsent: (n: number) => void;
  onToggleVolunteered: (n: number) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onSelectOdd: () => void;
  onSelectEven: () => void;
  onClearAbsent: () => void;
  onClearVolunteered: () => void;
  onDraw: () => void;
  onUndoLastDraw: () => void;
  onResetQueue: () => void;
  onClearHistory: () => void;
  onOpenSettings: () => void;
  onDuplicate: () => void;
  onOpenStats: () => void;
}

interface StudentButtonProps {
  n: number;
  included: boolean;
  isAbsent: boolean;
  isVolunteered: boolean;
  isDrawn: boolean;
  onToggleNumber: (n: number) => void;
  onToggleAbsent: (n: number) => void;
  onToggleVolunteered: (n: number) => void;
}

const StudentButton: React.FC<StudentButtonProps> = ({
  n,
  included,
  isAbsent,
  isVolunteered,
  isDrawn,
  onToggleNumber,
  onToggleAbsent,
  onToggleVolunteered,
}) => {
  const touchTimer = useRef<NodeJS.Timeout | null>(null);

  let styleClass =
    'border-brand-line-light dark:border-brand-line-dark opacity-50 bg-linear-to-br from-slate-100/30 to-slate-200/50 dark:from-slate-800/20 dark:to-slate-900/40 text-brand-muted-light dark:text-brand-muted-dark';
  let labelExtra = '';

  if (included) {
    if (isAbsent) {
      styleClass =
        'border-brand-accent-light dark:border-brand-accent-dark bg-brand-accent-light/10 text-brand-accent-light dark:text-brand-accent-dark line-through font-bold';
      labelExtra = '⊘';
    } else if (isVolunteered) {
      styleClass =
        'border-brand-accent2-light dark:border-brand-accent2-dark bg-brand-accent2-light/12 text-brand-accent2-light dark:text-brand-accent2-dark font-bold scale-102';
      labelExtra = '✋';
    } else if (isDrawn) {
      styleClass =
        'border-brand-gold-light dark:border-brand-gold-dark bg-brand-gold-light/12 text-brand-gold-light dark:text-brand-gold-dark font-semibold';
      labelExtra = '✓';
    } else {
      styleClass =
        'border-brand-green-light dark:border-brand-green-dark bg-brand-green-light/8 text-brand-green-light dark:text-brand-green-dark font-bold scale-100 hover:scale-104 hover:brightness-105';
    }
  }

  const handleTouchStart = () => {
    touchTimer.current = setTimeout(() => {
      onToggleAbsent(n);
    }, 600);
  };

  const handleTouchEnd = () => {
    if (touchTimer.current) {
      clearTimeout(touchTimer.current);
    }
  };

  return (
    <button
      onClick={(e) => {
        // Double click handles volunteered. React's onDoubleClick does not always fire on iOS reliably,
        // so single click does normal toggle.
        if (e.detail === 1) {
          onToggleNumber(n);
        } else if (e.detail === 2) {
          onToggleVolunteered(n);
        }
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        onToggleAbsent(n);
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchEnd}
      className={`aspect-square rounded-xl text-base font-mono font-bold border-2 flex items-center justify-center relative select-none cursor-pointer duration-150 transition-all ${styleClass}`}
    >
      <span>{n}</span>
      {labelExtra && (
        <span className="absolute top-1 right-1.5 text-[9px] leading-tight font-bold">
          {labelExtra}
        </span>
      )}
    </button>
  );
};

const ClassView: React.FC<ClassViewProps> = ({
  classItem,
  onToggleNumber,
  onToggleAbsent,
  onToggleVolunteered,
  onSelectAll,
  onDeselectAll,
  onSelectOdd,
  onSelectEven,
  onClearAbsent,
  onClearVolunteered,
  onDraw,
  onUndoLastDraw,
  onResetQueue,
  onClearHistory,
  onOpenSettings,
  onDuplicate,
  onOpenStats,
}) => {
  const [actionsOpen, setActionsOpen] = useState(false);
  const [animatingDraw, setAnimatingDraw] = useState(false);

  // Setup local data
  const poolSize = classItem.poolSize ?? 30;
  const drawCount = classItem.drawCount ?? 2;
  const absent = classItem.absent ?? [];
  const volunteered = classItem.volunteered ?? [];
  const drawn = classItem.drawnQueue ?? [];

  const activePool = classItem.pool
    .filter((p) => p.included && !absent.includes(p.n) && !volunteered.includes(p.n))
    .map((p) => p.n);

  const excluded = classItem.pool.filter((p) => !p.included).map((p) => p.n);
  const remaining = activePool.filter((n) => !drawn.includes(n));
  const exhausted = activePool.length > 0 && remaining.length === 0;

  const lastEntry = classItem.history.length > 0 ? classItem.history[classItem.history.length - 1] : null;

  // Determine standard labels
  const hasAbsent = absent.length > 0;
  const hasVolunteered = volunteered.length > 0;

  const handleDrawWithAnim = () => {
    setAnimatingDraw(true);
    onDraw();
    setTimeout(() => {
      setAnimatingDraw(false);
    }, 500);
  };

  const isToday = (dateStr: string) => {
    const today = new Date();
    const k = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
      today.getDate()
    ).padStart(2, '0')}`;
    return dateStr === k;
  };

  const polishDate = (ds: string) => {
    const [y, m, d] = ds.split('-');
    return new Date(parseInt(y), parseInt(m) - 1, parseInt(d)).toLocaleDateString('pl-PL', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const canUndo = () => {
    if (classItem.history.length === 0) return false;
    const last = classItem.history[classItem.history.length - 1];
    const lastNums = last.nums ?? [last.n1 ?? '-', last.n2 ?? '-'];
    const dq = classItem.drawnQueue ?? [];
    return lastNums.filter((n) => n !== '-').every((n) => typeof n === 'number' && dq.includes(n));
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* ── Active Class Status Grid Header ── */}
      <div>
        <h2 className="text-xl font-bold text-brand-ink-light dark:text-brand-ink-dark border-l-4 border-brand-accent-light dark:border-brand-accent-dark pl-3 mb-1">
          Pula klasy {classItem.name}
        </h2>
        <p className="text-sm italic text-brand-muted-light dark:text-brand-muted-dark pl-4 font-serif">
          Kliknij numer, aby włączyć; podwójny klik = zgłosił się ✋; prawy klik / przytrzymanie = nieobecny ⊘
        </p>
      </div>

      {/* ── Quick Statistics Indicators ── */}
      <div className="font-mono text-xs text-brand-muted-light dark:text-brand-muted-dark flex flex-wrap gap-x-4 gap-y-1.5 p-3.5 bg-brand-paper-light dark:bg-brand-paper-dark border-1.5 border-brand-line-light dark:border-brand-line-dark rounded-xl shadow-xs">
        <div>
          W puli: <b className="text-brand-green-light dark:text-brand-green-dark font-sans">{activePool.length}</b> / {poolSize}
        </div>
        <div>
          Wylosowani:{' '}
          <span className="font-bold text-brand-gold-light dark:text-brand-gold-dark">
            {drawn.length}
          </span>
        </div>
        <div>
          Pozostało:{' '}
          <span className="font-bold text-brand-accent2-light dark:text-brand-accent2-dark">
            {remaining.length}
          </span>
        </div>
        {hasAbsent && (
          <div className="text-brand-accent-light dark:text-brand-accent-dark font-bold font-sans">
            ⊘ Nieobecni: {absent.length}
          </div>
        )}
        {hasVolunteered && (
          <div className="text-brand-accent2-light dark:text-brand-accent2-dark font-bold font-sans">
            ✋ Zgłoszeni: {volunteered.length}
          </div>
        )}
        {excluded.length > 0 && (
          <div className="w-full text-[11px] leading-relaxed border-t border-brand-line-light/20 pt-1.5 mt-1">
            Wykluczone na stałe numery: {excluded.join(', ')}
          </div>
        )}
      </div>

      {/* ── Standard grid rendering ── */}
      <div className="grid grid-cols-10 gap-2 xs:gap-3 p-1">
        {classItem.pool.slice(0, poolSize).map((p) => (
          <StudentButton
            key={p.n}
            n={p.n}
            included={p.included}
            isAbsent={absent.includes(p.n)}
            isVolunteered={volunteered.includes(p.n)}
            isDrawn={drawn.includes(p.n)}
            onToggleNumber={onToggleNumber}
            onToggleAbsent={onToggleAbsent}
            onToggleVolunteered={onToggleVolunteered}
          />
        ))}
      </div>

      {/* ── Collapsible Active Actions menu drawer ── */}
      <div className="action-menu-wrapper select-none">
        <button
          onClick={() => setActionsOpen(!actionsOpen)}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-1.5 border-brand-accent2-light dark:border-brand-accent2-dark text-brand-accent2-light dark:text-brand-accent2-dark rounded-lg cursor-pointer bg-brand-paper-light dark:bg-brand-paper-dark transition-all duration-150 outline-none ${
            actionsOpen ? 'bg-brand-bg-light dark:bg-brand-bg-dark' : ''
          }`}
        >
          <span>⚙️ Akcje klasy</span>
          <ChevronDown
            className={`w-3.5 h-3.5 duration-200 transition-all ${actionsOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {actionsOpen && (
          <div className="mt-2.5 bg-brand-paper-light dark:bg-brand-paper-dark border border-brand-line-light dark:border-brand-line-dark rounded-xl shadow-lg overflow-hidden animate-fade-in duration-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-brand-line-light dark:bg-brand-line-dark">
              <button
                onClick={() => {
                  onSelectAll();
                  setActionsOpen(false);
                }}
                className="py-3 px-4 bg-brand-paper-light dark:bg-brand-paper-dark text-brand-ink2-light dark:text-brand-ink2-dark font-bold text-sm text-center border-none cursor-pointer duration-100 hover:bg-brand-bg-light dark:hover:bg-brand-bg-dark"
              >
                ✅ Zaznacz wszystkie
              </button>
              <button
                onClick={() => {
                  onDeselectAll();
                  setActionsOpen(false);
                }}
                className="py-3 px-4 bg-brand-paper-light dark:bg-brand-paper-dark text-brand-ink2-light dark:text-brand-ink2-dark font-bold text-sm text-center border-none cursor-pointer duration-100 hover:bg-brand-bg-light dark:hover:bg-brand-bg-dark"
              >
                ☐ Odznacz wszystkie
              </button>
              <button
                onClick={() => {
                  onSelectOdd();
                  setActionsOpen(false);
                }}
                className="py-3 px-4 bg-brand-paper-light dark:bg-brand-paper-dark text-brand-ink2-light dark:text-brand-ink2-dark font-bold text-sm text-center border-none cursor-pointer duration-100 hover:bg-brand-bg-light dark:hover:bg-brand-bg-dark"
              >
                ① Nieparzyste
              </button>
              <button
                onClick={() => {
                  onSelectEven();
                  setActionsOpen(false);
                }}
                className="py-3 px-4 bg-brand-paper-light dark:bg-brand-paper-dark text-brand-ink2-light dark:text-brand-ink2-dark font-bold text-sm text-center border-none cursor-pointer duration-100 hover:bg-brand-bg-light dark:hover:bg-brand-bg-dark"
              >
                ② Parzyste
              </button>

              <button
                onClick={() => {
                  onOpenSettings();
                  setActionsOpen(false);
                }}
                className="py-3 px-4 bg-brand-paper-light dark:bg-brand-paper-dark text-brand-ink2-light dark:text-brand-ink2-dark font-bold text-sm text-center border-none cursor-pointer duration-100 hover:bg-brand-bg-light dark:hover:bg-brand-bg-dark"
              >
                ⚙️ Ustawienia
              </button>
              <button
                onClick={() => {
                  onDuplicate();
                  setActionsOpen(false);
                }}
                className="py-3 px-4 bg-brand-paper-light dark:bg-brand-paper-dark text-brand-ink2-light dark:text-brand-ink2-dark font-bold text-sm text-center border-none cursor-pointer duration-100 hover:bg-brand-bg-light dark:hover:bg-brand-bg-dark"
              >
                📋 Duplikuj klasę
              </button>
              <button
                onClick={() => {
                  onOpenStats();
                  setActionsOpen(false);
                }}
                className="py-3 px-4 bg-brand-paper-light dark:bg-brand-paper-dark text-brand-ink2-light dark:text-brand-ink2-dark font-bold text-sm text-center border-none cursor-pointer duration-100 hover:bg-brand-bg-light dark:hover:bg-brand-bg-dark"
              >
                📊 Statystyki
              </button>

              <div className="contents">
                {hasAbsent && (
                  <button
                    onClick={() => {
                      onClearAbsent();
                      setActionsOpen(false);
                    }}
                    className="py-3 px-4 bg-brand-paper-light dark:bg-brand-paper-dark text-brand-accent-light dark:text-brand-accent-dark font-bold text-sm text-center border-none cursor-pointer duration-100 hover:bg-brand-accent-light/5"
                  >
                    ✅ Wszyscy wrócili ({absent.length})
                  </button>
                )}
                {hasVolunteered && (
                  <button
                    onClick={() => {
                      onClearVolunteered();
                      setActionsOpen(false);
                    }}
                    className="py-3 px-4 bg-brand-paper-light dark:bg-brand-paper-dark text-brand-accent2-light dark:text-brand-accent2-dark font-bold text-sm text-center border-none cursor-pointer duration-100 hover:bg-brand-accent2-light/5"
                  >
                    🙋 Wyczyść zgłoszonych ({volunteered.length})
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Draw Warnings Banners ── */}
      {exhausted ? (
        <div className="p-3 bg-brand-accent-light/10 border-1.5 border-brand-accent-light/25 rounded-xl text-brand-accent-light dark:text-brand-accent-dark text-[13px] font-mono leading-relaxed shadow-sm">
          ⚠️ Wszyscy dostępni uczniowie w klasie zostali już wylosowani! Naciśnij przycisk „Resetuj kolejkę", aby przygotować nową rundę.
        </div>
      ) : drawn.length > 0 ? (
        <div className="p-3 bg-brand-accent2-light/8 border-1.5 border-brand-accent2-light/25 rounded-xl text-brand-accent2-light dark:text-brand-accent2-dark text-[13px] font-mono leading-relaxed shadow-sm">
          🎲 Wylosowanych: <b>{drawn.length}</b> z {activePool.length} &nbsp;·&nbsp; Zostało w puli:{' '}
          <b>{remaining.length}</b>
          <br />Poczekalnia rundy: {remaining.slice(0, 6).join(', ')}
          {remaining.length > 6 ? '…' : ''}
        </div>
      ) : (
        <div className="p-3 bg-brand-green-light/8 border-1.5 border-brand-green-light/25 rounded-xl text-brand-green-light dark:text-brand-green-dark text-[13px] font-mono leading-relaxed shadow-sm">
          ✓ Nowa runda — wszyscy uczniowie ({activePool.length}) oczekują na wytypowanie.
        </div>
      )}

      {/* ── ACTIVE DRAWING DESK / CARDS ── */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-brand-ink-light dark:text-brand-ink-dark border-l-4 border-brand-accent-light dark:border-brand-accent-dark pl-3">
          Losowanie
        </h2>
        <p className="text-sm italic text-brand-muted-light dark:text-brand-muted-dark pl-4 font-serif">
          Każdy uczeń losowany jest tylko raz. Losujesz {drawCount}{' '}
          {drawCount === 1 ? 'ucznia' : drawCount < 5 ? 'uczniów' : 'uczniów'} naraz.
        </p>

        {/* Draw stage displaying current results */}
        <div className="bg-brand-paper-light dark:bg-brand-paper-dark border-2 border-brand-line-light dark:border-brand-line-dark rounded-2xl p-6 text-center shadow-md relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:height-[4px] before:bg-gradient-to-r before:from-brand-accent-light before:via-brand-gold-light before:to-brand-accent2-light">
          <div className="font-mono text-[11px] tracking-wider uppercase text-brand-muted-light dark:text-brand-muted-dark mb-4 select-none">
            Wylosowane numery klasowe
          </div>

          <div className="flex justify-center items-center gap-6 md:gap-10 py-4 flex-wrap select-none">
            {lastEntry ? (
              (lastEntry.nums ?? [lastEntry.n1 ?? '-', lastEntry.n2 ?? '-']).map((n, i) => (
                <div key={i} className="flex items-center gap-6">
                  {i > 0 && <span className="font-mono text-3xl font-light text-brand-line-light dark:text-brand-line-dark select-none">·</span>}
                  <div
                    style={{ animationDelay: `${i * 0.12}s` }}
                    className={`font-mono text-5xl md:text-7xl font-bold select-none min-w-[2.5rem] duration-300 ${
                      animatingDraw ? 'scale-70 opacity-0' : 'scale-100 opacity-100 animate-[popIn_0.4s_cubic-bezier(0.34,1.56,0.64,1)]'
                    } ${i % 2 === 1 ? 'text-brand-accent2-light dark:text-brand-accent2-dark' : 'text-brand-accent-light dark:text-brand-accent-dark'}`}
                  >
                    {n}
                  </div>
                </div>
              ))
            ) : (
              Array.from({ length: drawCount }).map((_, i) => (
                <div key={i} className="flex items-center gap-6">
                  {i > 0 && <span className="font-mono text-3xl font-light text-brand-line-light dark:text-brand-line-dark select-none">·</span>}
                  <div className="font-mono text-5xl md:text-7xl font-bold text-brand-line-light dark:text-brand-line-dark select-none">
                    —
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="text-[13px] italic text-brand-muted-light dark:text-brand-muted-dark font-serif select-none mt-2">
            {lastEntry && isToday(lastEntry.date) ? 'Ostatnie losowanie wykonane dzisiaj' : 'Brak świeżych losowań z dzisiejszych zajęć'}
          </div>
        </div>

        {/* Main large drawing call to action trigger */}
        <div className="space-y-2 pt-2">
          <button
            onClick={handleDrawWithAnim}
            disabled={exhausted || activePool.length === 0}
            className="w-full py-4 px-6 text-[18px] font-bold tracking-wide uppercase font-serif select-none duration-150 rounded-xl bg-brand-accent-light dark:bg-brand-accent-dark text-white cursor-pointer shadow-xl border-none hover:brightness-110 active:scale-98 disabled:bg-linear-to-b disabled:from-brand-line-light disabled:to-brand-line-light/50 disabled:brightness-100 disabled:shadow-none disabled:cursor-not-allowed dark:disabled:from-slate-700/40 dark:disabled:to-slate-800/20 disabled:text-brand-muted-light dark:disabled:text-brand-muted-dark transition-all"
          >
            {classItem.history.filter((h) => isToday(h.date)).length > 0
              ? `Losuj ${drawCount} ${drawCount === 1 ? 'ucznia' : drawCount < 5 ? 'uczniów' : 'uczniów'} ponownie 🎲`
              : `Rozpocznij losowanie (${drawCount} ${drawCount === 1 ? 'ucznia' : drawCount < 5 ? 'uczniów' : 'uczniów'}) 🎲`}
          </button>

          <div className="flex flex-col sm:flex-row gap-2">
            {canUndo() && (
              <button
                onClick={onUndoLastDraw}
                className="flex-1 py-3 px-4 rounded-xl font-serif font-bold text-sm bg-brand-accent2-light dark:bg-brand-accent2-dark text-white shadow-md border-none duration-150 cursor-pointer hover:brightness-110 active:scale-97 select-none flex items-center justify-center gap-2"
              >
                <Undo className="w-4 h-4" />
                <span>↩️ Cofnij ostatnie losowanie</span>
              </button>
            )}

            {exhausted && (
              <button
                onClick={onResetQueue}
                className="flex-1 py-3 px-4 rounded-xl font-serif font-bold text-sm bg-brand-gold-light dark:bg-brand-gold-dark text-white shadow-md border-none duration-150 cursor-pointer hover:brightness-110 active:scale-97 select-none flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4 animate-spin-slow" />
                <span>🔄 Resetuj kolejkę — nowa runda</span>
              </button>
            )}
          </div>

          {!exhausted && remaining.length > 0 && remaining.length < drawCount && (
            <div className="text-xs font-serif italic text-brand-gold-light dark:text-brand-gold-dark text-center">
              ⚠️ Uwaga: W puli pozostało tylko {remaining.length}{' '}
              {remaining.length === 1 ? 'uczeń' : remaining.length < 5 ? 'uczniów' : 'uczniów'}. Puste pola zostaną zastąpione symbolem „-".
            </div>
          )}

          {activePool.length < drawCount && activePool.length > 0 && (
            <div className="text-xs font-serif italic text-brand-accent-light dark:text-brand-accent-dark text-center">
              Włącz dodatkowych uczniów do puli, by w pełni zapełnić losowanie ({drawCount} miejsc).
            </div>
          )}
        </div>
      </div>

      {/* ── CHRONOLOGICAL HISTORIC LEDGER LIST ── */}
      <div className="pt-4 space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-brand-ink-light dark:text-brand-ink-dark border-l-4 border-brand-accent-light dark:border-brand-accent-dark pl-3">
            Historia losowań
          </h2>
          {classItem.history.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Czy na pewno wyczyścić kompletną historię losowań tej klasy?')) {
                  onClearHistory();
                }
              }}
              className="px-3 py-1.5 text-xs font-serif font-semibold border border-brand-accent-light dark:border-brand-accent-dark text-brand-accent-light dark:text-brand-accent-dark bg-transparent rounded-lg cursor-pointer duration-100 select-none flex items-center gap-1.5 hover:bg-brand-accent-light hover:text-white dark:hover:bg-brand-accent-dark"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Wyczyść historię</span>
            </button>
          )}
        </div>

        <div className="bg-brand-paper-light dark:bg-brand-paper-dark border border-brand-line-light dark:border-brand-line-dark rounded-xl shadow-xs overflow-hidden">
          <div className="grid grid-cols-2 bg-brand-line-light/40 dark:bg-brand-line-dark/40 px-4 py-2 text-[10.5px] font-mono tracking-wider uppercase text-brand-muted-light select-none">
            <div>Data lekcji</div>
            <div className="text-right">Wybrane numery</div>
          </div>

          <div className="divide-y divide-brand-line-light dark:divide-brand-line-dark font-serif text-[14.5px]">
            {classItem.history.length === 0 ? (
              <p className="text-center italic py-10 text-brand-muted-light dark:text-brand-muted-dark select-none">
                Brak historycznych wpisów dla tej klasy w pamięci.
              </p>
            ) : (
              [...classItem.history]
                .reverse()
                .map((h, idx) => {
                  const today = isToday(h.date);
                  const isCurrent = idx === 0;
                  const finalNums = h.nums ?? [h.n1 ?? '-', h.n2 ?? '-'];

                  return (
                    <div
                      key={idx}
                      className={`grid grid-cols-2 px-4 py-3 items-center transition-colors ${
                        isCurrent
                          ? 'bg-brand-gold-light/10 text-brand-ink-light dark:text-brand-ink-dark font-semibold'
                          : 'even:bg-brand-line-light/5'
                      }`}
                    >
                      <div className="flex items-center gap-2 select-none">
                        <span>{polishDate(h.date)}</span>
                        {today && (
                          <span className="text-[10px] font-mono tracking-wide rounded-sm bg-brand-gold-light dark:bg-brand-gold-dark text-white px-1.5 py-0.2">
                            dziś
                          </span>
                        )}
                      </div>
                      <div className="text-right font-mono font-bold text-[15px] space-x-1 tracking-wide select-none">
                        {finalNums.map((num, i) => (
                          <span
                            key={i}
                            className={
                              num === '-'
                                ? 'text-brand-muted-light opacity-55'
                                : i % 2 === 1
                                ? 'text-brand-accent2-light dark:text-brand-accent2-dark'
                                : 'text-brand-accent-light dark:text-brand-accent-dark'
                            }
                          >
                            {num}
                            {i < finalNums.length - 1 && ', '}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassView;
