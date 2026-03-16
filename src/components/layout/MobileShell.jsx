import { Routes, Route, useLocation } from 'react-router-dom';
import Home from '../../pages/Home';
import JoinRoom from '../../pages/JoinRoom';
import Questions from '../../pages/Questions';
import Summary from '../../pages/Summary';
import Privacy from '../../pages/Privacy';
import Disclaimer from '../../pages/Disclaimer';
import Contact from '../../pages/Contact';
import { useThemeColorOnScroll } from '../../hooks/useThemeColorOnScroll';

/** 質問 / サマリーページではフッターを隠す */
function shouldHideFooter(pathname) {
  return /^\/room\/[^/]+\/(questions|summary)$/.test(pathname);
}

/**
 * 448px コンテナ・共通フッター・theme-color 更新を担当するアプリ用レイアウト。
 * ランディング以外のルートで使う。
 */
export function MobileShell() {
  const location = useLocation();
  const hideFooter = shouldHideFooter(location.pathname);

  useThemeColorOnScroll();

  return (
    <div className="app-wrapper flex flex-col" style={{ minHeight: '100dvh' }}>
      <div
        className="content-column w-full flex-1 bg-white"
        style={{ maxWidth: '448px', margin: '0 auto', position: 'relative', zIndex: 1 }}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/join/:roomId" element={<JoinRoom />} />
          <Route path="/room/:roomId/questions" element={<Questions />} />
          <Route path="/room/:roomId/summary" element={<Summary />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/disclaimer" element={<Disclaimer />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </div>

      {!hideFooter && (
        <footer
          className="w-full bg-[#1a2535] pt-5 text-center relative"
          style={{
            paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 0px))',
            zIndex: 20,
          }}
          >
          <div className="w-full mx-auto px-4" style={{ maxWidth: '448px' }}>
            <div className="flex flex-col items-center justify-center gap-y-[6px] text-[9px]">
              <a
                href="https://forms.gle/SL6Q5LTbMchyGXvd9"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/90 underline underline-offset-2 text-[12px]"
              >
                お問い合わせ / フィードバックを送る
              </a>
              <div className="flex items-center justify-center gap-x-4">
                <a
                  href="/privacy"
                  className="text-white/80 underline underline-offset-2 opacity-80"
                >
                  プライバシー
                </a>
                <a
                  href="/disclaimer"
                  className="text-white/80 underline underline-offset-2 opacity-80"
                >
                  利用上の注意
                </a>
              </div>
            </div>
            <p className="text-white/50 text-[12px] mt-2">©Reiji HARADA</p>
          </div>
        </footer>
      )}
    </div>
  );
}
