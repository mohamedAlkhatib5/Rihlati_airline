import { Route, Routes } from 'react-router-dom';
// nav
import SiteNavbar from './components/SiteNavbar';
// footer
import Footer from './components/Footer';
// scroll
import ScrollToTop from './components/ScrollToTop';
// pages
import Home from './pages/Home';
import Flights from './pages/Flights';
import Destinations from './pages/Destinations';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';


export default function App() {
  return (
    <div className="app-shell">
      <ScrollToTop />
      <SiteNavbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/flights" element={<Flights />} />
          <Route path="/destinations" element={<Destinations />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
