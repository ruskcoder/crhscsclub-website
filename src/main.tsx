import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '98.css/dist/98.css';
import './styles/base.css';
import './styles/mac.css';
import './styles/boot.css';
import './styles/desktop.css';
import './styles/windows.css';
import './styles/pages.css';
import './styles/mobile.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
