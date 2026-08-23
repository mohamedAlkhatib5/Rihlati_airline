import { Col, Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { ROUTES, SECTIONS } from '../../../app/routes/paths';
import { SOCIAL_LINKS } from '../../constants/company';
import { BrandIcon } from '../ui/BrandIcon';
import { Logo } from '../brand/Logo';
import './site-footer.css';

export function SiteFooter() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <Container>
        <Row className="g-4">
          <Col lg={4}>
            <Link to={ROUTES.home} className="site-footer__brand">
              <Logo tone="light" />
            </Link>
            <p className="site-footer__tagline">{t('footer.tagline')}</p>
          </Col>

          <Col sm={6} lg={2}>
            <h2 className="site-footer__heading">{t('footer.company')}</h2>
            <nav aria-label={t('footer.company')}>
              <Link to={ROUTES.about}>{t('footer.aboutUs')}</Link>
              <Link to={ROUTES.contact}>{t('nav.contact')}</Link>
              <Link to={ROUTES.destinations}>{t('nav.destinations')}</Link>
            </nav>
          </Col>

          <Col sm={6} lg={3}>
            <h2 className="site-footer__heading">{t('footer.travel')}</h2>
            <nav aria-label={t('footer.travel')}>
              <Link to={ROUTES.flights}>{t('common.bookFlight')}</Link>
              <Link to={`${ROUTES.home}#${SECTIONS.services}`}>
                {t('footer.services')}
              </Link>
              <Link to={`${ROUTES.home}#${SECTIONS.newsletter}`}>
                {t('footer.offers')}
              </Link>
            </nav>
          </Col>

          <Col lg={3}>
            <h2 className="site-footer__heading">{t('footer.follow')}</h2>
            <ul className="site-footer__social">
              {SOCIAL_LINKS.map(({ icon, label, href }) => (
                <li key={icon}>
                  <a
                    href={href}
                    aria-label={label}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <BrandIcon name={icon} />
                  </a>
                </li>
              ))}
            </ul>
          </Col>
        </Row>

        <p className="site-footer__bottom">{t('footer.rights', { year })}</p>
      </Container>
    </footer>
  );
}
