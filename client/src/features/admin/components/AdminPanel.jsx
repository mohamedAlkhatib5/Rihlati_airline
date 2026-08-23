import { cx } from '../../../shared/lib/classNames';

/** Titled card that every dashboard block sits in. */
export function AdminPanel({
  title,
  description,
  action,
  className,
  children,
}) {
  return (
    <section className={cx('admin-panel', className)}>
      <header className="admin-panel__head">
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}
