import { Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { ServicePage } from './pages/ServicePage';
import { ServiceArea } from './pages/ServiceArea';
import { Quote } from './pages/Quote';
import { Contact } from './pages/Contact';
import { NotFound } from './pages/NotFound';
import { ScrollToTop } from './components/ScrollToTop';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services/air-duct-cleaning" element={<ServicePage service="airDuct" />} />
          <Route path="/services/dryer-vent-cleaning" element={<ServicePage service="dryerVent" />} />
          <Route path="/services/carpet-cleaning" element={<ServicePage service="carpet" />} />
          <Route path="/service-area" element={<ServiceArea />} />
          <Route path="/quote" element={<Quote />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
