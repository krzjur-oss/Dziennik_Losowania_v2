import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import './index.css';
import VConsole from 'vconsole';

// Inicjalizacja vConsole do zbierania logów i debugowania na urządzeniach mobilnych
if (typeof window !== 'undefined') {
  // Niektóre środowiska piaskownicy/iframe (np. AI Studio / Cloud Run Preview) definiują window.fetch
  // jako właściwość tylko do odczytu (sam getter na Window prototype).
  // Ponieważ vConsole patchuje globalną funkcję fetch (i inne API), próba prostego przypisania
  // `window.fetch = ...` zgłasza błąd: "TypeError: Cannot set property fetch of #<Window> which has only a getter".
  // Definiujemy właściwość na obiekcie window z pomocniczym setterem, aby vConsole mogło ją bezpiecznie podmienić.
  try {
    const originalFetch = window.fetch;
    if (originalFetch) {
      let currentFetch = originalFetch;
      Object.defineProperty(window, 'fetch', {
        configurable: true,
        enumerable: true,
        get() {
          return currentFetch;
        },
        set(newValue) {
          currentFetch = newValue;
        }
      });
    }
  } catch (e) {
    console.warn('Wskazówka: Nie można było przekonfigurować window.fetch:', e);
  }

  const vcInstance = new VConsole({
    theme: 'dark'
  });
  (window as any).vConsoleInstance = vcInstance;

  // Domyślnie ukrywamy przycisk vConsole, chyba że włączono go w menu Debug
  try {
    const isVisible = localStorage.getItem('vconsole_visible') === 'true';
    if (!isVisible) {
      // Dajemy vConsole chwilę na pełną gotowość w DOM przed wywołaniem hideSwitch
      setTimeout(() => {
        if ((window as any).vConsoleInstance) {
          (window as any).vConsoleInstance.hideSwitch();
        }
      }, 300);
    }
  } catch (e) {
    console.warn('Wskazówka: Nie można było ukryć vConsole:', e);
  }
}

// Register Service Worker for PWA Offline mode
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        console.log('✅ Service Worker zarejestrowany na zakresie:', reg.scope);
      })
      .catch(err => {
        console.error('❌ Service Worker błąd rejestracji:', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
