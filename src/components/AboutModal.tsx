/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState } from 'react';
import { AboutTab } from '../types';

interface AboutModalProps {
  isOpen: boolean;
  version: string;
  onClose: () => void;
  onCheckUpdates: () => void;
  updates: Array<{
    version: string;
    date: string;
    title: string;
    changes: string[];
  }>;
}

export default function AboutModal({
  isOpen,
  version,
  onClose,
  onCheckUpdates,
  updates,
}: AboutModalProps) {
  const [activeTab, setActiveTab] = useState<AboutTab>('readme');

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-200 flex items-center justify-center p-3 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-brand-paper-light dark:bg-brand-paper-dark border-2 border-brand-line-light dark:border-brand-line-dark rounded-2xl w-full max-w-[560px] h-[88vh] max-h-[88vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 pb-0 flex-shrink-0">
          <h2 className="text-xl font-bold text-brand-ink-light dark:text-brand-ink-dark mb-3">
            ℹ️ O aplikacji
          </h2>

          {/* Navigation tabs */}
          <div className="flex gap-0 border-b-2 border-brand-line-light dark:border-brand-line-dark overflow-x-auto scrollbar-none font-serif text-[15px] font-semibold select-none">
            {(
              [
                { id: 'readme', label: '📖 README' },
                { id: 'updates', label: '🆕 Aktualizacje' },
                { id: 'regulamin', label: '📄 Regulamin' },
                { id: 'licencja', label: '⚖️ Licencja' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-3 border-b-3 transition-all cursor-pointer whitespace-nowrap focus:outline-none ${
                  activeTab === tab.id
                    ? 'text-brand-accent-light dark:text-brand-accent-dark border-brand-accent-light dark:border-brand-accent-dark'
                    : 'text-brand-muted-light dark:text-brand-muted-dark border-transparent hover:text-brand-ink2-light dark:hover:text-brand-ink2-dark'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 text-[14px] leading-relaxed text-brand-ink2-light dark:text-brand-ink2-dark font-serif space-y-4">
          {activeTab === 'readme' && (
            <div className="space-y-4">
              <p>
                <b>Dziennik Losowania</b> to w pełni autonomiczna aplikacja typu PWA umożliwiająca bezbłędne i sprawiedliwe losowanie uczniów z dziennika na zajęciach. Idealnie dostosowana na tablety szkolne i telefony.
              </p>

              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-brand-accent-light dark:text-brand-accent-dark mb-1 font-sans">
                  ✨ Główne możliwości
                </h3>
                <ul className="list-disc pl-5 font-sans text-[13.5px] space-y-1">
                  <li>Niezgłębiona ilość klas, z których każda żyje własnym życiem i historią.</li>
                  <li>Tymczasowa nieobecność (wyłącza z puli w sekundę i powraca jednym klikiem).</li>
                  <li><b>✋ Zgłoszenie odpowiedzi</b> (podwójny klik wyklucza z najbliższego wyboru).</li>
                  <li>Możliwość natychmiastowego cofnięcia (↩️) - powrót ucznia do puli losowania.</li>
                  <li>Precyzyjne statystyki najmniej, najbardziej oraz wcale nielosowanych numerów.</li>
                  <li>Eksport i import standardowych baz plików JSON dla bezpiecznej wymiany.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-brand-accent2-light dark:text-brand-accent2-dark mb-1 font-sans">
                  🆕 Nowość: Legendarny system zgłaszania się (v2.0)
                </h3>
                <ul className="list-disc pl-5 font-sans text-[13.5px] space-y-1">
                  <li>🟢 <b>Aktywny</b> — pojedynczy klik (włącz/wyłącz).</li>
                  <li>🔵 <b>Zgłoszony ✋</b> — double-click omija losowanie.</li>
                  <li>🔴 <b>Nieobecny ⊘</b> — prawy przycisk myszy / długie przytrzymanie.</li>
                  <li>🟡 <b>Wylosowany</b> — automatycznie chroniony przed ponownym wylosowaniem.</li>
                  <li>⚫ <b>Wykluczony</b> — usunięty na stałe (szare tło).</li>
                </ul>
              </div>

              <div className="p-3 bg-brand-green-light/7 border border-brand-green-light/20 rounded-lg text-[13.5px] space-y-1">
                <span className="font-bold">📱 Szybka instalacja:</span>
                <p className="font-sans text-[13px] leading-relaxed">
                  Otwórz przeglądarkę na swoim tablecie (Chrome / Safari), wybierz menu wielokropka / udostępniania i kliknij <b>Dodaj do ekranu głównego</b>.
                </p>
              </div>

              <div className="pt-4 border-t border-brand-line-light dark:border-brand-line-dark flex items-center justify-between gap-3 flex-wrap">
                <span className="text-[12.5px] text-brand-muted-light dark:text-brand-muted-dark">
                  Dziennik Losowania v<b>{version}</b> · © 2025–2026 Krzysztof Jureczek
                </span>
                <button
                  onClick={onCheckUpdates}
                  className="bg-brand-accent2-light dark:bg-brand-accent2-dark text-white border-none py-1.5 px-3 rounded-md font-sans font-semibold text-xs cursor-pointer shadow-sm hover:brightness-115 active:scale-97 transition-all"
                >
                  🔄 Sprawdź aktualizacje
                </button>
              </div>
            </div>
          )}

          {activeTab === 'updates' && (
            <div className="space-y-5">
              {updates.map((u) => (
                <div key={u.version} className="border-b border-brand-line-light dark:border-brand-line-dark pb-4 last:border-b-0">
                  <h3 className="text-sm font-bold text-brand-accent-light dark:text-brand-accent-dark mb-1 font-sans">
                    v{u.version} — {u.title} ({u.date})
                  </h3>
                  <ul className="list-disc pl-5 font-sans text-[13.5px] space-y-1 text-brand-ink2-light dark:text-brand-ink2-dark">
                    {u.changes.map((change, i) => (
                      <li key={i}>{change}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'regulamin' && (
            <div className="space-y-4 text-[13.5px]">
              <div>
                <h3 className="font-bold text-brand-accent-light dark:text-brand-accent-dark border-l-3 border-brand-accent-light dark:border-brand-accent-dark pl-2 mb-1">
                  §1. Postanowienia ogólne
                </h3>
                <p>
                  Regulamin określa zasady użytkowania aplikacji internetowej <b>Dziennik Losowań</b>. Właścicielem i autorem oprogramowania jest <b>Krzysztof Jureczek</b>.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-brand-accent-light dark:text-brand-accent-dark border-l-3 border-brand-accent-light dark:border-brand-accent-dark pl-2 mb-1">
                  §2. Przeznaczenie oprogramowania
                </h3>
                <p>
                  Aplikacja jest asystentem edukacyjnym służącym do niekomercyjnego losowania uczniów w placówkach szkolno-wychowawczych.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-brand-accent-light dark:text-brand-accent-dark border-l-3 border-brand-accent-light dark:border-brand-accent-dark pl-2 mb-1">
                  §3. Poufność i dane osobowe
                </h3>
                <p>
                  Aplikacja <b>nie przesyła</b>, nie monitoruje i nie gromadzi żadnych danych na serwerach chmurowych. Wszystko zapisywane jest w pamięci lokalnej (Local Storage) pod następującymi kluczami:
                </p>
                <ul className="list-disc pl-5 space-y-1 font-mono text-[12.5px] mt-1.5 bg-brand-bg-light/40 dark:bg-brand-bg-dark/40 p-2 rounded-lg">
                  <li><code>dziennik_v5</code> - baza aktywnych klas i historii.</li>
                  <li><code>dziennik_backup</code> - automatyczny plik ratunkowy.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-brand-accent-light dark:text-brand-accent-dark border-l-3 border-brand-accent-light dark:border-brand-accent-dark pl-2 mb-1">
                  §4. Odpowiedzialność
                </h3>
                <p>
                  Oprogramowanie jest dostarczane gotowe do pracy. Autor nie odpowiada za ewentualną utratę danych wynikającą z reinstalacji przeglądarki. Regularnie pobieraj <b>Eksport JSON</b>.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'licencja' && (
            <div className="space-y-3 text-[13.5px]">
              <div className="p-3 bg-brand-accent-light/5 border border-brand-accent-light/10 rounded-lg">
                <span className="font-bold text-brand-accent-light dark:text-brand-accent-dark">
                  Copyright (c) 2025–2026 Krzysztof Jureczek
                </span>
                <p className="mt-1 font-mono text-xs text-brand-muted-light">
                  PROJEKT AUTORSKI: Dziennik Losowań
                </p>
              </div>

              <p>
                Niniejszy program należy w pełni do Autora. Udziela się zgody na swobodne użytkowanie niekomercyjne w placówkach szkolnych.
              </p>
              <p>
                Kopiowanie kodu, modyfikowanie, rebranding, powielanie lub jakakolwiek dystrybucja bez wyraźnej pisemnej zgody są prawnie zabronione.
              </p>
              <p className="italic text-brand-muted-light">
                Oprogramowanie jest bezwarunkowo dostarczane w stanie takim, jakim jest (AS IS), bez jakiejkolwiek odpowiedzialności gwarancyjnej.
              </p>
            </div>
          )}
        </div>

        {/* Modal footer footer */}
        <div className="flex justify-end border-t border-brand-line-light dark:border-brand-line-dark p-4 flex-shrink-0 bg-brand-bg-light/30 dark:bg-brand-bg-dark/30">
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
