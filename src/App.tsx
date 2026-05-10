import { Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { ServicePage } from './pages/ServicePage';
import { ServiceArea } from './pages/ServiceArea';
import { Contact } from './pages/Contact';
import { CityPage } from './pages/CityPage';
import { Admin } from './pages/Admin';
import { Appointments } from './pages/Appointments';
import { NotFound } from './pages/NotFound';
import { ScrollToTop } from './components/ScrollToTop';
import { ChatWidget } from './components/ChatWidget';

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
          <Route path="/locations/:city" element={<CityPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/appointments" element={<Appointments />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}

export default App;
