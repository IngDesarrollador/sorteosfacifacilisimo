import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import SorteoPage from '../pages/SorteoPage';
import GanadoresPage from '../pages/GanadoresPage';
import ScrollToTop from '../components/ScrollToTop';

const AppRouter = () => (
  <BrowserRouter>
    <ScrollToTop />
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/sorteo" element={<SorteoPage />} />
      <Route path="/ganadores" element={<GanadoresPage />} />
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
