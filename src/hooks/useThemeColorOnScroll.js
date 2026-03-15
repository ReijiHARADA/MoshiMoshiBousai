import { useEffect } from 'react';
import { getThemeColorByScrollPosition } from '../lib/themeColor';

/**
 * スクロール量に応じて meta[name="theme-color"] と document.body.style.backgroundColor を更新する。
 * iPhone Safari 対策として body 背景色も同期する。cleanup でリスナー解除。
 */
export function useThemeColorOnScroll() {
  useEffect(() => {
    const updateThemeColor = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const documentHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;
      const newColor = getThemeColorByScrollPosition(scrollTop, documentHeight, windowHeight);

      const metaTags = document.querySelectorAll('meta[name="theme-color"]');
      metaTags.forEach((tag) => {
        tag.setAttribute('content', newColor);
      });

      if (document.body) {
        document.body.style.backgroundColor = newColor;
      }
    };

    window.addEventListener('scroll', updateThemeColor);
    updateThemeColor();

    return () => window.removeEventListener('scroll', updateThemeColor);
  }, []);
}
