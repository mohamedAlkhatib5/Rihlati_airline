import { useState } from 'react';
import { Container } from 'react-bootstrap';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { SECTIONS } from '../../../app/routes/paths';
import { StatusMessage } from '../../../shared/components/ui/StatusMessage';
import { api } from '../../../shared/lib/apiClient';
import { useLanguage } from '../../../i18n/useLanguage';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function NewsletterSection() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!EMAIL_PATTERN.test(email.trim())) {
      setStatus({ type: 'error', message: t('newsletter.invalid') });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post('/newsletter', {
        email: email.trim(),
        locale: language,
      });
      setStatus({ type: 'success', message: response.message });
      setEmail('');
    } catch (caught) {
      setStatus({ type: 'error', message: caught.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="newsletter" id={SECTIONS.newsletter}>
      <Container>
        <motion.div
          className="newsletter__box"
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.45 }}
        >
          <div className="newsletter__copy">
            <span className="eyebrow eyebrow--on-dark">
              {t('newsletter.eyebrow')}
            </span>
            <h2>{t('newsletter.title')}</h2>
          </div>

          <div className="newsletter__form-wrap">
            <form
              className="newsletter__form"
              onSubmit={handleSubmit}
              noValidate
            >
              <label className="visually-hidden" htmlFor="newsletter-email">
                {t('newsletter.emailLabel')}
              </label>
              <input
                id="newsletter-email"
                type="email"
                name="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setStatus(null);
                }}
                placeholder={t('newsletter.placeholder')}
                autoComplete="email"
              />
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t('common.loading') : t('newsletter.submit')}
              </button>
            </form>

            <AnimatePresence>
              {status && (
                <StatusMessage
                  key={status.message}
                  status={status.type}
                  className="newsletter__status"
                >
                  {status.message}
                </StatusMessage>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
