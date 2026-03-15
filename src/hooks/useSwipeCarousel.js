import { useState, useRef, useEffect, useMemo } from 'react';

const PEEK_DEFAULT = 24;
const CARD_GAP_DEFAULT = 12;
const SWIPE_THRESHOLD = 50;
const DIRECTION_LOCK_THRESHOLD = 5;
const EDGE_RESISTANCE = 0.25;

/**
 * 横スワイプ／ドラッグでインデックスを切り替えるカルーセルの土台ロジック。
 * タッチとマウス両対応。スクロール抑制と ResizeObserver でコンテナ幅を計測する。
 *
 * @param {object} options
 * @param {number} options.itemCount - スライド数（0 以上）
 * @param {number} [options.peek=24] - 左右にチラ見えする幅（px）
 * @param {number} [options.cardGap=12] - カード間のギャップ（px）
 * @param {React.MutableRefObject<unknown>} [options.disableDragRef] - ref.current が truthy の間はドラッグを無効にする（例: オーバーレイ展開中）
 * @param {boolean} [options.lockScroll=true] - html/body の overflow を hidden にするか
 * @returns {{
 *   containerRef: React.RefObject<HTMLDivElement | null>,
 *   currentIndex: number,
 *   setCurrentIndex: (n: number | ((prev: number) => number)) => void,
 *   dragOffset: number,
 *   isDragging: boolean,
 *   slideWidth: number,
 *   trackTranslatePx: number,
 *   cardWidth: number,
 *   stepSize: number,
 *   peek: number,
 *   cardGap: number,
 *   goNext: () => void,
 *   goPrev: () => void,
 * }}
 */
export function useSwipeCarousel(options) {
    const {
        itemCount,
        peek = PEEK_DEFAULT,
        cardGap = CARD_GAP_DEFAULT,
        disableDragRef = null,
        lockScroll = true,
    } = options;

    const [currentIndex, setCurrentIndex] = useState(0);
    const [dragOffset, setDragOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [slideWidth, setSlideWidth] = useState(0);

    const containerRef = useRef(null);
    const touchStartX = useRef(0);
    const touchStartY = useRef(0);
    const isHorizontalSwipe = useRef(null);
    const isDraggingRef = useRef(false);
    const dragOffsetRef = useRef(0);
    const currentIndexRef = useRef(0);

    useEffect(() => {
        currentIndexRef.current = currentIndex;
    }, [currentIndex]);

    // ---------- スクロール抑制 ----------
    useEffect(() => {
        if (!lockScroll) return;
        const html = document.documentElement;
        const body = document.body;
        const prevHtmlOverflow = html.style.overflow;
        const prevBodyOverflow = body.style.overflow;
        const prevBodyOverscroll = body.style.overscrollBehavior;
        html.style.overflow = 'hidden';
        body.style.overflow = 'hidden';
        body.style.overscrollBehavior = 'none';
        return () => {
            html.style.overflow = prevHtmlOverflow;
            body.style.overflow = prevBodyOverflow;
            body.style.overscrollBehavior = prevBodyOverscroll;
        };
    }, [lockScroll]);

    // ---------- コンテナ幅 ----------
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const measure = () => setSlideWidth(el.offsetWidth);
        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    // ---------- スワイプ／ドラッグ ----------
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const startDrag = (x, y) => {
            touchStartX.current = x;
            touchStartY.current = y;
            isHorizontalSwipe.current = null;
            isDraggingRef.current = true;
            setIsDragging(true);
        };

        const moveDrag = (x, y, prevent) => {
            if (!isDraggingRef.current) return;
            if (disableDragRef?.current) return;
            const dx = x - touchStartX.current;
            const dy = y - touchStartY.current;
            if (isHorizontalSwipe.current === null) {
                if (Math.abs(dx) > DIRECTION_LOCK_THRESHOLD || Math.abs(dy) > DIRECTION_LOCK_THRESHOLD) {
                    isHorizontalSwipe.current = Math.abs(dx) > Math.abs(dy);
                }
                return;
            }
            if (!isHorizontalSwipe.current) return;
            if (prevent) prevent();
            const idx = currentIndexRef.current;
            const maxIdx = Math.max(0, itemCount - 1);
            let offset = dx;
            if ((idx === 0 && dx > 0) || (idx >= maxIdx && dx < 0)) {
                offset = dx * EDGE_RESISTANCE;
            }
            dragOffsetRef.current = offset;
            setDragOffset(offset);
        };

        const endDrag = () => {
            if (!isDraggingRef.current) return;
            isDraggingRef.current = false;
            setIsDragging(false);
            isHorizontalSwipe.current = null;
            const offset = dragOffsetRef.current;
            const idx = currentIndexRef.current;
            const maxIdx = Math.max(0, itemCount - 1);
            if (offset < -SWIPE_THRESHOLD && idx < maxIdx) {
                setCurrentIndex((p) => p + 1);
            } else if (offset > SWIPE_THRESHOLD && idx > 0) {
                setCurrentIndex((p) => p - 1);
            }
            dragOffsetRef.current = 0;
            setDragOffset(0);
        };

        const onTS = (e) => startDrag(e.touches[0].clientX, e.touches[0].clientY);
        const onTM = (e) => moveDrag(e.touches[0].clientX, e.touches[0].clientY, () => e.preventDefault());
        const onTE = () => endDrag();
        const onMD = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            e.preventDefault();
            startDrag(e.clientX, e.clientY);
        };
        const onMM = (e) => {
            if (isDraggingRef.current) moveDrag(e.clientX, e.clientY);
        };
        const onMU = () => endDrag();

        el.addEventListener('touchstart', onTS, { passive: true });
        el.addEventListener('touchmove', onTM, { passive: false });
        el.addEventListener('touchend', onTE, { passive: true });
        el.addEventListener('mousedown', onMD);
        el.addEventListener('mousemove', onMM);
        el.addEventListener('mouseup', onMU);
        el.addEventListener('mouseleave', onMU);

        return () => {
            el.removeEventListener('touchstart', onTS);
            el.removeEventListener('touchmove', onTM);
            el.removeEventListener('touchend', onTE);
            el.removeEventListener('mousedown', onMD);
            el.removeEventListener('mousemove', onMM);
            el.removeEventListener('mouseup', onMU);
            el.removeEventListener('mouseleave', onMU);
        };
    }, [itemCount, disableDragRef]);

    const cardWidth = slideWidth ? slideWidth - 2 * peek : 0;
    const stepSize = cardWidth + cardGap;
    const trackTranslatePx = peek - currentIndex * stepSize + dragOffset;

    const goNext = () => {
        if (currentIndex < itemCount - 1) setCurrentIndex((p) => p + 1);
    };
    const goPrev = () => {
        if (currentIndex > 0) setCurrentIndex((p) => p - 1);
    };

    return {
        containerRef,
        currentIndex,
        setCurrentIndex,
        dragOffset,
        isDragging,
        slideWidth,
        trackTranslatePx,
        cardWidth,
        stepSize,
        peek,
        cardGap,
        goNext,
        goPrev,
    };
}
