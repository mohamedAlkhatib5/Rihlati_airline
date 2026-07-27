import { Col, Container, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

// تذييل ثنائي اللغة بروابط منظمة وهوفر بسيط
export default function Footer() {
  const { isArabic } = useLanguage();
  return (
    <footer className="site-footer">
      <Container>
        <Row className="g-4">
          <Col lg={4}>
            <Link to="/" className="brand-mark footer-brand">
              <span className="brand-icon">
                <i className="bi bi-airplane-engines-fill" />
              </span>
              Rihlati
            </Link>
            <p>
              {isArabic
                ? "رحلات مدروسة، وجهات ملهمة، وطريقة أبسط لاكتشاف العالم."
                : "Thoughtful journeys, inspiring destinations, and a simpler way to discover the world."}
            </p>
          </Col>
          <Col sm={6} lg={2}>
            <h5>{isArabic ? "الشركة" : "Company"}</h5>
            <Link to="/about">{isArabic ? "من نحن" : "About us"}</Link>
            <Link to="/contact">{isArabic ? "تواصل معنا" : "Contact"}</Link>
            <Link to="/destinations">
              {isArabic ? "الوجهات" : "Destinations"}
            </Link>
          </Col>
          <Col sm={6} lg={3}>
            <h5>{isArabic ? "السفر" : "Travel"}</h5>
            <Link to="/flights">
              {isArabic ? "احجز رحلة" : "Book a flight"}
            </Link>
            <Link to="/#services">
              {isArabic ? "خدمات السفر" : "Travel services"}
            </Link>
            <Link to="/#newsletter">{isArabic ? "العروض" : "Offers"}</Link>
          </Col>
          <Col lg={3}>
            <h5>{isArabic ? "تابع الرحلة" : "Follow the journey"}</h5>
            <div className="social-links">
              <a href="https://www.instagram.com" aria-label="Instagram">
                <i className="bi bi-instagram" />
              </a>
              <a href="https://www.facebook.com" aria-label="Facebook">
                <i className="bi bi-facebook" />
              </a>
              <a href="https://www.youtube.com" aria-label="YouTube">
                <i className="bi bi-youtube" />
              </a>
            </div>
          </Col>
        </Row>
        <div className="footer-bottom">
          © {new Date().getFullYear()} Rihlati.{" "}
          {isArabic ? "مشروع React تجريبي." : "React demo project."}
        </div>
      </Container>
    </footer>
  );
}
