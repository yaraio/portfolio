import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { installTextures } from './paper/textures';
import './styles.css';

installTextures();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
