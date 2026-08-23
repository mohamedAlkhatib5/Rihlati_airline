import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { MAIN_CONTENT_ID } from '../../constants/dom';

/**
 * Restores scroll position and keyboard focus on navigation.
 *
 * - Jumps instantly to the top (smooth scrolling from the bottom of a long page
 *   makes the previous page's content race past the viewer).
 * - Honours `#section` links from the footer.
 * - Moves focus into `<main>` so screen-reader and keyboard users are told the
 *   page changed instead of staying on a link that no longer exists.
 */
export function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.slice(1));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    const main = document.getElementById(MAIN_CONTENT_ID);
    main?.focus({ preventScroll: true });
  }, [pathname, hash]);

  return null;
}
