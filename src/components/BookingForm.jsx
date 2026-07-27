import { useState } from "react";
import { Alert, Button, Col, Form, Row } from "react-bootstrap";
// context
import { useLanguage } from "../context/LanguageContext";

const initialForm = {
  tripType: "round",
  from: "",
  to: "",
  departure: "",
  returnDate: "",
  passengers: "1",
  travelClass: "economy",
};

export default function BookingForm({ compact = false }) {
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const { isArabic } = useLanguage();

  const updateField = ({ target: { name, value } }) =>
    setForm((current) => ({ ...current, [name]: value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.from || !form.to || !form.departure) {
      setMessage(
        isArabic
          ? "يرجى إدخال مدينة المغادرة والوجهة وتاريخ السفر."
          : "Please complete the departure city, destination, and travel date.",
      );
      return;
    }
    setMessage(
      isArabic
        ? `اختيار رائع! نبحث عن رحلات من ${form.from} إلى ${form.to}.`
        : `Great choice! We are searching flights from ${form.from} to ${form.to}.`,
    );
  };

  return (
    <div className={`booking-panel ${compact ? "booking-panel--compact" : ""}`}>
      <div className="booking-panel__top">
        <div>
          <span className="eyebrow">
            {isArabic ? "خطط لرحلتك" : "Plan your journey"}
          </span>
          <h2>
            {isArabic ? "ابحث عن رحلتك القادمة" : "Find your next flight"}
          </h2>
        </div>
        <div className="booking-badge">
          <i className="bi bi-cloud-sun-fill" />{" "}
          {isArabic ? "أفضل الخيارات يوميًا" : "Best options daily"}
        </div>
      </div>
      <Form onSubmit={handleSubmit}>
        <Row className="g-3 booking-grid">
          <Col xl={2} md={4}>
            <Form.Label>{isArabic ? "نوع الرحلة" : "Trip type"}</Form.Label>
            <Form.Select
              name="tripType"
              value={form.tripType}
              onChange={updateField}
            >
              <option value="round">
                {isArabic ? "ذهاب وعودة" : "Round trip"}
              </option>
              <option value="one">{isArabic ? "ذهاب فقط" : "One way"}</option>
            </Form.Select>
          </Col>
          <Col xl={2} md={4}>
            <Form.Label>{isArabic ? "من" : "From"}</Form.Label>
            <Form.Control
              name="from"
              value={form.from}
              onChange={updateField}
              placeholder={isArabic ? "دبي" : "Dubai"}
            />
          </Col>
          <Col xl={2} md={4}>
            <Form.Label>{isArabic ? "إلى" : "To"}</Form.Label>
            <Form.Control
              name="to"
              value={form.to}
              onChange={updateField}
              placeholder={isArabic ? "لندن" : "London"}
            />
          </Col>
          <Col xl={2} md={4}>
            <Form.Label>{isArabic ? "المغادرة" : "Departure"}</Form.Label>
            <Form.Control
              type="date"
              name="departure"
              value={form.departure}
              onChange={updateField}
            />
          </Col>
          <Col xl={2} md={4}>
            <Form.Label>{isArabic ? "العودة" : "Return"}</Form.Label>
            <Form.Control
              type="date"
              name="returnDate"
              value={form.returnDate}
              onChange={updateField}
              disabled={form.tripType === "one"}
            />
          </Col>
          <Col xl={2} md={4}>
            <Form.Label>{isArabic ? "المسافرون" : "Passengers"}</Form.Label>
            <Form.Select
              name="passengers"
              value={form.passengers}
              onChange={updateField}
            >
              {[1, 2, 3, 4].map((n) => (
                <option value={n} key={n}>
                  {isArabic
                    ? `${n} مسافر`
                    : `${n} Passenger${n > 1 ? "s" : ""}`}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={6}>
            <Form.Label>{isArabic ? "درجة السفر" : "Travel class"}</Form.Label>
            <Form.Select
              name="travelClass"
              value={form.travelClass}
              onChange={updateField}
            >
              <option value="economy">
                {isArabic ? "السياحية" : "Economy"}
              </option>
              <option value="premium">
                {isArabic ? "السياحية الممتازة" : "Premium Economy"}
              </option>
              <option value="business">
                {isArabic ? "رجال الأعمال" : "Business"}
              </option>
              <option value="first">
                {isArabic ? "الأولى" : "First Class"}
              </option>
            </Form.Select>
          </Col>
          <Col md={6} className="d-flex align-items-end">
            <Button type="submit" className="primary-action w-100">
              <i className="bi bi-search" />{" "}
              {isArabic ? "ابحث عن الرحلات" : "Search flights"}
            </Button>
          </Col>
        </Row>
      </Form>
      {message && (
        <Alert
          className="mt-3 mb-0 booking-alert"
          variant={
            message.includes("يرجى") || message.startsWith("Please")
              ? "warning"
              : "success"
          }
        >
          {message}
        </Alert>
      )}
    </div>
  );
}
