import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import JoinRoom from './pages/JoinRoom';
import Questions from './pages/Questions';
import Summary from './pages/Summary';
import LandingPage from './pages/LandingPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page — full-width, no container wrapper */}
        <Route path="/landing" element={<LandingPage />} />
        {/* App pages — constrained mobile container */}
        <Route path="/*" element={
          <div className="min-h-screen flex flex-col">
            <div className="max-w-md mx-auto w-full flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/join/:roomId" element={<JoinRoom />} />
                <Route path="/room/:roomId/questions" element={<Questions />} />
                <Route path="/room/:roomId/summary" element={<Summary />} />
              </Routes>
            </div>
            <footer className="w-full bg-[#1a2535] py-5 text-center">
              <a
                href="https://forms.gle/SL6Q5LTbMchyGXvd9"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white text-[13px] underline underline-offset-2"
              >
                フィードバックを送る
              </a>
              <p className="text-white/50 text-[11px] mt-1">©Reiji HARADA</p>
            </footer>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}
