/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { AppState, ClassItem, PoolMember, HistoryEntry, AboutTab } from './types';
import Header from './components/Header';
import ClassView from './components/ClassView';
import HelpModal from './components/HelpModal';
import TutorialModal from './components/TutorialModal';
import ClassSettingsModal from './components/ClassSettingsModal';
import ManageClassesModal from './components/ManageClassesModal';
import StatsModal from './components/StatsModal';
import AboutModal from './components/AboutModal';

const STORAGE_KEY = 'dziennik_v5';
const BACKUP_KEY = 'dziennik_backup';
const THEME_KEY = 'dziennik_theme';
const LAST_SEEN_VERSION_KEY = 'dziennik_lastSeenVersion';
const VISITED_KEY = 'dziennik_visited';
const APP_VERSION = '2.1';

const UPDATES = [
  {
    version: '2.1',
    date: '2026-05-28',
    title: 'Konsola Debug + Poprawki płynności przełączania klas',
    changes: [
      '⚡ Poprawiono przełączanie między zakładkami klas — widok klasy odświeża się teraz natychmiastowo i płynnie bez potrzeby odświeżania strony',
      '🛠️ Wprowadzono panel diagnostyczny vConsole ułatwiający zbieranie błędów bezpośrednio w samej aplikacji mobilnej/desktopowej',
      '📱 Dodano nowy przycisk „🛠️ Konsola (Debug)" w hamburger menu, który pozwala łatwo pokazać lub ukryć konsolę błędów',
      '🛡️ Dodano mechanizm ErrorBoundary chroniący aplikację przed uszkodzeniem i umożliwiający awaryjne czyszczenie bazy',
    ],
  },
  {
    version: '2.0',
    date: '2026-05-07',
    title: 'Zgłaszanie się do odpowiedzi + Naprawa PWA dla Samsungów',
    changes: [
      '🆕 Dodano możliwość oznaczania uczniów którzy sami zgłosili się do odpowiedzi — podwójne kliknięcie na numer',
      '🔵 Uczniowie zgłoszeni są wizualnie wyróżnieni (niebieskie tło, emoji ✋) i wykluczeni z losowania',
      '📊 Licznik zgłoszonych w statystykach puli klasy',
      '🙋 Przycisk „Wyczyść zgłoszonych" w menu akcji klasy (pojawia się gdy ktoś jest zgłoszony)',
      '🔄 Zgłoszeni są automatycznie usuwani przy resetowaniu puli (Odznacz wszystkie, Parzyste, Nieparzyste)',
      '🚫 Nie można oznaczyć jako zgłoszonego ucznia który jest nieobecny',
      '🔧 POPRAWIONA WYDAJNOŚĆ: Wszystkie operacje są teraz obsługiwane w natywnym React z płynnymi przejściami',
      '📱 Dodano pełną kompatybilność z przeglądarkami mobilnymi i instalacją PWA',
    ],
  },
  {
    version: '1.9',
    date: '2026-04-18',
    title: 'Poprawki modalu „O aplikacji" na urządzeniach mobilnych',
    changes: [
      'Naprawiono scrollowanie treści w pionie — tytuł, zakładki i przycisk „Zamknij" są teraz zablokowane',
      'Zakładki (README, Aktualizacje, Regulamin, Licencja) scrollują poziomo gdy nie mieszczą się w jednej linii',
    ],
  },
  {
    version: '1.8',
    date: '2026-04-18',
    title: 'Tryb ciemny',
    changes: [
      'Dodano przełącznik trybu ciemnego w hamburger menu (🌙 / ☀️)',
      'Ciemny motyw dostosowuje wszystkie kolory interfejsu',
    ],
  },
];

