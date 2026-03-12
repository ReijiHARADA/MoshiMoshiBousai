import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Home from './pages/Home';
import JoinRoom from './pages/JoinRoom';
import Questions from './pages/Questions';
import Summary from './pages/Summary';
import LandingPage from './pages/LandingPage';

function AppWrapper() {
  useEffect(() => {
    const updateThemeColor = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const documentHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;
      const scrollableHeight = documentHeight - windowHeight;
      const scrollPercentage = scrollTop / scrollableHeight;
      
      const newColor = scrollPercentage > 0.5 ? '#1a2535' : '#ffffff';
      
      // すべてのtheme-colorメタタグを更新
      const metaTags = document.querySelectorAll('meta[name="theme-color"]');
      metaTags.forEach(tag => {
        tag.setAttribute('content', newColor);
      });
      
      // bodyの背景色も同時に変更（iPhoneのSafari対策）
      document.body.style.backgroundColor = newColor;
    };

    window.addEventListener('scroll', updateThemeColor);
    updateThemeColor(); // 初回実行
    
    return () => window.removeEventListener('scroll', updateThemeColor);
  }, []);

  return (
    <div className="app-wrapper flex flex-col" style={{ minHeight: '100dvh' }}>
            <div className="content-column w-full flex-1 bg-white" style={{ maxWidth: '448px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/join/:roomId" element={<JoinRoom />} />
                <Route path="/room/:roomId/questions" element={<Questions />} />
                <Route path="/room/:roomId/summary" element={<Summary />} />
              </Routes>
            </div>
            <footer className="w-full bg-[#1a2535] pt-5 text-center relative" style={{ paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 0px))', zIndex: 20 }}>
              <div className="w-full mx-auto" style={{ maxWidth: '448px' }}>
                <a
                  href="https://forms.gle/SL6Q5LTbMchyGXvd9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white text-[13px] underline underline-offset-2"
                >
                  フィードバックを送る
                </a>
                <p className="text-white/50 text-[11px] mt-1">©Reiji HARADA</p>
              </div>
            </footer>
          </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page — full-width, no container wrapper */}
        <Route path="/landing" element={<LandingPage />} />
        {/* App pages — constrained mobile container */}
        <Route path="/*" element={<AppWrapper />} />
      </Routes>
    </BrowserRouter>
  );
}
