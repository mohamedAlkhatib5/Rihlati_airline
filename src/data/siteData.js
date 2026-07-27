// img

import dubaiImage from "../assets/images/dubai.jpg";
import londonImage from "../assets/images/london.jpg";
import parisImage from "../assets/images/paris.jpg";
import istanbulImage from "../assets/images/istanbul.jpg";
import newYorkImage from "../assets/images/dubai.jpg";
import maldivesImage from "../assets/images/maldives.jpg";

export const destinations = [
  {
    city: { en: "Dubai", ar: "دبي" },
    country: { en: "United Arab Emirates", ar: "الإمارات العربية المتحدة" },
    price: 399,
    image: dubaiImage,
  },
  {
    city: { en: "London", ar: "لندن" },
    country: { en: "United Kingdom", ar: "المملكة المتحدة" },
    price: 649,
    image: londonImage,
  },
  {
    city: { en: "Paris", ar: "باريس" },
    country: { en: "France", ar: "فرنسا" },
    price: 579,
    image: parisImage,
  },
  {
    city: { en: "Istanbul", ar: "إسطنبول" },
    country: { en: "Türkiye", ar: "تركيا" },
    price: 459,
    image: istanbulImage,
  },
  {
    city: { en: "New York", ar: "نيويورك" },
    country: { en: "United States", ar: "الولايات المتحدة" },
    price: 899,
    image: newYorkImage,
  },
  {
    city: { en: "Maldives", ar: "المالديف" },
    country: { en: "Maldives", ar: "جزر المالديف" },
    price: 729,
    image: maldivesImage,
  },
];

export const features = [
  {
    icon: "bi-shield-check",
    title: { en: "Confident planning", ar: "تخطيط بثقة" },
    text: {
      en: "Clear choices and helpful details make every travel decision easier.",
      ar: "خيارات واضحة ومعلومات مفيدة تجعل كل قرار في رحلتك أسهل.",
    },
  },
  {
    icon: "bi-ticket-perforated",
    title: { en: "Flexible booking", ar: "حجز مرن" },
    text: {
      en: "Compare routes and choose the plan that fits your time and budget.",
      ar: "قارن بين الوجهات واختر الخطة التي تناسب وقتك وميزانيتك.",
    },
  },
  {
    icon: "bi-headset",
    title: { en: "Travel support", ar: "دعم أثناء السفر" },
    text: {
      en: "Useful guidance before, during, and after your journey.",
      ar: "إرشادات مفيدة قبل رحلتك وأثناءها وبعد الوصول.",
    },
  },
];
