import { Col, Container, Row } from "react-bootstrap";
// img
import aboutImage from "../assets/images/hero-airplane-real.jpg";
// title
import SectionTitle from "../components/SectionTitle";
// context
import { useLanguage } from "../context/LanguageContext";
// css
import "../styles/pages/common-page.css";
import "../styles/pages/about.css";

export default function About() {
  const { isArabic } = useLanguage();
  return (
    <>
      <section className="page-hero page-hero--about">
        <Container>
          <span className="eyebrow text-white-50">
            {isArabic ? "عن رحلتي" : "About Rihlati"}
          </span>
          <h1>
            {isArabic
              ? "نربط الناس بالعالم عبر تخطيط أفضل"
              : "Connecting people to the world through better planning"}
          </h1>
          <p>
            {isArabic
              ? "نؤمن أن كل رحلة يجب أن تكون واضحة ومريحة ومليئة بالاحتمالات."
              : "We believe every journey should feel clear, comfortable, and full of possibility."}
          </p>
        </Container>

      </section>
      <section className="section-space">
        <Container>
          <Row className="align-items-center g-5">
            <Col lg={6}>
              <img
                className="about-image"
                src={aboutImage}
                alt="Modern airplane"
              />
            </Col>
            <Col lg={6}>
              <SectionTitle
                centered={false}
                eyebrow={isArabic ? "رؤيتنا" : "Our vision"}
                title={
                  isArabic
                    ? "تجربة سفر عصرية بلمسة إنسانية"
                    : "Modern travel with a human touch"
                }
                text={
                  isArabic
                    ? "رحلتي علامة سفر خيالية صُممت كمشروع React احترافي بهوية واضحة ومكونات قابلة لإعادة الاستخدام وتصميم متجاوب."
                    : "Rihlati is a fictional travel brand created as a polished React portfolio project with a clear identity, reusable components, and responsive layouts."
                }
              />
              <div className="about-values">
                <div>
                  <i className="bi bi-globe2" />
                  <span>
                    <strong>
                      {isArabic ? "نظرة عالمية" : "Global outlook"}
                    </strong>
                    {isArabic
                      ? "وجهات تلهمك لاتصالات وتجارب جديدة."
                      : "Destinations designed around inspiring connections."}
                  </span>
                </div>
                <div>
                  <i className="bi bi-heart" />
                  <span>
                    <strong>
                      {isArabic ? "اهتمام حقيقي" : "Genuine care"}
                    </strong>
                    {isArabic
                      ? "تجربة هادئة وواضحة وشخصية."
                      : "An experience that feels warm, calm, and personal."}
                  </span>
                </div>
                <div>
                  <i className="bi bi-lightning-charge" />
                  <span>
                    <strong>
                      {isArabic ? "سهولة الاستخدام" : "Simple experience"}
                    </strong>
                    {isArabic
                      ? "تنقل سريع ومعلومات واضحة في كل خطوة."
                      : "Fast navigation and clear information at every step."}
                  </span>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
}
