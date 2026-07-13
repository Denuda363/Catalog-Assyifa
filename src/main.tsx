import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

// Register PWA service worker
const updateSW = registerSW({
  onNeedRefresh() {
    // Force a reload if the service worker needs a refresh
    if (confirm('Versi aplikasi baru tersedia. Muat ulang sekarang?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('Aplikasi siap digunakan secara offline');
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
