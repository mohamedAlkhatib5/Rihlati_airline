import { useEffect, useState } from "react";
import { Button, Container, Nav, Navbar, Offcanvas } from "react-bootstrap";

import { NavLink, useLocation, useNavigate } from "react-router-dom";

import { useLanguage } from "../context/LanguageContext";

const links = [
  { en: "Home", ar: "الرئيسية", path: "/" },
  { en: "Flights", ar: "الرحلات", path: "/flights" },
  { en: "Destinations", ar: "الوجهات", path: "/destinations" },
  { en: "About", ar: "من نحن", path: "/about" },
  { en: "Contact", ar: "تواصل معنا", path: "/contact" },
];

// نافبار متجاوب بروابط في المنتصف وأزرار في نهاية النافبار
export default function SiteNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [show, setShow] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const { isArabic, toggleLanguage } = useLanguage();

  // تغيير خلفية النافبار عند النزول في الصفحة
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // إغلاق القائمة عند الانتقال إلى صفحة أخرى
  useEffect(() => {
    setShow(false);
  }, [location.pathname]);

  return (
    <Navbar
      expand="lg"
      fixed="top"
      className={`
        site-navbar
        ${scrolled ? "site-navbar--scrolled" : ""}
      `}
    >
      <Container >
        <div className="navbar-layout p-0 m-0">
     
        <Navbar.Brand as={NavLink} to="/" className="brand-mark">
          <span className="brand-icon">
            <i className="bi bi-airplane-engines-fill" />
          </span>

          <span>Rihlati</span>
        </Navbar.Brand>

        {/* زر فتح القائمة في الشاشات الصغيرة */}
        <Navbar.Toggle
          aria-controls="main-menu"
          aria-label="Open navigation menu"
          onClick={() => setShow(true)}
        />

        {/* القائمة الرئيسية */}
        <Navbar.Offcanvas
          id="main-menu"
          placement={isArabic ? "start" : "end"}
          show={show}
          onHide={() => setShow(false)}
          className="nav-offcanvas"
        >
          {/* رأس القائمة الجانبية */}
          <Offcanvas.Header closeButton>
            <Offcanvas.Title className="brand-mark brand-mark--dark">
              <span className="brand-icon">
                <i className="bi bi-airplane-engines-fill" />
              </span>

              <span>Rihlati</span>
            </Offcanvas.Title>
          </Offcanvas.Header>

          <Offcanvas.Body>
            <Nav className="navbar-content">
              {/* روابط النافبار في المنتصف */}
              <div className="navbar-links">
                {links.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    end={link.path === "/"}
                    className={({ isActive }) =>
                      `nav-menu-link ${isActive ? "nav-menu-link--active" : ""}`
                    }
                  >
                    <span>{isArabic ? link.ar : link.en}</span>
                  </NavLink>
                ))}
              </div>

              {/* أزرار النافبار في النهاية */}
            </Nav>
            <div className="navbar-actions d-lg-none d-flex">
              <Button
                type="button"
                className="language-btn"
                onClick={toggleLanguage}
                aria-label="Switch language"
              >
                <i className="bi bi-translate" />

                <span>{isArabic ? "EN" : "العربية"}</span>
              </Button>

              <Button
                type="button"
                className="nav-book-btn"
                onClick={() => navigate("/flights")}
              >
                {isArabic ? "احجز رحلة" : "Book a flight"}
              </Button>
            </div>
          </Offcanvas.Body>
        </Navbar.Offcanvas>

        <div className="navbar-actions d-lg-flex d-none p-0">
          <Button
            type="button"
            className="language-btn"
            onClick={toggleLanguage}
            aria-label="Switch language"
          >
            <i className="bi bi-translate" />

            <span>{isArabic ? "EN" : "العربية"}</span>
          </Button>

          <Button
            type="button"
            className="nav-book-btn"
            onClick={() => navigate("/flights")}
          >
            {isArabic ? "احجز رحلة" : "Book a flight"}
          </Button>
        </div>
        </div>
      </Container>
    </Navbar>
  );
}
