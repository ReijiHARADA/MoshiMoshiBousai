import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import { MobileShell } from './components/layout/MobileShell';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/*" element={<MobileShell />} />
      </Routes>
    </BrowserRouter>
  );
}
