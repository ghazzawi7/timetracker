import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// ── localStorage WRITE TRAP ──────────────────────────────────────────────────
// Intercepts every write to the main app key and logs when block count drops.
// Remove after the vanishing-blocks bug is identified.
;(function installLsTrap() {
  const SK = 'dayrhythm_v2';
  const _setItem = localStorage.setItem.bind(localStorage);
  localStorage.setItem = function trapSetItem(key, value) {
    if (key === SK) {
      try {
        const next = JSON.parse(value);
        const prev = JSON.parse(localStorage.getItem(SK) || 'null');
        if (prev?.days && next?.days) {
          Object.keys(prev.days).forEach((dk) => {
            const prevCount = (prev.days[dk]?.blocks || []).length;
            const nextCount = (next.days[dk]?.blocks || []).length;
            if (nextCount < prevCount) {
              const stack = new Error().stack;
              console.error(
                `🚨 [LS-TRAP] ${SK}[${dk}]: blocks reduced ${prevCount} → ${nextCount}`,
                { stack }
              );
              try {
                const log = JSON.parse(sessionStorage.getItem('_bwlog') || '[]');
                log.push({ t: new Date().toISOString(), source: 'localStorage', dk, prevCount, nextCount, stack: stack.split('\n').slice(1, 6).join(' | ') });
                if (log.length > 100) log.shift();
                sessionStorage.setItem('_bwlog', JSON.stringify(log));
              } catch {}
            }
          });
        }
      } catch {}
    }
    return _setItem(key, value);
  };
})();
// ── END TRAP ─────────────────────────────────────────────────────────────────

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
