import { Routes, Route, useLocation } from 'react-router-dom';
import Home from '../../pages/Home';
import JoinRoom from '../../pages/JoinRoom';
import Questions from '../../pages/Questions';
import Summary from '../../pages/Summary';
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
      )}
    </div>
  );
}
