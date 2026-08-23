import { Mail, MapPin, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { COMPANY_CONTACT } from '../../../shared/constants/company';

export function ContactDetails() {
  const { t } = useTranslation();

  const items = [
    {
      id: 'phone',
      Icon: Phone,
      label: t('contact.callUs'),
      value: COMPANY_CONTACT.phone,
      href: COMPANY_CONTACT.phoneHref,
    },
    {
      id: 'email',
      Icon: Mail,
      label: t('contact.email'),
      value: COMPANY_CONTACT.email,
      href: COMPANY_CONTACT.emailHref,
    },
    {
      id: 'office',
      Icon: MapPin,
      label: t('contact.office'),
      value: t('contact.officeValue'),
    },
  ];

  return (
    <ul className="contact-details">
      {items.map(({ id, Icon, label, value, href }) => (
        <li key={id}>
          <span className="contact-details__icon">
            <Icon size={20} aria-hidden="true" />
          </span>
          <span className="contact-details__text">
            <strong>{label}</strong>
            {href ? <a href={href}>{value}</a> : value}
          </span>
        </li>
      ))}
    </ul>
  );
}
