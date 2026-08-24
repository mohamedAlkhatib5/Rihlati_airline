import { ChevronDown, FlaskConical, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { ROUTES } from '../../../app/routes/paths';
import { IS_DEMO } from '../../lib/apiClient';
import { DEMO_USERS } from '../../lib/demo/network';
import './demo-notice.css';

/**
 * Shown in the public preview only.
 *
 * Tells the visitor this is a demo, hands over the dashboard credentials, and
 * reloads to a clean state. Never mounted in a real deployment.
 */
export function DemoNotice() {
  const [open, setOpen] = useState(false);

  if (!IS_DEMO) return null;

  return (
    <aside className={`demo-notice${open ? ' demo-notice--open' : ''}`}>
      <button
        type="button"
        className="demo-notice__toggle"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <FlaskConical size={16} aria-hidden="true" />
        <span>Live demo — try everything</span>
        <ChevronDown size={16} aria-hidden="true" className="demo-notice__chevron" />
      </button>

      {open ? (
        <div className="demo-notice__body">
          <p>
            Search flights, book a seat, then sign in to watch the booking appear on the
            operations dashboard. Everything is generated in <strong>your browser</strong> —
            no server, no account, nothing shared.
          </p>

          <Link to={ROUTES.login} className="demo-notice__link">
            Open the dashboard →
          </Link>

          <dl className="demo-notice__accounts">
            {DEMO_USERS.map((user) => (
              <div key={user.email}>
                <dt>{user.role === 'admin' ? 'Administrator' : 'Staff'}</dt>
                <dd>
                  <code>{user.email}</code>
                  <code>{user.password}</code>
                </dd>
              </div>
            ))}
          </dl>

          <button
            type="button"
            className="demo-notice__reset"
            onClick={() => window.location.reload()}
          >
            <RotateCcw size={14} aria-hidden="true" /> Reset the demo
          </button>
        </div>
      ) : null}
    </aside>
  );
}
