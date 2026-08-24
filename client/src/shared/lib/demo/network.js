/**
 * The airline network, mirrored from the Laravel seeders.
 *
 * Kept in the same shape and with the same numbers as
 * `server/database/seeders/{AirportSeeder,AircraftSeeder,FlightSeeder,OfferSeeder}.php`
 * so the demo shows the schedule and the fares the real API would return.
 */

/** IATA, name en/ar, city en/ar, country en/ar. */
export const AIRPORTS = [
  ['DXB', 'Dubai International', 'مطار دبي الدولي', 'Dubai', 'دبي', 'United Arab Emirates', 'الإمارات العربية المتحدة'],
  ['LHR', 'London Heathrow', 'مطار هيثرو', 'London', 'لندن', 'United Kingdom', 'المملكة المتحدة'],
  ['CDG', 'Paris Charles de Gaulle', 'مطار شارل ديغول', 'Paris', 'باريس', 'France', 'فرنسا'],
  ['IST', 'Istanbul Airport', 'مطار إسطنبول', 'Istanbul', 'إسطنبول', 'Türkiye', 'تركيا'],
  ['JFK', 'John F. Kennedy International', 'مطار جون كينيدي', 'New York', 'نيويورك', 'United States', 'الولايات المتحدة'],
  ['MLE', 'Velana International', 'مطار فيلانا الدولي', 'Malé', 'ماليه', 'Maldives', 'جزر المالديف'],
  ['HND', 'Tokyo Haneda', 'مطار هانيدا', 'Tokyo', 'طوكيو', 'Japan', 'اليابان'],
  ['FCO', 'Rome Fiumicino', 'مطار فيوميتشينو', 'Rome', 'روما', 'Italy', 'إيطاليا'],
  ['BCN', 'Barcelona El Prat', 'مطار البرات', 'Barcelona', 'برشلونة', 'Spain', 'إسبانيا'],
  ['CAI', 'Cairo International', 'مطار القاهرة الدولي', 'Cairo', 'القاهرة', 'Egypt', 'مصر'],
  ['RUH', 'King Khalid International', 'مطار الملك خالد الدولي', 'Riyadh', 'الرياض', 'Saudi Arabia', 'السعودية'],
  ['DOH', 'Hamad International', 'مطار حمد الدولي', 'Doha', 'الدوحة', 'Qatar', 'قطر'],
  ['AMS', 'Amsterdam Schiphol', 'مطار سخيبول', 'Amsterdam', 'أمستردام', 'Netherlands', 'هولندا'],
  ['SIN', 'Singapore Changi', 'مطار شانغي', 'Singapore', 'سنغافورة', 'Singapore', 'سنغافورة'],
  ['BKK', 'Suvarnabhumi', 'مطار سوفارنابومي', 'Bangkok', 'بانكوك', 'Thailand', 'تايلاند'],
  ['KUL', 'Kuala Lumpur International', 'مطار كوالالمبور الدولي', 'Kuala Lumpur', 'كوالالمبور', 'Malaysia', 'ماليزيا'],
  ['CMN', 'Mohammed V International', 'مطار محمد الخامس', 'Casablanca', 'الدار البيضاء', 'Morocco', 'المغرب'],
  ['ATH', 'Athens International', 'مطار أثينا الدولي', 'Athens', 'أثينا', 'Greece', 'اليونان'],
  ['VIE', 'Vienna International', 'مطار فيينا الدولي', 'Vienna', 'فيينا', 'Austria', 'النمسا'],
  ['ZRH', 'Zurich Airport', 'مطار زيورخ', 'Zurich', 'زيورخ', 'Switzerland', 'سويسرا'],
  ['BEY', 'Beirut Rafic Hariri', 'مطار رفيق الحريري', 'Beirut', 'بيروت', 'Lebanon', 'لبنان'],
  ['AMM', 'Queen Alia International', 'مطار الملكة علياء', 'Amman', 'عمّان', 'Jordan', 'الأردن'],
  ['MCT', 'Muscat International', 'مطار مسقط الدولي', 'Muscat', 'مسقط', 'Oman', 'عُمان'],
  ['JED', 'King Abdulaziz International', 'مطار الملك عبدالعزيز', 'Jeddah', 'جدة', 'Saudi Arabia', 'السعودية'],
  ['YYZ', 'Toronto Pearson', 'مطار تورونتو بيرسون', 'Toronto', 'تورونتو', 'Canada', 'كندا'],
];

