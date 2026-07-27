
import { Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
// Animation Library
import { motion } from 'framer-motion';
// context
import { useLanguage } from '../context/LanguageContext';

// بطاقة وجهة تفاعلية مع تكبير الصورة وحركة السهم حسب الاتجاه
export default function DestinationCard({ destination }) {
  const navigate = useNavigate();
  const { isArabic } = useLanguage();
  const lang = isArabic ? 'ar' : 'en';

  return (
    <motion.div whileHover={{ y: -10 }} transition={{ duration: 0.28 }} className="h-100">
      <Card className="destination-card h-100">
        <div className="destination-card__image-wrap">
          <Card.Img src={destination.image} alt={destination.city[lang]} loading="lazy" />
          <span className="destination-card__tag">{isArabic ? 'رائجة' : 'Popular'}</span>
        </div>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start gap-3">
            <div><Card.Title>{destination.city[lang]}</Card.Title><Card.Text>{destination.country[lang]}</Card.Text></div>
            <div className="destination-price"><small>{isArabic ? 'ابتداءً من' : 'from'}</small>${destination.price}</div>
          </div>
          <Button className="card-link-btn" onClick={() => navigate('/flights')}>{isArabic ? 'احجز الآن' : 'Book now'} <i className={`bi ${isArabic ? 'bi-arrow-left' : 'bi-arrow-right'}`} /></Button>
        </Card.Body>
      </Card>
    </motion.div>
  );
}
