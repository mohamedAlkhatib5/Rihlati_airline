import { Outlet } from 'react-router-dom';

import { MAIN_CONTENT_ID } from '../../constants/dom';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';
import { SkipLink } from './SkipLink';

/**
 * Layout for the public site: skip link, header, main landmark, footer.
 * The dashboard deliberately does not use it — it has its own shell.
 */
export function SiteChrome() {
  return (
    <>
      <SkipLink />
      <SiteHeader />

      {/* `tabIndex={-1}` lets the skip link and route changes move focus here. */}
      <main id={MAIN_CONTENT_ID} className="app-main" tabIndex={-1}>
        <Outlet />
      </main>

      <SiteFooter />
    </>
  );
}
