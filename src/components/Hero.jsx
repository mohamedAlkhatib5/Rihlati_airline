import { motion } from "framer-motion";
import { Button, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
// context
import { useLanguage } from "../context/LanguageContext";
// img
import cloudsImage from "../assets/images/Cloud-PNG-12.png";
// القسم الرئيسي للموقع
export default function Hero() {
  const navigate = useNavigate();
  const { isArabic } = useLanguage();

  return (
    <section className="hero-section">
      {/* طبقة داكنة تجعل النص واضحًا فوق الصورة */}
      <div className="hero-overlay" />

      {/* محتوى الهيرو */}
      <Container className="hero-content">
        <motion.div
          className="hero-copy"
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
         >
          <span className="hero-kicker">
            <i className="bi bi-stars" />

            {isArabic ? "عالمك أقرب مما تتخيل" : "Your world is closer"}
          </span>

          <h1>
            {isArabic ? (
              <>
                رحلتك تبدأ هنا.
                <br />
                اكتشف العالم بطريقتك.
              </>
            ) : (
              <>
                Your journey starts here.
                <br />
                Discover the world your way.
              </>
            )}
          </h1>

          <p>
            {isArabic
              ? "خطط لرحلات أكثر ذكاءً مع خيارات مرنة وتجربة حجز واضحة ووجهات تلهمك في كل مرة."
              : "Plan smarter journeys with flexible choices, a clear booking experience, and destinations that inspire every trip."}
          </p>

          <div className="hero-actions d-flex flex-wrap gap-3">
            <Button
              className="primary-action"
              onClick={() => navigate("/flights")}
            >
              {isArabic ? "استكشف الرحلات" : "Explore flights"}
            </Button>

            <Button
              className="hero-secondary"
              onClick={() => navigate("/destinations")}
            >
              {isArabic ? "شاهد الوجهات" : "View destinations"}
            </Button>
          </div>

          <div className="hero-trust-row">
            <span>
              <i className="bi bi-check-circle-fill" />
              {isArabic ? " حجوزات مرنة" : " Flexible booking"}
            </span>

            <span>
              <i className="bi bi-check-circle-fill" />
              {isArabic ? " دفع آمن" : " Secure booking"}
            </span>

            <span>
              <i className="bi bi-check-circle-fill" />
              {isArabic ? " وجهات عالمية" : " Global destinations"}
            </span>
          </div>
        </motion.div>
      </Container>

      {/* الغيوم الخلفية البعيدة */}
      <div className="hero-cloud-row hero-cloud-row--back" aria-hidden="true">
        <img src={cloudsImage} alt="" className="hero-cloud-image" />
        <img src={cloudsImage} alt="" className="hero-cloud-image" />
      </div>

      {/* الغيوم الأمامية القريبة */}
      <div className="hero-cloud-row hero-cloud-row--front" aria-hidden="true">
        <img src={cloudsImage} alt="" className="hero-cloud-image" />
        <img src={cloudsImage} alt="" className="hero-cloud-image" />
      </div>

  
    </section>
  );
}
