import { Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import '../styles/pages/common-page.css';
import '../styles/pages/not-found.css';

export default function NotFound() {
  const navigate = useNavigate();
  const { isArabic } = useLanguage();
  return <section className="not-found-page"><Container className="text-center"><i className="bi bi-cloud-slash" /><h1>404</h1><h2>{isArabic ? 'هذا المسار غير متاح' : 'This route is not available'}</h2><p>{isArabic ? 'ارجع إلى الصفحة الرئيسية وتابع الاستكشاف.' : 'Return to the homepage and continue exploring.'}</p><Button className="primary-action" onClick={() => navigate('/')}>{isArabic ? 'العودة للرئيسية' : 'Back to home'}</Button></Container></section>;
}
