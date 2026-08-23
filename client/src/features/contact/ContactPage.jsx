import { Col, Container, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { PageHero } from '../../shared/components/layout/PageHero';
import { PageTransition } from '../../shared/components/layout/PageTransition';
import { SectionTitle } from '../../shared/components/ui/SectionTitle';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { ContactDetails } from './components/ContactDetails';
import { ContactForm } from './components/ContactForm';
import './styles/contact.css';

export default function ContactPage() {
  const { t } = useTranslation();
  useDocumentTitle('nav.contact', 'contact.heroText');

  return (
    <PageTransition>
      <PageHero
        image="istanbul"
        eyebrow={t('contact.heroEyebrow')}
        title={t('contact.heroTitle')}
        text={t('contact.heroText')}
      />

      <section className="section-space page-soft-bg">
        <Container>
          <Row className="g-5 align-items-start">
            <Col lg={5}>
              <SectionTitle
                centered={false}
                eyebrow={t('contact.eyebrow')}
                title={t('contact.title')}
                text={t('contact.text')}
              />
              <ContactDetails />
            </Col>

            <Col lg={7}>
              <ContactForm />
            </Col>
          </Row>
        </Container>
      </section>
    </PageTransition>
  );
}
