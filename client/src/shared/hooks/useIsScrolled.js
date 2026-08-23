import { useEffect, useState } from 'react';

/**
 * Tracks whether the page has scrolled past `threshold`.
 *
 * Reads are throttled through `requestAnimationFrame` so the handler runs at
 * most once per frame, and the listener is passive to keep scrolling smooth.
 */
export function useIsScrolled(threshold = 24) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      setIsScrolled(window.scrollY > threshold);
    };

    const handleScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [threshold]);

  return isScrolled;
}