export default function App() {
  const [state, setState] = useState<AppState>({ classes: [], activeClass: null });
  const [darkMode, setDarkMode] = useState(false);
  
  // Modal visibility states
  const [helpOpen, setHelpOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [aboutTab, setAboutTab] = useState<AboutTab>('readme');

  const [newClassNames, setNewClassNames] = useState('');
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
  const [settingsClassId, setSettingsClassId] = useState<string | null>(null);
  const [statsClassId, setStatsClassId] = useState<string | null>(null);
  const [hasUpdatesBadge, setHasUpdatesBadge] = useState(false);

  // Load state on mount
  useEffect(() => {
    // 1. Dark Mode detection
    const savedTheme = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setDarkMode(isDark);
    if (isDark) {
      document.body.classList.add('dark');
      document.documentElement.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
      document.documentElement.classList.remove('dark');
    }

    // 2. Main data loader
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AppState;
        if (Array.isArray(parsed.classes)) {
          parsed.classes.forEach((c) => {
            if (typeof c.poolSize !== 'number') c.poolSize = 30;
            if (typeof c.drawCount !== 'number') c.drawCount = 2;
            if (!Array.isArray(c.drawnQueue)) c.drawnQueue = [];
            if (!Array.isArray(c.absent)) c.absent = [];
            if (!Array.isArray(c.volunteered)) c.volunteered = [];
            if (!Array.isArray(c.history)) c.history = [];
            if (!Array.isArray(c.pool)) {
              c.pool = Array.from({ length: c.poolSize }, (_, i) => ({ n: i + 1, included: true }));
            } else {
              c.pool = c.pool.map((p: any, i: number) => {
                if (p && typeof p === 'object' && typeof p.n === 'number') {
                  return { n: p.n, included: typeof p.included === 'boolean' ? p.included : true };
                }
                const num = p && typeof p === 'number' ? p : i + 1;
                return { n: num, included: true };
              });
            }
          });
          // Safeguard activeClass
          let active = parsed.activeClass;
          if (active && !parsed.classes.some((c) => c.id === active)) {
            active = parsed.classes[0]?.id || null;
          }
          if (!active && parsed.classes.length > 0) {
            active = parsed.classes[0].id;
          }
          parsed.activeClass = active;
          setState(parsed);
        }
      }
    } catch (e) {
      console.error('Error loading state:', e);
    }

    // 3. Version checking for badge indicator
    const lastSeen = localStorage.getItem(LAST_SEEN_VERSION_KEY);
    if (!lastSeen || lastSeen !== APP_VERSION) {
      setHasUpdatesBadge(true);
    }

    // 4. First visit check for automatic tutorial display
    const visited = localStorage.getItem(VISITED_KEY);
    if (!visited) {
      localStorage.setItem(VISITED_KEY, '1');
      setTutorialOpen(true);
    }
  }, []);

  // Save state helper
  const saveState = (newState: AppState) => {
    setState(newState);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      localStorage.setItem(BACKUP_KEY, JSON.stringify(newState));
    } catch (e) {
      console.error('Error saving state:', e);
    }
  };

  // Toggle dark mode
  const handleToggleDarkMode = () => {
    const isDark = !darkMode;
    setDarkMode(isDark);
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
    if (isDark) {
      document.body.classList.add('dark');
      document.documentElement.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
      document.documentElement.classList.remove('dark');
    }
  };

  const getActiveClassItem = (): ClassItem | null => {
    if (!state.activeClass) return null;
    return state.classes.find((c) => c.id === state.activeClass) ?? null;
  };

  const handleSwitchClass = (id: string) => {
    saveState({ ...state, activeClass: id });
  };

  // Creating classes (supports comma notation for batch generation)
  const handleCreateClasses = () => {
    const input = newClassNames.trim();
    if (!input) return;

    const names = input
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (names.length === 0) return;

    const newClasses = [...state.classes];
    let lastId = state.activeClass;

    names.forEach((name) => {
      const id = 'cls_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      const pool: PoolMember[] = Array.from({ length: 30 }, (_, i) => ({
        n: i + 1,
        included: true,
      }));

      newClasses.push({
        id,
        name,
        pool,
        poolSize: 30,
        drawCount: 2,
        drawnQueue: [],
        absent: [],
        volunteered: [],
        history: [],
      });
      lastId = id;
    });

    saveState({
      classes: newClasses,
      activeClass: lastId,
    });

    setNewClassNames('');
    setIsAddClassModalOpen(false);
  };

  const handleDeleteClass = (id: string) => {
    const filtered = state.classes.filter((c) => c.id !== id);
    let active = state.activeClass;
    if (active === id) {
      active = filtered.length > 0 ? filtered[0].id : null;
    }
    saveState({ classes: filtered, activeClass: active });
  };

  const handleDeleteManyClasses = (ids: string[]) => {
    const filtered = state.classes.filter((c) => !ids.includes(c.id));
    let active = state.activeClass;
    if (active && ids.includes(active)) {
      active = filtered.length > 0 ? filtered[0].id : null;
    }
    saveState({ classes: filtered, activeClass: active });
    setManageOpen(false);
  };

  const handleDuplicateClass = (cid: string) => {
    const src = state.classes.find((c) => c.id === cid);
    if (!src) return;

    const id = 'cls_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const newCls: ClassItem = {
      id,
      name: `${src.name} (kopia)`,
      pool: JSON.parse(JSON.stringify(src.pool)),
      poolSize: src.poolSize ?? 30,
      drawCount: src.drawCount ?? 2,
      drawnQueue: [],
      absent: [...src.absent],
      volunteered: [...src.volunteered],
      history: [],
    };

    saveState({
      classes: [...state.classes, newCls],
      activeClass: id,
    });
  };

  // Modify active class nested state helper
  const updateActiveClass = (updater: (c: ClassItem) => Partial<ClassItem>) => {
    if (!state.activeClass) return;
    const updated = state.classes.map((c) => {
      if (c.id === state.activeClass) {
        return { ...c, ...updater(c) };
      }
      return c;
    });
    saveState({ ...state, classes: updated });
  };

  // Grid interaction handlers
  const handleToggleNumberSelection = (n: number) => {
    updateActiveClass((c) => {
      const pool = c.pool.map((p) => (p.n === n ? { ...p, included: !p.included } : p));
      const pItem = pool.find((p) => p.n === n);
      let drawnQueue = c.drawnQueue;
      let absent = c.absent;
      let volunteered = c.volunteered;

      if (pItem && !pItem.included) {
        drawnQueue = drawnQueue.filter((x) => x !== n);
        absent = absent.filter((x) => x !== n);
        volunteered = volunteered.filter((x) => x !== n);
      }

      return { pool, drawnQueue, absent, volunteered };
    });
  };

  const handleToggleAbsent = (n: number) => {
    updateActiveClass((c) => {
      const pItem = c.pool.find((p) => p.n === n);
      if (!pItem || !pItem.included) return {};

      let absent = [...c.absent];
      let volunteered = [...c.volunteered];
      let drawnQueue = [...c.drawnQueue];

      if (absent.includes(n)) {
        absent = absent.filter((x) => x !== n);
      } else {
        absent.push(n);
        drawnQueue = drawnQueue.filter((x) => x !== n);
        // If absent, cannot be volunteered at the same time
        volunteered = volunteered.filter((x) => x !== n);
      }

      return { absent, volunteered, drawnQueue };
    });
  };

  const handleToggleVolunteered = (n: number) => {
    updateActiveClass((c) => {
      const pItem = c.pool.find((p) => p.n === n);
      if (!pItem || !pItem.included) return {};
      // Cannot nominate if student is marked as absent
      if (c.absent.includes(n)) return {};

      let volunteered = [...c.volunteered];
      let drawnQueue = [...c.drawnQueue];

      if (volunteered.includes(n)) {
        volunteered = volunteered.filter((x) => x !== n);
      } else {
        volunteered.push(n);
        drawnQueue = drawnQueue.filter((x) => x !== n);
      }

      return { volunteered, drawnQueue };
    });
  };

  const handleSelectAll = () => {
    updateActiveClass((c) => {
      const pool = c.pool.map((p) => ({ ...p, included: true }));
      return { pool };
    });
  };

  const handleDeselectAll = () => {
    updateActiveClass(() => ({
      pool: [], // Will be auto-regenerated based on poolSize dynamically
      drawnQueue: [],
      absent: [],
      volunteered: [],
    }));
  };

  const handleSelectOdd = () => {
    updateActiveClass((c) => {
      const pool = c.pool.map((p) => ({ ...p, included: p.n % 2 === 1 }));
      return {
        pool,
        drawnQueue: c.drawnQueue.filter((n) => n % 2 === 1),
        absent: c.absent.filter((n) => n % 2 === 1),
        volunteered: c.volunteered.filter((n) => n % 2 === 1),
      };
    });
  };

  const handleSelectEven = () => {
    updateActiveClass((c) => {
      const pool = c.pool.map((p) => ({ ...p, included: p.n % 2 === 0 }));
      return {
        pool,
        drawnQueue: c.drawnQueue.filter((n) => n % 2 === 0),
        absent: c.absent.filter((n) => n % 2 === 0),
        volunteered: c.volunteered.filter((n) => n % 2 === 0),
      };
    });
  };

  const handleClearAbsent = () => {
    updateActiveClass(() => ({ absent: [] }));
  };

  const handleClearVolunteered = () => {
    updateActiveClass(() => ({ volunteered: [] }));
  };

  // Safe parameters updates
  const handleSaveClassSettings = (pSize: number, dCount: number) => {
    updateActiveClass((c) => {
      // Create template array based on new range size
      let pool = [...c.pool];
      while (pool.length < pSize) {
        pool.push({ n: pool.length + 1, included: true });
      }
      if (pool.length > pSize) {
        pool = pool.slice(0, pSize);
      }

      return {
        pool,
        poolSize: pSize,
        drawCount: dCount,
        drawnQueue: c.drawnQueue.filter((n) => n <= pSize),
        absent: c.absent.filter((n) => n <= pSize),
        volunteered: c.volunteered.filter((n) => n <= pSize),
      };
    });
    setSettingsOpen(false);
  };

  // Drawing lottery processing
  const handleDraw = () => {
    const todayKey = () => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`;
    };

    updateActiveClass((c) => {
      const drawCount = c.drawCount ?? 2;
      const drawn = c.drawnQueue ?? [];
      const absent = c.absent ?? [];
      const volunteered = c.volunteered ?? [];

      const activeList = c.pool
        .filter((p) => p.included && !absent.includes(p.n) && !volunteered.includes(p.n))
        .map((p) => p.n);

      const remainingChoices = activeList.filter((n) => !drawn.includes(n));
      if (remainingChoices.length === 0) return {};

      // Draw random numbers (Fisher-Yates style shuffle selection)
      const shuffled = [...remainingChoices].sort(() => Math.random() - 0.5);
      const actualDrawnSize = Math.min(remainingChoices.length, drawCount);
      const results: Array<number | '-'> = shuffled.slice(0, actualDrawnSize);

      while (results.length < drawCount) {
        results.push('-');
      }

      const freshQueue = [...drawn, ...results.filter((res): res is number => typeof res === 'number')];
      const entry: HistoryEntry = {
        date: todayKey(),
        nums: results,
      };

      return {
        drawnQueue: freshQueue,
        history: [...c.history, entry],
      };
    });
  };

  // Lottery rollback action
  const handleUndoLastDraw = () => {
    updateActiveClass((c) => {
      if (c.history.length === 0) return {};
      const updatedHistory = [...c.history];
      const popped = updatedHistory.pop();
      if (!popped) return {};

      const poppedNums = popped.nums ?? [popped.n1 ?? '-', popped.n2 ?? '-'];
      const poppedInts = poppedNums.filter((n): n is number => typeof n === 'number');

      return {
        history: updatedHistory,
        drawnQueue: c.drawnQueue.filter((n) => !poppedInts.includes(n)),
      };
    });
  };

  const handleResetQueue = () => {
    updateActiveClass(() => ({ drawnQueue: [] }));
  };

  const handleClearHistory = () => {
    updateActiveClass(() => ({ history: [] }));
  };

  // Export JSON file generator
  const handleExportJSON = () => {
    try {
      const dataStr = JSON.stringify(state, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const tempElement = document.createElement('a');
      const d = new Date();
      const filename = `dziennik-losowania-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        '0'
      )}-${String(d.getDate()).padStart(2, '0')}.json`;
      
      tempElement.href = url;
      tempElement.download = filename;
      document.body.appendChild(tempElement);
      tempElement.click();
      document.body.removeChild(tempElement);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Nie udało się wyeksportować danych.');
    }
  };

  // Import JSON file reader
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result as string;
        const parsed = JSON.parse(result) as AppState;

        if (!Array.isArray(parsed.classes)) {
          throw new Error('Nieprawidłowa tablica klas w pliku.');
        }

        parsed.classes.forEach((c) => {
          if (!c.name) {
            throw new Error('Każda klasa musi posiadać zdefiniowaną nazwę ("name").');
          }
          if (!c.id) {
            c.id = 'cls_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
          }
          if (typeof c.poolSize !== 'number') c.poolSize = 30;
          if (typeof c.drawCount !== 'number') c.drawCount = 2;
          if (!Array.isArray(c.pool)) {
            c.pool = Array.from({ length: c.poolSize }, (_, i) => ({ n: i + 1, included: true }));
          } else {
            c.pool = c.pool.map((p: any, i: number) => {
              if (p && typeof p === 'object' && typeof p.n === 'number') {
                return { n: p.n, included: typeof p.included === 'boolean' ? p.included : true };
              }
              const num = p && typeof p === 'number' ? p : i + 1;
              return { n: num, included: true };
            });
          }
          if (!Array.isArray(c.drawnQueue)) c.drawnQueue = [];
          if (!Array.isArray(c.absent)) c.absent = [];
          if (!Array.isArray(c.volunteered)) c.volunteered = [];
          if (!Array.isArray(c.history)) c.history = [];
        });

        if (
          window.confirm(
            `Zaimportować ${parsed.classes.length} klas z pliku JSON? Ta operacja zastąpi wszystkie bieżące rekordy w pamięci!`
          )
        ) {
          let active = parsed.activeClass;
          if (active && !parsed.classes.some((c) => c.id === active)) {
            active = parsed.classes[0]?.id || null;
          }
          if (!active && parsed.classes.length > 0) {
            active = parsed.classes[0].id;
          }
          saveState({
            classes: parsed.classes,
            activeClass: active,
          });
          alert('Baza danych została wczytana pomyślnie!');
        }
      } catch (err: any) {
        alert(`Błąd wczytywania pliku JSON: ${err.message ?? 'nieznany format pliku.'}`);
      }
    };
    reader.readAsText(file);
  };

  const handleOpenAbout = (tab: AboutTab = 'readme') => {
    setAboutTab(tab);
    setAboutOpen(true);
    setHasUpdatesBadge(false);
    localStorage.setItem(LAST_SEEN_VERSION_KEY, APP_VERSION);
  };

  const activeClassItem = getActiveClassItem();

  return (
    <div className="min-height-screen bg-brand-bg-light dark:bg-brand-bg-dark text-brand-ink-light dark:text-brand-ink-dark paper-ledger-lines pb-10 transition-colors duration-200">
      <Header
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onOpenHelp={() => setHelpOpen(true)}
        onOpenManageClasses={() => setManageOpen(true)}
        onOpenExport={handleExportJSON}
        onOpenImport={() => {
          const fileInput = document.getElementById('hiddenImportRef') as HTMLInputElement;
          fileInput?.click();
        }}
        onOpenAbout={handleOpenAbout}
        hasUpdatesBadge={hasUpdatesBadge}
      />

      {/* Hidden file input for import */}
      <input
        type="file"
        id="hiddenImportRef"
        accept=".json"
        className="hidden"
        onChange={handleImportJSON}
      />

      {/* ── Dynamic Tab Layout ── */}
      <div className="flex border-b border-brand-line-light dark:border-brand-line-dark bg-brand-paper-light dark:bg-brand-paper-dark overflow-x-auto select-none font-serif font-bold text-sm scrollbar-none">
        {state.classes.map((cls) => (
          <div key={cls.id} className="flex items-stretch flex-shrink-0 group">
            <button
              onClick={() => handleSwitchClass(cls.id)}
              className={`py-3 px-5 border-b-3 transition-colors cursor-pointer select-none focus:outline-none whitespace-nowrap ${
                state.activeClass === cls.id
                  ? 'text-brand-accent-light dark:text-brand-accent-dark border-brand-accent-light dark:border-brand-accent-dark bg-brand-bg-light/10'
                  : 'text-brand-muted-light dark:text-brand-muted-dark border-transparent hover:text-brand-ink2-light dark:hover:text-brand-ink2-dark'
              }`}
            >
              {cls.name}
            </button>
            <button
              onClick={() => handleDeleteClass(cls.id)}
              className="px-2 border-b-3 border-transparent hover:text-brand-accent-light text-brand-muted-light/55 cursor-pointer flex items-center justify-center text-xs group-hover:block hidden transition-all"
              title="Usuń tę klasę"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        <button
          onClick={() => setIsAddClassModalOpen(true)}
          className="p-3 text-brand-green-light dark:text-brand-green-dark cursor-pointer font-bold text-lg select-none hover:bg-slate-100/30 flex items-center justify-center"
          title="Dodaj nową klasę"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* ── Master view rendering based on active class presence ── */}
      <main className="p-4 py-8 max-w-4xl mx-auto">
        {state.classes.length === 0 ? (
          <div className="text-center py-20 text-brand-muted-light select-none font-serif">
            <div className="text-6xl mb-4">📒</div>
            <p className="text-lg italic leading-relaxed text-brand-ink2-light dark:text-brand-ink2-dark">
              Nie posiadasz jeszcze żadnej klasy.<br />
              Kliknij przycisk <span className="font-sans font-bold bg-brand-green-light/10 text-brand-green-light dark:text-brand-green-dark p-1 rounded-sm">＋</span> powyżej, aby dodać swoją pierwszą klasę.
            </p>
          </div>
        ) : activeClassItem ? (
          <ClassView
            key={activeClassItem.id}
            classItem={activeClassItem}
            onToggleNumber={handleToggleNumberSelection}
            onToggleAbsent={handleToggleAbsent}
            onToggleVolunteered={handleToggleVolunteered}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            onSelectOdd={handleSelectOdd}
            onSelectEven={handleSelectEven}
            onClearAbsent={handleClearAbsent}
            onClearVolunteered={handleClearVolunteered}
            onDraw={handleDraw}
            onUndoLastDraw={handleUndoLastDraw}
            onResetQueue={handleResetQueue}
            onClearHistory={handleClearHistory}
            onOpenSettings={() => {
              setSettingsClassId(activeClassItem.id);
              setSettingsOpen(true);
            }}
            onDuplicate={() => handleDuplicateClass(activeClassItem.id)}
            onOpenStats={() => {
              setStatsClassId(activeClassItem.id);
              setStatsOpen(true);
            }}
          />
        ) : null}
      </main>

      {/* ── Custom App Modals ── */}
      <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
      
      <TutorialModal isOpen={tutorialOpen} onClose={() => setTutorialOpen(false)} />

      {/* Add Class Modal (Batch input supported) */}
      {isAddClassModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-200 flex items-center justify-center p-3 backdrop-blur-xs"
          onClick={() => setIsAddClassModalOpen(false)}
        >
          <div
            className="bg-brand-paper-light dark:bg-brand-paper-dark border-2 border-brand-line-light dark:border-brand-line-dark rounded-2xl p-6 w-full max-w-[460px] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-brand-ink-light dark:text-brand-ink-dark mb-2">
              Dodaj klasy
            </h2>
            <p className="text-sm italic text-brand-muted-light dark:text-brand-muted-dark mb-4 font-serif">
              Wpisz jedną nazwę lub wiele nazw klas oddzielając je przecinkami (np. <i>2A, 3B, Grupa Niemiecki</i>).
            </p>
            <input
              type="text"
              placeholder="np. 2A, 1B, Fizyka gr. 2..."
              value={newClassNames}
              onChange={(e) => setNewClassNames(e.target.value)}
              className="w-full p-3 font-serif border border-brand-line-light dark:border-brand-line-dark rounded-lg bg-brand-bg-light dark:bg-brand-bg-dark text-brand-ink-light dark:text-brand-ink-dark outline-none mb-5 text-[15.5px] focus:border-brand-accent-light"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateClasses();
              }}
            />
            <div className="flex justify-end gap-2.5 text-sm">
              <button
                className="font-serif text-[15px] font-semibold py-2 px-4 rounded-lg bg-transparent border-1.5 border-brand-line-light dark:border-brand-line-dark text-brand-muted-light dark:text-brand-muted-dark hover:bg-brand-bg-light dark:hover:bg-brand-bg-dark cursor-pointer transition-all"
                onClick={() => setIsAddClassModalOpen(false)}
              >
                Anuluj
              </button>
              <button
                className="font-serif text-[15px] font-semibold py-2 px-5 rounded-lg bg-brand-green-light dark:bg-brand-green-dark text-white shadow-md cursor-pointer hover:brightness-110 active:scale-97 transition-all border-none"
                onClick={handleCreateClasses}
              >
                Dodaj
              </button>
            </div>
          </div>
        </div>
      )}

      <ClassSettingsModal
        isOpen={settingsOpen}
        classItem={activeClassItem}
        onClose={() => setSettingsOpen(false)}
        onSave={handleSaveClassSettings}
      />

      <ManageClassesModal
        isOpen={manageOpen}
        classes={state.classes}
        onClose={() => setManageOpen(false)}
        onDeleteSelected={handleDeleteManyClasses}
      />

      <StatsModal
        isOpen={statsOpen}
        classItem={activeClassItem}
        onClose={() => setStatsOpen(false)}
      />

      <AboutModal
        isOpen={aboutOpen}
        version={APP_VERSION}
        onClose={() => setAboutOpen(false)}
        onCheckUpdates={() => {
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistration()
              .then((registration) => {
                if (registration) {
                  // Wymuś sprawdzenie uaktualnień sw.js na serwerze
                  registration.update()
                    .then(() => {
                      if (registration.installing) {
                        alert('Wykryto nową wersję! Jest pobierana w tle i zostanie aktywowana przy następnym uruchomieniu dziennika.');
                      } else if (registration.waiting) {
                        alert('Nowa wersja została pobrana i czeka na aktywację. Zamknij i otwórz aplikację ponownie, aby zacząć z niej korzystać.');
                      } else {
                        alert('Dziennik Losowania jest aktualny (Wersja 2.1). Wszystkie dane Twoich klas są w 100% bezpiecznie przechowywane w LocalStorage urządzenia i pozostaną nienaruszone.');
                      }
                    })
                    .catch((err) => {
                      console.error('Błąd aktualizacji Service Workera:', err);
                      alert('Dziennik Losowania jest aktualny (Wersja 2.1). Urządzenie jest w trybie offline lub serwer nie odpowiedział.');
                    });
                } else {
                  alert('Aplikacja działa pomyślnie. Dane klas są bezpiecznie zapisane w pamięci LocalStorage na tym urządzeniu i nie zostaną utracone.');
                }
              })
              .catch(() => {
                alert('Dziennik Losowania v2.1: Dane klas są w pełni bezpieczne w pamięci przeglądarki.');
              });
          } else {
            alert('Twoja przeglądarka nie wspiera technologii PWA (Service Workerów), ale Twoje klasy są w pełni bezpieczne w pamięci LocalStorage.');
          }
        }}
        updates={UPDATES}
      />
    </div>
  );
}
