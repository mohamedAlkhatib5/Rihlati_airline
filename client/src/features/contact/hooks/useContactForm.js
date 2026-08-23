import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

const INITIAL_VALUES = { name: '', email: '', subject: '', message: '' };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_MESSAGE_LENGTH = 10;

/** State and validation for the contact form, kept out of the view layer. */
export function useContactForm() {
  const { t } = useTranslation();
  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);

  const updateField = useCallback((event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => {
      if (!current[name]) return current;
      const { [name]: _removed, ...rest } = current;
      return rest;
    });
  }, []);

  const validate = useCallback(() => {
    const nextErrors = {};

    if (values.name.trim().length < 2) {
      nextErrors.name = t('contact.form.errors.name');
    }
    if (!EMAIL_PATTERN.test(values.email.trim())) {
      nextErrors.email = t('contact.form.errors.email');
    }
    if (!values.subject.trim()) {
      nextErrors.subject = t('contact.form.errors.subject');
    }
    if (values.message.trim().length < MIN_MESSAGE_LENGTH) {
      nextErrors.message = t('contact.form.errors.message');
    }

    return nextErrors;
  }, [values, t]);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      const nextErrors = validate();
      setErrors(nextErrors);

      if (Object.keys(nextErrors).length > 0) {
        setStatus(null);
        return;
      }

      // Replaced by a POST to /api/v1/contact in a later phase.
      setStatus({ type: 'success', message: t('contact.form.success') });
      setValues(INITIAL_VALUES);
    },
    [validate, t],
  );

  return { values, errors, status, updateField, handleSubmit };
}
