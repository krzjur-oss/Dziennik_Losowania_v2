/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-200 flex items-center justify-center p-3 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-brand-paper-light dark:bg-brand-paper-dark border-2 border-brand-line-light dark:border-brand-line-dark rounded-2xl p-6 w-full max-w-[500px] shadow-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-brand-ink-light dark:text-brand-ink-dark mb-4">
          ❓ Pomoc
        </h2>
        <div className="text-[15px] leading-relaxed text-brand-ink2-light dark:text-brand-ink2-dark font-serif">
          <h3 className="text-base font-bold mb-2 text-brand-accent-light dark:text-brand-accent-dark">
            Skróty i funkcje obsługi
          </h3>
          <table className="w-full border-collapse mb-5 text-sm font-sans">
            <tbody>
              <tr className="border-b border-brand-line-light dark:border-brand-line-dark">
                <td className="py-2.5 font-bold text-brand-ink-light dark:text-brand-ink-dark w-12 text-center">＋</td>
                <td className="py-2.5">Dodaj nową klasę do dziennika</td>
              </tr>
              <tr className="border-b border-brand-line-light dark:border-brand-line-dark">
                <td className="py-2.5 font-bold text-brand-ink-light dark:text-brand-ink-dark text-center">✕</td>
                <td className="py-2.5">Usuń wybraną klasę (kliknięcie w przycisk usuwania)</td>
              </tr>
              <tr className="border-b border-brand-line-light dark:border-brand-line-dark">
                <td className="py-2.5 font-bold text-brand-ink-light dark:text-brand-ink-dark text-center">🗂</td>
                <td className="py-2.5">Zarządzaj klasami (usuwanie zbiorcze)</td>
              </tr>
              <tr className="border-b border-brand-line-light dark:border-brand-line-dark">
                <td className="py-2.5 font-bold text-brand-ink-light dark:text-brand-ink-dark text-center">💾</td>
                <td className="py-2.5">Kopia zapasowa - pobierz jako plik JSON</td>
              </tr>
              <tr className="border-b border-brand-line-light dark:border-brand-line-dark">
                <td className="py-2.5 font-bold text-brand-ink-light dark:text-brand-ink-dark text-center">📂</td>
                <td className="py-2.5">Wczytaj dane z pliku kopii zapasowej JSON</td>
              </tr>
              <tr className="border-b border-brand-line-light dark:border-brand-line-dark">
                <td className="py-2.5 font-bold text-brand-ink-light dark:text-brand-ink-dark text-center">⚙️</td>
                <td className="py-2.5">Zmień rozmiar klasy i ilość losowanych uczniów naraz</td>
              </tr>
              <tr className="border-b border-brand-line-light dark:border-brand-line-dark">
                <td className="py-2.5 font-bold text-brand-ink-light dark:text-brand-ink-dark text-center">↩️</td>
                <td className="py-2.5">Cofnij ostatnie losowanie (usuwa z historii i przywraca pulę)</td>
              </tr>
              <tr className="border-b border-brand-line-light dark:border-brand-line-dark">
                <td className="py-2.5 font-bold text-brand-ink-light dark:text-brand-ink-dark text-center">LPM</td>
                <td className="py-2.5">Pojedyncze kliknięcie włącza / wyłącza numer z losowania</td>
              </tr>
              <tr className="border-b border-brand-line-light dark:border-brand-line-dark">
                <td className="py-2.5 font-bold text-brand-ink-light dark:text-brand-ink-dark text-center">Double</td>
                <td className="py-2.5">Oznacz ucznia jako <b>Zgłoszonego ✋</b> (jest wykluczony z losowania)</td>
              </tr>
              <tr className="border-b border-brand-line-light dark:border-brand-line-dark">
                <td className="py-2.5 font-bold text-brand-ink-light dark:text-brand-ink-dark text-center">PPM</td>
                <td className="py-2.5">Oznacz ucznia jako <b>Nieobecnego ⊘</b> (wykluczony, np. prawy klik / przytrzymanie)</td>
              </tr>
            </tbody>
          </table>

          <h3 className="text-base font-bold mb-2 text-brand-accent-light dark:text-brand-accent-dark">
            Stany i kolorystyka numerów
          </h3>
          <ul className="list-none pl-0 space-y-1.5 mb-5 font-sans text-[14px]">
            <li className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-brand-green-light dark:bg-brand-green-dark"></span>
              <strong>Aktywny</strong> — uczestniczy w losowaniu
            </li>
            <li className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-brand-accent2-light dark:bg-brand-accent2-dark flex items-center justify-center text-[10px] text-white">✋</span>
              <strong>Zgłosił się</strong> — uczeń się zgłosił, wyłączony z losowania (podwójne kliknięcie)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-brand-accent-light dark:bg-brand-accent-dark flex items-center justify-center text-[10px] text-white">⊘</span>
              <strong>Nieobecny</strong> — tymczasowo wykluczony, nadrzędny stan (prawy przycisk/przytrzymanie)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-brand-gold-light dark:bg-brand-gold-dark"></span>
              <strong>Wylosowany</strong> — już wybrany w tej rundzie (nie będzie losowany ponownie)
            </li>
            <li className="flex items-center gap-2 bg-radial opacity-60">
              <span className="w-3.5 h-3.5 rounded-full bg-slate-400 dark:bg-slate-700"></span>
              <strong>Wykluczony</strong> — na stałe wyłączony z puli (brak kropki we włączonych)
            </li>
          </ul>

          <h3 className="text-base font-bold mb-2 text-brand-accent-light dark:text-brand-accent-dark">
            Jak działa losowanie i kolejka?
          </h3>
          <p className="mb-3 font-serif">
            Każdy uczeń z puli aktywnych jest losowany <b>dokładnie raz</b> w rundzie. Po wyczerpaniu pozostałych uczniów na siatce, aplikacja zablokuje losowanie i wyświetli opcję <b>„Resetuj kolejkę"</b>, aby bezpiecznie rozpocząć kolejną rundę. Dotychczasowa historia losowań z poprzednich rund jest w pełni zachowywana.
          </p>
          <p className="mb-4 font-serif">
            Jeśli w puli pozostało mniej dostępnych uczniów niż ustawiona liczba do wylosowania (np. został tylko 1 uczeń, a ustawienie nakazuje losować 2 osoby), program dokona wyboru pozostałego ucznia, a puste pole wypełni symbolem <b>„-"</b>.
          </p>

          <h3 className="text-base font-bold mb-2 text-brand-accent-light dark:text-brand-accent-dark">
            Prywatność i tryb PWA
          </h3>
          <p className="font-serif">
            Wszystkie dane są przechowywane w pamięci lokalnej Twojej przeglądarki (<code>localStorage</code>) na danym urządzeniu. Program nie wysyła żadnych danych na serwer zewnętrzny. Dzięki technologii Progressive Web App podwójnie oszczędzasz czas — po instalacji na ekranie głównym aplikacja działa w 100% offline!
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            className="font-serif text-[15px] font-semibold py-2 px-5 rounded-lg bg-brand-accent-light dark:bg-brand-accent-dark text-white shadow-md cursor-pointer hover:brightness-110 active:scale-97 transition-all"
            onClick={onClose}
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
}
