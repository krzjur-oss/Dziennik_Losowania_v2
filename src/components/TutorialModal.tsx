/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TutorialModal({ isOpen, onClose }: TutorialModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-200 flex items-center justify-center p-3 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-brand-paper-light dark:bg-brand-paper-dark border-2 border-brand-line-light dark:border-brand-line-dark rounded-2xl p-6 w-full max-w-[540px] shadow-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-brand-ink-light dark:text-brand-ink-dark mb-4">
          📖 Samouczek — Dziennik Losowania
        </h2>
        
        <div className="text-[15px] leading-relaxed text-brand-ink2-light dark:text-brand-ink2-dark font-serif space-y-4">
          <p>
            <b>Witaj!</b> Ta aplikacja pomaga losować numery uczniów podczas lekcji i zajęć dydaktycznych — w sposób sprawiedliwy, bez powtórzeń, bezpośrednio z tabletu, komputera lub telefonu.
          </p>

          <div>
            <h3 className="text-base font-bold text-brand-accent-light dark:text-brand-accent-dark mb-1">
              1. Zakładanie pierwszej klasy
            </h3>
            <p>
              Kliknij ikonę <b>＋</b> na pasku zakładek, wpisz nazwę klasy (np. <i>2A</i>) lub wpisz wiele nazw oddzielonych przecinkami (np. <i>1A, 2B, 3-Fizyka</i>). Każda klasa ma niezależne ustawienia, listę oraz własną historię.
            </p>
          </div>

          <div>
            <h3 className="text-base font-bold text-brand-accent-light dark:text-brand-accent-dark mb-1">
              2. Statusy uczniów na siatce klasowej
            </h3>
            <p className="mb-1">
              Możesz dostosować status każdego numeru jednym z pięciu intuicyjnych stanów:
            </p>
            <ul className="list-disc pl-5 font-sans text-sm space-y-1">
              <li>🟢 <b>Zielony</b> — aktywny w puli i gotowy do losowania (podstawowy stan).</li>
              <li>🔵 <b>Niebieski z ✋</b> — uczeń zgłosił się sam do odpowiedzi. Oznaczany przez <b>podwójne kliknięcie</b>; jest czasowo wykluczony z losowań.</li>
              <li>🔴 <b>Czerwony z ⊘</b> — nieobecny uczeń. Oznaczany przez <b>prawy przycisk myszy / długie przytrzymanie</b>; nie weźmie udziału w losowaniu.</li>
              <li>🟡 <b>Złoty</b> — uczeń już wylosowany w tej rundzie (chroniony przed kolejnym wylosowaniem aż do zakończenia kolejki).</li>
              <li>⚫ <b>Szary</b> — wykluczony kompletnie (brak kropki włączonej).</li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-bold text-brand-accent-light dark:text-brand-accent-dark mb-1">
              3. Wykonywanie losowania
            </h3>
            <p>
              Kliknij duży, czerwony przycisk <b>„Losuj uczniów"</b>. Aplikacja natychmiast wytypuje wskazaną liczbę uczniów i zapisze wydarzenie w historii ze stemplem czasu. Po wyczerpaniu puli uczniów, kliknij <b>„Resetuj kolejkę"</b>, aby płynnie rozpocząć nową rundę.
            </p>
          </div>

          <div>
            <h3 className="text-base font-bold text-brand-accent-light dark:text-brand-accent-dark mb-1">
              4. Historia losowań i cofanie
            </h3>
            <p>
              Na dole ekranu widoczna jest chronologiczna tabela wszystkich losowań. Jeśli się pomylisz lub wylosujesz kogoś przez przypadek, użyj bezpiecznego fioletowego / niebieskiego przycisku <b>↩️ Cofnij ostatnie losowanie</b>, który bezpiecznie usunie ostatni wpis i przywróci uczniów do puli.
            </p>
          </div>

          <div className="p-3.5 bg-brand-green-light/7 border border-brand-green-light/25 rounded-lg text-sm font-sans text-brand-green-light dark:text-brand-green-dark">
            💡 <b>Wskazówka:</b> Zainstaluj aplikację na telefonie używając opcji Chrome/Safari „Dodaj do ekranu głównego" i ciesz się szybkim działaniem oraz brakiem pasków przeglądarki, pracując offline w klasie!
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            className="font-serif text-[15px] font-semibold py-2 px-6 rounded-lg bg-brand-accent-light dark:bg-brand-accent-dark text-white shadow-md cursor-pointer hover:brightness-110 active:scale-97 transition-all"
            onClick={onClose}
          >
            Rozumiem, zaczynamy!
          </button>
        </div>
      </div>
    </div>
  );
}
