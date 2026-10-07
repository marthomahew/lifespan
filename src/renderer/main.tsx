import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import './styles/global.css';
import './styles/layout.css';
import './styles/screens.css';
import './styles/components.css';
import './styles/features.css';
import './styles/boards.css';
import './styles/portrait.css';
import './styles/cheats.css';
import './styles/newlife.css';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('missing #root');
createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
