import { Button, Col, Container, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
// img
import experienceImage from "../assets/images/clouds-real.jpg";
// Animation Library
import { motion } from "framer-motion";

// components
import Hero from "../components/Hero";
import BookingForm from "../components/BookingForm";
import DestinationCard from "../components/DestinationCard";
import SectionTitle from "../components/SectionTitle";
//daTa
import { destinations, features } from "../data/siteData";
// context
import { useLanguage } from "../context/LanguageContext";
// css
import "../styles/home.css";

export default function Home() {
  const navigate = useNavigate();
  const { isArabic } = useLanguage();
  const lang = isArabic ? "ar" : "en";

  return (
    <>
      {/* *********************Hero********************* */}
      <Hero />
      {/* *********************BookingForm********************* */}

      <section className="booking-section">
        <Container>
          <BookingForm />
        </Container>
      </section>
      {/* *********************features********************* */}

      <section className="section-space services-section" id="services">
        <Container>
          <SectionTitle
            eyebrow={isArabic ? "لماذا رحلتي؟" : "Why Rihlati"}
            title={
              isArabic
                ? "تجربة سفر أبسط وأكثر متعة"
                : "Travel made simpler and more memorable"
            }
            text={
              isArabic
                ? "كل تفصيل مصمم ليجعل التخطيط لرحلتك أكثر وضوحًا وراحة."
                : "Every detail is designed to make planning your journey clearer, calmer, and more enjoyable."
            }
          />
          <Row className="g-4">
            {features.map((feature, index) => (
              <Col md={4} key={feature.title.en}>
                <motion.div
                  className="feature-card h-100"
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ delay: index * 0.12 }}
                >
                  <div className="feature-icon">
                    <i className={`bi ${feature.icon}`} />
                  </div>
                  <h3>{feature.title[lang]}</h3>
                  <p>{feature.text[lang]}</p>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>
      {/* *********************destinations********************* */}

      <section className="section-space destinations-section">
        {/* line */}
        <div class="custom-shape-divider-top-1785153601">
          <svg
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
              class="shape-fill"
            ></path>
          </svg>
        </div>
        <Container>
          <SectionTitle
            eyebrow={isArabic ? "وجهات رائجة" : "Popular routes"}
            title={
              isArabic
                ? "أماكن تستحق الاكتشاف"
                : "Destinations worth discovering"
            }
            text={
              isArabic
                ? "من المدن الشهيرة إلى الجزر الهادئة، قصتك القادمة تبدأ من هنا."
                : "From iconic cities to peaceful island escapes, your next story starts here."
            }
          />
          <Row className="g-4">
            {destinations.slice(0, 3).map((destination) => (
              <Col md={6} lg={4} key={destination.city.en}>
                <DestinationCard destination={destination} />
              </Col>
            ))}
          </Row>
          <div className="text-center mt-5">
            <Button
              className="secondary-action"
              onClick={() => navigate("/destinations")}
            >
              {isArabic ? "استكشف جميع الوجهات" : "Explore all destinations"}
            </Button>
          </div>
        </Container>

  {/* line */}
        <div class="custom-shape-divider-bottom-1785153917">
    <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" class="shape-fill"></path>
    </svg>
</div>
      </section>
      {/* **********************experience******************** */}

      <section className="experience-section section-space">
        <Container>
          <Row className="align-items-center g-5">
            <Col lg={6}>
              <motion.div
                className="experience-image"
                initial={{ opacity: 0, x: isArabic ? 30 : -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <img
                  src={experienceImage}
                  alt="Airplane wing above the clouds"
                />
                <div className="experience-stat">
                  <strong>120+</strong>
                  <span>{isArabic ? "وجهة عالمية" : "global routes"}</span>
                </div>
              </motion.div>
            </Col>
            <Col lg={6}>
              <SectionTitle
                centered={false}
                eyebrow={isArabic ? "فوق السحاب" : "Above the clouds"}
                title={
                  isArabic
                    ? "خطط لتجربة أجمل"
                    : "Plan a better travel experience"
                }
                text={
                  isArabic
                    ? "اكتشف وجهات مختارة ونصائح واضحة تساعدك على الوصول مستعدًا لما ينتظرك."
                    : "Discover curated destinations and clear guidance that help you arrive ready for what comes next."
                }
              />
              <div className="check-list">
                <span>
                  <i className="bi bi-check2-circle" />{" "}
                  {isArabic
                    ? "خيارات تناسب مختلف الميزانيات"
                    : "Choices for different budgets"}
                </span>
                <span>
                  <i className="bi bi-check2-circle" />{" "}
                  {isArabic
                    ? "معلومات منظمة وسهلة القراءة"
                    : "Clear, organized travel details"}
                </span>
                <span>
                  <i className="bi bi-check2-circle" />{" "}
                  {isArabic
                    ? "تصميم يعمل على جميع الأجهزة"
                    : "A smooth experience on every device"}
                </span>
              </div>
              <Button
                className="primary-action mt-4"
                onClick={() => navigate("/about")}
              >
                {isArabic ? "اكتشف قصتنا" : "Discover our story"}
              </Button>
            </Col>
          </Row>
        </Container>
      </section>
      {/* **********************newsletter******************** */}

      <section className="newsletter-section" id="newsletter">
        <Container>
          <motion.div
            className="newsletter-box"
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div>
              <span className="eyebrow text-white-50">
                {isArabic ? "ابقَ ملهمًا" : "Stay inspired"}
              </span>
              <h2>
                {isArabic
                  ? "استقبل أخبار الوجهات والعروض المختارة"
                  : "Receive destination news and selected offers"}
              </h2>
            </div>
            <form
              className="newsletter-form"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder={
                  isArabic
                    ? "أدخل بريدك الإلكتروني"
                    : "Enter your email address"
                }
                aria-label="Email address"
              />
              <button type="submit">{isArabic ? "اشترك" : "Subscribe"}</button>
            </form>
          </motion.div>
        </Container>
      </section>
    </>
  );
}
