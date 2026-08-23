import { SearchX } from 'lucide-react';

/**
 * Shown when a request succeeded but returned nothing.
 *
 * Distinct from an error on purpose: an empty result is a normal outcome, and
 * the copy should say what to try next rather than apologise.
 */
export function EmptyState({
  icon: Icon = SearchX,
  title,
  description,
  action,
}) {
  return (
    <div className="state-block">
      <span className="state-block__icon">
        <Icon size={28} aria-hidden="true" />
      </span>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}
