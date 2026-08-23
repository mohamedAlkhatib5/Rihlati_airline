import { Button, Col, Form, Row } from 'react-bootstrap';
import { AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { FormField } from '../../../shared/components/ui/FormField';
import { StatusMessage } from '../../../shared/components/ui/StatusMessage';
import { useContactForm } from '../hooks/useContactForm';

export function ContactForm() {
  const { t } = useTranslation();
  const { values, errors, status, isSubmitting, updateField, handleSubmit } =
    useContactForm();

  return (
    <Form className="contact-form" onSubmit={handleSubmit} noValidate>
      <Row className="g-3">
        <Col md={6}>
          <FormField
            controlId="contact-name"
            label={t('contact.form.name')}
            error={errors.name}
          >
            {(field) => (
              <Form.Control
                name="name"
                value={values.name}
                onChange={updateField}
                placeholder={t('contact.form.namePlaceholder')}
                autoComplete="name"
                {...field}
              />
            )}
          </FormField>
        </Col>

        <Col md={6}>
          <FormField
            controlId="contact-email"
            label={t('contact.form.email')}
            error={errors.email}
          >
            {(field) => (
              <Form.Control
                type="email"
                name="email"
                value={values.email}
                onChange={updateField}
                placeholder="name@example.com"
                autoComplete="email"
                {...field}
              />
            )}
          </FormField>
        </Col>

        <Col xs={12}>
          <FormField
            controlId="contact-subject"
            label={t('contact.form.subject')}
            error={errors.subject}
          >
            {(field) => (
              <Form.Control
                name="subject"
                value={values.subject}
                onChange={updateField}
                placeholder={t('contact.form.subjectPlaceholder')}
                {...field}
              />
            )}
          </FormField>
        </Col>

        <Col xs={12}>
          <FormField
            controlId="contact-message"
            label={t('contact.form.message')}
            error={errors.message}
          >
            {(field) => (
              <Form.Control
                as="textarea"
                rows={6}
                name="message"
                value={values.message}
                onChange={updateField}
                placeholder={t('contact.form.messagePlaceholder')}
                {...field}
              />
            )}
          </FormField>
        </Col>

        <Col xs={12}>
          <Button
            type="submit"
            className="primary-action"
            disabled={isSubmitting}
          >
            {isSubmitting ? t('common.loading') : t('contact.form.submit')}
          </Button>
        </Col>
      </Row>

      <AnimatePresence>
        {status && (
          <StatusMessage key={status.message} status={status.type}>
            {status.message}
          </StatusMessage>
        )}
      </AnimatePresence>
    </Form>
  );
}
