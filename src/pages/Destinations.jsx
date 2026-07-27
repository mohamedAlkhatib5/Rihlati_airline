import { Col, Container, Row } from "react-bootstrap";
// components
import DestinationCard from "../components/DestinationCard";
import SectionTitle from "../components/SectionTitle";
// data
import { destinations } from "../data/siteData";
// context
import { useLanguage } from "../context/LanguageContext";
import "../styles/pages/common-page.css";
import "../styles/pages/destinations.css";

export default function Destinations() {
  const { isArabic } = useLanguage();
  return (
    <>
      <section className="page-hero page-hero--destinations">
        <Container>
          <span className="eyebrow text-white-50">
            {isArabic ? "اكتشف العالم" : "Explore the world"}
          </span>
          <h1>
            {isArabic ? "أماكن جميلة بانتظارك" : "Beautiful places are waiting"}
          </h1>
          <p>
            {isArabic
              ? "اختر مدينة أو شاطئًا أو تجربة ثقافية وابدأ التخطيط لمغامرتك."
              : "Choose a city, beach, or cultural escape and start planning your next adventure."}
          </p>
        </Container>
     
      </section>


      <section className="section-space destinations-page">
        <Container>
          <SectionTitle
            eyebrow={isArabic ? "شبكة الوجهات" : "Our network"}
            title={isArabic ? "وجهات مختارة" : "Featured destinations"}
            text={
              isArabic
                ? "مجموعة من الوجهات الملهمة التي تناسب مختلف أنواع المسافرين."
                : "A curated collection of inspiring routes for every kind of traveler."
            }
          />
          <Row className="g-4">
            {destinations.map((destination) => (
              <Col md={6} lg={4} key={destination.city.en}>
                <DestinationCard destination={destination} />
              </Col>
            ))}
          </Row>
        </Container>
      </section>
    </>
  );
}
