import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

window.addEventListener('unhandledrejection', (event) => {
  const msg = String(event.reason?.message || event.reason || "");
  if (msg.includes('Quota') || msg.includes('quota') || msg.includes('Quota limit exceeded') || msg.includes('resource-exhausted')) {
    window.dispatchEvent(new CustomEvent('firebase-quota-exceeded'));
    event.preventDefault(); // Prevent it from showing as an uncaught error
  }
});

window.addEventListener('error', (event) => {
  const msg = String(event.error?.message || event.message || "");
  if (msg.includes('Quota') || msg.includes('quota') || msg.includes('Quota limit exceeded') || msg.includes('resource-exhausted')) {
    window.dispatchEvent(new CustomEvent('firebase-quota-exceeded'));
    event.preventDefault();
  }
});

const originalConsoleError = console.error;
console.error = function(...args) {
  try {
    const msg = args.map(a => typeof a === 'string' ? a : (a?.message || JSON.stringify(a) || String(a))).join(' ');
    if (msg.includes('Quota') || msg.includes('quota') || msg.includes('Quota limit exceeded') || msg.includes('resource-exhausted')) {
      window.dispatchEvent(new CustomEvent('firebase-quota-exceeded'));
      return;
    }
  } catch (e) {
    // Ignore stringify errors
  }
  originalConsoleError.apply(console, args);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
