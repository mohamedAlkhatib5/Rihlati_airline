import { CreditCard, Lock } from 'lucide-react';
import { Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { FormField } from '../../../shared/components/ui/FormField';

/** Detects the brand from the leading digits, the way checkout forms do. */
export function detectBrand(number) {
  const digits = number.replace(/\D/g, '');
  if (/^4/.test(digits)) return 'Visa';
  if (/^5[1-5]|^2[2-7]/.test(digits)) return 'Mastercard';
  if (/^3[47]/.test(digits)) return 'Amex';
  return null;
}

const groupDigits = (value) =>
  value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim();

/**
 * Simulated card entry.
 *
 * The number never leaves the browser: only the brand and last four digits are
 * sent, which is all the confirmation and receipt legitimately need. A real
 * integration would swap this for the gateway's own hosted fields.
 */
export function PaymentFields({ values, errors, onChange }) {
  const { t } = useTranslation();
  const brand = detectBrand(values.cardNumber);

  return (
    <div className="payment-fields">
      <p className="payment-fields__notice">
        <Lock size={16} aria-hidden="true" />
        {t('bookingFlow.paymentNotice')}
      </p>

      <FormField
        controlId="payment-name"
        label={t('bookingFlow.cardName')}
        error={errors.cardName}
      >
        {(field) => (
          <Form.Control
            value={values.cardName}
            onChange={(event) => onChange('cardName', event.target.value)}
            autoComplete="cc-name"
            required
            {...field}
          />
        )}
      </FormField>

      <FormField
        controlId="payment-number"
        label={t('bookingFlow.cardNumber')}
        error={errors.cardNumber}
      >
        {(field) => (
          <div className="payment-fields__card">
            <Form.Control
              value={groupDigits(values.cardNumber)}
              onChange={(event) => onChange('cardNumber', event.target.value)}
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="4242 4242 4242 4242"
              required
              {...field}
            />
            <span className="payment-fields__brand">
              {brand ?? <CreditCard size={18} aria-hidden="true" />}
            </span>
          </div>
        )}
      </FormField>

      <div className="payment-fields__row">
        <FormField
          controlId="payment-expiry"
          label={t('bookingFlow.cardExpiry')}
          error={errors.cardExpiry}
        >
          {(field) => (
            <Form.Control
              value={values.cardExpiry}
              onChange={(event) => onChange('cardExpiry', event.target.value)}
              placeholder="MM/YY"
              inputMode="numeric"
              autoComplete="cc-exp"
              maxLength={5}
              required
              {...field}
            />
          )}
        </FormField>

        <FormField
          controlId="payment-cvc"
          label={t('bookingFlow.cardCvc')}
          error={errors.cardCvc}
        >
          {(field) => (
            <Form.Control
              value={values.cardCvc}
              onChange={(event) => onChange('cardCvc', event.target.value)}
              inputMode="numeric"
              autoComplete="cc-csc"
              maxLength={4}
              placeholder="123"
              required
              {...field}
            />
          )}
        </FormField>
      </div>
    </div>
  );
}
