import { Container } from "react-bootstrap";
// components
import BookingForm from "../components/BookingForm";
// SectionTitle 
import SectionTitle from "../components/SectionTitle";
// useLanguage
import { useLanguage } from "../context/LanguageContext";
// css
import "../styles/pages/common-page.css";
import "../styles/pages/flights.css";
export default function Flights() {
  const { isArabic } = useLanguage();
  return (
    <>
      <section className="page-hero page-hero--flights">
        <Container>
          <span className="eyebrow text-white-50">
            {isArabic ? "احجز بثقة" : "Book with confidence"}
          </span>
          <h1>
            {isArabic
              ? "اعثر على الرحلة المناسبة لخطتك"
              : "Find the flight that fits your journey"}
          </h1>
          <p>
            {isArabic
              ? "اختر الوجهة والتاريخ ودرجة السفر بخطوات بسيطة وواضحة."
              : "Choose your route, travel date, and cabin in a few simple steps."}
          </p>
        </Container>
 
      </section>
      <section className="section-space page-soft-bg">
            <Container  className="p-0">
          <BookingForm  />
      
         
        </Container>
      </section>
    </>
  );
}
