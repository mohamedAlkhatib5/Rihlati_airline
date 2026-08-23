import { useState } from 'react';
import { Button, Container, Form } from 'react-bootstrap';
import { LogIn } from 'lucide-react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '../../app/routes/paths';
import { FormField } from '../../shared/components/ui/FormField';
import { Logo } from '../../shared/components/brand/Logo';
import { PageTransition } from '../../shared/components/layout/PageTransition';
import { StatusMessage } from '../../shared/components/ui/StatusMessage';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { useAuth } from './useAuth';
import './styles/auth.css';

export default function LoginPage() {
  const { t } = useTranslation();
  const { login, canAccessDashboard, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  useDocumentTitle('auth.signIn');

  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated && canAccessDashboard) {
    return (
      <Navigate to={location.state?.from?.pathname ?? ROUTES.admin} replace />
    );
  }

  const updateField = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    try {
      const user = await login(values);
      navigate(user.canAccessDashboard ? ROUTES.admin : ROUTES.home, {
        replace: true,
      });
    } catch (error) {
      setErrors(error.errors ?? {});
      setStatus({ type: 'error', message: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <section className="auth-page">
        <Container className="auth-page__container">
          <div className="auth-card">
            <div className="auth-card__brand">
              <Logo tone="dark" />
            </div>

            <h1>{t('auth.signIn')}</h1>
            <p className="auth-card__lead">{t('auth.signInLead')}</p>

            <Form onSubmit={handleSubmit} noValidate>
              <FormField
                controlId="login-email"
                label={t('auth.email')}
                error={errors.email?.[0]}
                className="mb-3"
              >
                {(field) => (
                  <Form.Control
                    type="email"
                    name="email"
                    value={values.email}
                    onChange={updateField}
                    placeholder="name@example.com"
                    autoComplete="email"
                    required
                    {...field}
                  />
                )}
              </FormField>

              <FormField
                controlId="login-password"
                label={t('auth.password')}
                error={errors.password?.[0]}
                className="mb-4"
              >
                {(field) => (
                  <Form.Control
                    type="password"
                    name="password"
                    value={values.password}
                    onChange={updateField}
                    autoComplete="current-password"
                    required
                    {...field}
                  />
                )}
              </FormField>

              <Button
                type="submit"
                className="primary-action w-100"
                disabled={isSubmitting}
              >
                <LogIn size={18} aria-hidden="true" />
                {isSubmitting ? t('auth.signingIn') : t('auth.signIn')}
              </Button>
            </Form>

            {status && (
              <StatusMessage status={status.type}>
                {status.message}
              </StatusMessage>
            )}

            {/* Demo credentials, so the project can be explored immediately. */}
            <div className="auth-card__hint">
              <p>{t('auth.demoAccounts')}</p>
              <dl>
                <div>
                  <dt>{t('auth.roleAdmin')}</dt>
                  <dd>admin@rihlati.demo · Admin@12345</dd>
                </div>
                <div>
                  <dt>{t('auth.roleStaff')}</dt>
                  <dd>staff@rihlati.demo · Staff@12345</dd>
                </div>
              </dl>
            </div>
          </div>
        </Container>
      </section>
    </PageTransition>
  );
}
