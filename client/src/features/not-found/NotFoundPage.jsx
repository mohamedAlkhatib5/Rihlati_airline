import { CloudOff } from 'lucide-react';
import { Button, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '../../app/routes/paths';
import { PageTransition } from '../../shared/components/layout/PageTransition';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import './styles/not-found.css';

export default function NotFoundPage() {
  const { t } = useTranslation();
  useDocumentTitle('notFound.title', 'notFound.text');

  return (
    <PageTransition>
      <section className="not-found">
        <Container className="text-center">
          <CloudOff size={64} aria-hidden="true" />
          {/* The status code is decorative; the heading carries the meaning. */}
          <p className="not-found__code" aria-hidden="true">
            {t('notFound.code')}
          </p>
          <h1>{t('notFound.title')}</h1>
          <p className="not-found__text">{t('notFound.text')}</p>
          <Button as={Link} to={ROUTES.home} className="primary-action">
            {t('notFound.cta')}
          </Button>
        </Container>
      </section>
    </PageTransition>
  );
}
