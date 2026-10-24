import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { installTextures } from './paper/textures';
import { installFonts } from './fonts';
import './styles.css';

installFonts();
installTextures();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
