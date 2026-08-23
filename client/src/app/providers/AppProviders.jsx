import { MotionConfig } from 'framer-motion';
import { BrowserRouter } from 'react-router-dom';

import { ErrorBoundary } from '../../shared/components/feedback/ErrorBoundary';
import { LanguageProvider } from '../../i18n/LanguageProvider';

/**
 * Every cross-cutting provider, composed in one place.
 *
 * `reducedMotion="user"` makes Framer Motion respect the operating system's
 * "reduce motion" setting, matching what the stylesheets already do for CSS
 * animations.
 */
export function AppProviders({ children }) {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <MotionConfig reducedMotion="user">
          <ErrorBoundary>{children}</ErrorBoundary>
        </MotionConfig>
      </LanguageProvider>
    </BrowserRouter>
  );
}
