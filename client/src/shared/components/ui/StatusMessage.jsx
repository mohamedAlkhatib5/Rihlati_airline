import { CircleCheckBig, TriangleAlert } from 'lucide-react';
import { motion } from 'framer-motion';

import { cx } from '../../lib/classNames';

const ICONS = {
  success: CircleCheckBig,
  error: TriangleAlert,
};

/**
 * Feedback banner for form submissions.
 *
 * The variant is driven by an explicit `status` value — never by inspecting the
 * message text — and the live region makes screen readers announce it the
 * moment it appears.
 *
 * @param {'success'|'error'} status
 */
export function StatusMessage({ status, children, className }) {
  const Icon = ICONS[status] ?? CircleCheckBig;

  return (
    <motion.p
      className={cx('status-message', `status-message--${status}`, className)}
      role="status"
      aria-live="polite"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Icon size={19} aria-hidden="true" />
      <span>{children}</span>
    </motion.p>
  );
}
