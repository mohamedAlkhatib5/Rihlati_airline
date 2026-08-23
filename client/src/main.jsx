import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// i18next must be initialised before the first render.
import './i18n';

// Global styles, ordered from vendor defaults to our own design system.
import 'bootstrap/dist/css/bootstrap.min.css';
import './shared/styles/tokens.css';
import './shared/styles/base.css';
import './shared/components/ui/ui.css';

import App from './app/App';
import { AppProviders } from './app/providers/AppProviders';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
);
