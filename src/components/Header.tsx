/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useEffect, useRef } from 'react';
import { Menu, HelpCircle, Folder, Save, Upload, Info, Moon, Sun, Terminal } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenHelp: () => void;
  onOpenManageClasses: () => void;
  onOpenExport: () => void;
  onOpenImport: () => void;
  onOpenAbout: (tab?: 'readme' | 'updates') => void;
  hasUpdatesBadge: boolean;
}

export default function Header({
  darkMode,
  onToggleDarkMode,
  onOpenHelp,
  onOpenManageClasses,
  onOpenExport,
  onOpenImport,
  onOpenAbout,
  hasUpdatesBadge,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [vConsoleVisible, setVConsoleVisible] = useState(() => {
    return localStorage.getItem('vconsole_visible') === 'true';
  });

  const handleToggleVConsole = () => {
    const newValue = !vConsoleVisible;
    setVConsoleVisible(newValue);
    try {
      localStorage.setItem('vconsole_visible', String(newValue));
      const vc = (window as any).vConsoleInstance;
      if (vc) {
        if (newValue) {
          vc.showSwitch();
        } else {
          vc.hideSwitch();
        }
      }
    } catch (e) {
      console.warn('Wskazówka: Nie można przełączyć vConsole:', e);
    }
  };

  // Update clock
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setCurrentTime(
        d.toLocaleDateString('pl-PL', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const listener = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, []);

  return (
    <header className="bg-brand-paper-light dark:bg-brand-paper-dark border-b-3 border-double border-brand-line-light dark:border-brand-line-dark px-5 py-3 flex items-center justify-between shadow-lg sticky top-0 z-100 gap-2.5">
      <div className="text-xl font-bold tracking-wide select-none">
        <span className="text-brand-accent-light dark:text-brand-accent-dark">Dziennik</span>{' '}
        <span className="text-brand-ink2-light dark:text-brand-ink2-dark italic font-normal">Losowania</span>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="font-mono text-xs text-brand-muted-light dark:text-brand-muted-dark hidden sm:block">
          {currentTime}
        </div>

        {/* Hamburger dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`w-10 h-10 border-1.5 border-brand-line-light dark:border-brand-line-dark rounded-lg bg-brand-paper-light dark:bg-brand-paper-dark cursor-pointer flex flex-col justify-center items-center gap-1.25 transition-all outline-none ${
              menuOpen ? 'bg-brand-bg-light dark:bg-brand-bg-dark' : ''
            }`}
            aria-label="Skróty menu"
          >
            <span
              className={`w-4.5 h-0.5 bg-brand-ink-light dark:bg-brand-ink-dark rounded-sm transition-all duration-200 ${
                menuOpen ? 'translate-y-1.75 rotate-45' : ''
              }`}
            ></span>
            <span
              className={`w-4.5 h-0.5 bg-brand-ink-light dark:bg-brand-ink-dark rounded-sm transition-all duration-200 ${
                menuOpen ? 'opacity-0' : ''
              }`}
            ></span>
            <span
              className={`w-4.5 h-0.5 bg-brand-ink-light dark:bg-brand-ink-dark rounded-sm transition-all duration-200 ${
                menuOpen ? '-translate-y-1.75 -rotate-44' : ''
              }`}
            ></span>
          </button>

          {menuOpen && (
            <div className="absolute top-[110%] right-0 bg-brand-paper-light dark:bg-brand-paper-dark border-1.5 border-brand-line-light dark:border-brand-line-dark rounded-xl shadow-2xl min-w-[210px] z-300 overflow-hidden font-serif">
              <button
                onClick={() => {
                  onOpenHelp();
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-[14.5px] text-brand-ink-light dark:text-brand-ink-dark font-semibold text-left border-b border-brand-line-light dark:border-brand-line-dark bg-transparent hover:bg-brand-bg-light dark:hover:bg-brand-bg-dark cursor-pointer transition-colors"
              >
                <HelpCircle className="w-4 h-4 text-brand-accent2-light" />
                <span>❓ Pomoc</span>
              </button>

              <button
                onClick={() => {
                  onOpenManageClasses();
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-[14.5px] text-brand-ink-light dark:text-brand-ink-dark font-semibold text-left border-b border-brand-line-light dark:border-brand-line-dark bg-transparent hover:bg-brand-bg-light dark:hover:bg-brand-bg-dark cursor-pointer transition-colors"
              >
                <Folder className="w-4 h-4 text-brand-green-light" />
                <span>🗂 Klasy</span>
              </button>

              <button
                onClick={() => {
                  onOpenExport();
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-[14.5px] text-brand-ink-light dark:text-brand-ink-dark font-semibold text-left border-b border-brand-line-light dark:border-brand-line-dark bg-transparent hover:bg-brand-bg-light dark:hover:bg-brand-bg-dark cursor-pointer transition-colors"
              >
                <Save className="w-4 h-4 text-blue-600" />
                <span>💾 Eksport (JSON)</span>
              </button>

              <button
                onClick={() => {
                  onOpenImport();
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-[14.5px] text-brand-ink-light dark:text-brand-ink-dark font-semibold text-left border-b border-brand-line-light dark:border-brand-line-dark bg-transparent hover:bg-brand-bg-light dark:hover:bg-brand-bg-dark cursor-pointer transition-colors"
              >
                <Upload className="w-4 h-4 text-amber-600" />
                <span>📂 Import (JSON)</span>
              </button>

              <button
                onClick={() => {
                  onOpenAbout();
                  setMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-4 py-3 text-[14.5px] text-brand-ink-light dark:text-brand-ink-dark font-semibold text-left border-b border-brand-line-light dark:border-brand-line-dark bg-transparent hover:bg-brand-bg-light dark:hover:bg-brand-bg-dark cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Info className="w-4 h-4 text-violet-600" />
                  <span>ℹ️ O aplikacji</span>
                </div>
                {hasUpdatesBadge && (
                  <span className="bg-brand-accent-light text-white text-[9px] font-mono rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    !
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  handleToggleVConsole();
                  setMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-4 py-3 text-[14.5px] text-brand-ink-light dark:text-brand-ink-dark font-semibold text-left border-b border-brand-line-light dark:border-brand-line-dark bg-transparent hover:bg-brand-bg-light dark:hover:bg-brand-bg-dark cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Terminal className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                  <span>🛠️ Konsola (Debug)</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-sans leading-none ${vConsoleVisible ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                  {vConsoleVisible ? 'Włączona' : 'Wyłączona'}
                </span>
              </button>

              <button
                onClick={() => {
                  onToggleDarkMode();
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-[14.5px] text-brand-accent2-light dark:text-brand-accent2-dark font-semibold text-left bg-transparent hover:bg-brand-bg-light dark:hover:bg-brand-bg-dark cursor-pointer transition-colors border-t border-brand-line-light dark:border-brand-line-dark"
              >
                {darkMode ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span>☀️ Tryb jasny</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-slate-600" />
                    <span>🌙 Tryb ciemny</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
