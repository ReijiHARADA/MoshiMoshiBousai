/**
 * スクロール位置に応じた theme-color を算出する純粋関数。
 * ロジックの意味は App.jsx 従来仕様を維持する。
 */
const COLOR_TOP = '#ffffff';
const COLOR_SCROLLED = '#1a2535';
const THRESHOLD = 0.5;

/**
 * @param {number} scrollTop
 * @param {number} documentHeight
 * @param {number} windowHeight
 * @returns {string} CSS color
 */
export function getThemeColorByScrollPosition(scrollTop, documentHeight, windowHeight) {
  const scrollableHeight = documentHeight - windowHeight;
  if (scrollableHeight <= 0) return COLOR_TOP;
  const scrollPercentage = scrollTop / scrollableHeight;
  return scrollPercentage > THRESHOLD ? COLOR_SCROLLED : COLOR_TOP;
}