/** Model, registration, economy rows, business rows, seats per row. */
export const FLEET = [
  ['Boeing 777-300ER', 'A6-RHA', 42, 8, 6],
  ['Boeing 777-300ER', 'A6-RHB', 42, 8, 6],
  ['Airbus A380-800', 'A6-RHC', 58, 12, 6],
  ['Airbus A350-900', 'A6-RHD', 36, 7, 6],
  ['Airbus A350-900', 'A6-RHE', 36, 7, 6],
  ['Boeing 787-9', 'A6-RHF', 30, 6, 6],
  ['Airbus A320neo', 'A6-RHG', 24, 4, 6],
  ['Airbus A320neo', 'A6-RHH', 24, 4, 6],
];

/** Every route radiates from the Dubai hub: IATA => [block minutes, base fare, flights per day]. */
export const ROUTES = {
  LHR: [425, 649, 2],
  CDG: [400, 579, 2],
  IST: [275, 459, 2],
  JFK: [830, 899, 1],
  MLE: [260, 729, 1],
  HND: [585, 849, 1],
  FCO: [375, 539, 1],
  BCN: [425, 559, 1],
  CAI: [240, 289, 2],
  RUH: [110, 249, 3],
  DOH: [65, 199, 3],
  AMS: [425, 599, 1],
  SIN: [445, 789, 1],
  BKK: [380, 699, 1],
  KUL: [445, 719, 1],
  CMN: [480, 469, 1],
  ATH: [300, 499, 1],
  VIE: [380, 609, 1],
  ZRH: [400, 669, 1],
  BEY: [220, 279, 2],
  AMM: [190, 259, 2],
  MCT: [60, 189, 3],
  JED: [175, 269, 2],
  YYZ: [825, 949, 1],
};

export const HUB = 'DXB';
export const SLOTS = ['02:15', '08:40', '14:25', '20:05'];
export const SCHEDULE_DAYS = 45;

/** Code, title en/ar, description en/ar, destination slug, type, value, valid days. */
export const OFFERS = [
  ['SUMMER25', 'Summer escape', 'عرض الصيف',
    'Save 25% on summer departures across the network.',
    'وفّر 25% على رحلات الصيف في جميع الوجهات.', null, 'percent', 25, 90],
  ['LONDON120', 'London city break', 'عطلة لندن',
    'Flat $120 off return fares to London.',
    'خصم 120 دولاراً على رحلات الذهاب والعودة إلى لندن.', 'london', 'fixed', 120, 60],
  ['MALDIVES15', 'Island retreat', 'عطلة الجزر',
    '15% off Maldives fares in every cabin.',
    'خصم 15% على رحلات المالديف بجميع الدرجات.', 'maldives', 'percent', 15, 75],
  ['GULF10', 'Gulf hopper', 'رحلات الخليج',
    '10% off short Gulf routes booked in advance.',
    'خصم 10% على رحلات الخليج القصيرة عند الحجز المبكر.', 'doha', 'percent', 10, 120],
  ['TOKYO200', 'Tokyo discovery', 'اكتشف طوكيو',
    'Save $200 on business class to Tokyo.',
    'وفّر 200 دولار على درجة رجال الأعمال إلى طوكيو.', 'tokyo', 'fixed', 200, 45],
  ['FIRSTTRIP', 'First journey', 'رحلتك الأولى',
    '12% off your first booking with Rihlati.',
    'خصم 12% على أول حجز لك مع رحلتي.', null, 'percent', 12, 180],
  ['PARIS90', 'Paris in bloom', 'باريس في الربيع',
    '$90 off return fares to Paris.',
    'خصم 90 دولاراً على رحلات الذهاب والعودة إلى باريس.', 'paris', 'fixed', 90, 50],
  ['ASIA20', 'Asia explorer', 'استكشف آسيا',
    '20% off selected Asian destinations.',
    'خصم 20% على وجهات آسيوية مختارة.', 'bangkok', 'percent', 20, 70],
];

/** The accounts printed on the sign-in page. */
export const DEMO_USERS = [
  {
    id: 1,
    name: 'Rihlati Administrator',
    email: 'admin@rihlati.demo',
    password: 'Admin@12345',
    role: 'admin',
    phone: '+971 4 000 1000',
  },
  {
    id: 2,
    name: 'Operations Staff',
    email: 'staff@rihlati.demo',
    password: 'Staff@12345',
    role: 'staff',
    phone: '+971 4 000 2000',
  },
  {
    id: 3,
    name: 'Omar Haddad',
    email: 'omar.haddad@example.com',
    password: 'Traveller@123',
    role: 'customer',
    phone: '+971 50 111 2233',
  },
];
