import { Form } from 'react-bootstrap';

/**
 * A labelled form control with accessible error wiring.
 *
 * `controlId` makes react-bootstrap emit matching `id` / `htmlFor`, and the
 * error message is linked through `aria-describedby` with `aria-invalid`, so
 * screen readers announce both the field name and what went wrong.
 */
export function FormField({ controlId, label, error, children, className }) {
  const errorId = error ? `${controlId}-error` : undefined;

  return (
    <Form.Group controlId={controlId} className={className}>
      <Form.Label>{label}</Form.Label>
      {children({
        isInvalid: Boolean(error),
        'aria-invalid': error ? 'true' : undefined,
        'aria-describedby': errorId,
      })}
      {error && (
        <p className="form-field__error" id={errorId}>
          {error}
        </p>
      )}
    </Form.Group>
  );
}
