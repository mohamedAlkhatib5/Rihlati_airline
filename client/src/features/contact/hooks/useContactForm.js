import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { api } from '../../../shared/lib/apiClient';

const INITIAL_VALUES = { name: '', email: '', subject: '', message: '' };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_MESSAGE_LENGTH = 10;

/**
 * State, validation and submission for the contact form.
 *
 * Validates locally for instant feedback, then submits to the API — which
 * validates again, because a browser check is a convenience, not a guarantee.
 */
export function useContactForm() {
  const { t } = useTranslation();
  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    async (event) => {
      event.preventDefault();
      const nextErrors = validate();
      setErrors(nextErrors);

      if (Object.keys(nextErrors).length > 0) {
        setStatus(null);
        return;
      }

      setIsSubmitting(true);

      try {
        const response = await api.post('/contact', {
          name: values.name.trim(),
          email: values.email.trim(),
          subject: values.subject.trim(),
          message: values.message.trim(),
        });

        setStatus({ type: 'success', message: response.message });
        setValues(INITIAL_VALUES);
      } catch (caught) {
        setErrors(
          Object.fromEntries(
            Object.entries(caught.errors ?? {}).map(([key, value]) => [
              key,
              value[0],
            ]),
          ),
        );
        setStatus({ type: 'error', message: caught.message });
      } finally {
        setIsSubmitting(false);
      }
    },
    [validate, values],
  );

  return { values, errors, status, isSubmitting, updateField, handleSubmit };
}
