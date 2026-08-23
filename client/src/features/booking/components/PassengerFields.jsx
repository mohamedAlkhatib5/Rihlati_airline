import { Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { FormField } from '../../../shared/components/ui/FormField';

/**
 * Details for one traveller.
 *
 * Names are the only required fields: a demo booking should not demand a
 * passport number, but the field is there because a real one would.
 */
export function PassengerFields({ index, values, errors, onChange }) {
  const { t } = useTranslation();
  const id = (field) => `passenger-${index}-${field}`;
  const error = (field) => errors?.[`passengers.${index}.${field}`];

  return (
    <fieldset className="passenger-card">
      <legend>{t('bookingFlow.travellerNumber', { number: index + 1 })}</legend>

      <div className="passenger-card__grid">
        <FormField
          controlId={id('firstName')}
          label={t('bookingFlow.firstName')}
          error={error('firstName')}
        >
          {(field) => (
            <Form.Control
              value={values.firstName}
              onChange={(event) =>
                onChange(index, 'firstName', event.target.value)
              }
              autoComplete="given-name"
              required
              {...field}
            />
          )}
        </FormField>

        <FormField
          controlId={id('lastName')}
          label={t('bookingFlow.lastName')}
          error={error('lastName')}
        >
          {(field) => (
            <Form.Control
              value={values.lastName}
              onChange={(event) =>
                onChange(index, 'lastName', event.target.value)
              }
              autoComplete="family-name"
              required
              {...field}
            />
          )}
        </FormField>

        <FormField
          controlId={id('type')}
          label={t('bookingFlow.travellerType')}
        >
          {(field) => (
            <Form.Select
              value={values.type}
              onChange={(event) => onChange(index, 'type', event.target.value)}
              {...field}
            >
              <option value="adult">{t('admin.passengerType.adult')}</option>
              <option value="child">{t('admin.passengerType.child')}</option>
              <option value="infant">{t('admin.passengerType.infant')}</option>
            </Form.Select>
          )}
        </FormField>

        <FormField
          controlId={id('dateOfBirth')}
          label={t('bookingFlow.dateOfBirth')}
          error={error('dateOfBirth')}
        >
          {(field) => (
            <Form.Control
              type="date"
              value={values.dateOfBirth}
              onChange={(event) =>
                onChange(index, 'dateOfBirth', event.target.value)
              }
              {...field}
            />
          )}
        </FormField>

        <FormField
          controlId={id('passportNumber')}
          label={t('bookingFlow.passport')}
          error={error('passportNumber')}
          className="passenger-card__wide"
        >
          {(field) => (
            <Form.Control
              value={values.passportNumber}
              onChange={(event) =>
                onChange(index, 'passportNumber', event.target.value)
              }
              placeholder={t('bookingFlow.passportPlaceholder')}
              {...field}
            />
          )}
        </FormField>
      </div>
    </fieldset>
  );
}
