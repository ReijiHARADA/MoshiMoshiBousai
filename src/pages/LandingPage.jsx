import '../styles/landing.css';
import appMockup from '../assets/app_mockup.png';
import logoSvg from '../assets/logo.svg';
import townSvg from '../assets/town.svg';

export default function LandingPage() {
    const handleCTA = () => {
        window.location.href = '/';
    };

    return (
        <div className="lp-root">
            <div className="lp-column">
                <section className="lp-hero" aria-label="ヒーロー">

                    {/* SVGロゴ */}
                    <div className="lp-hero__logo-svg-wrap">
                        <img
                            src={logoSvg}
                            alt="もしもし防災 ロゴ"
                            className="lp-hero__logo-svg"
                        />
                    </div>

                    {/* キャッチコピーバッジ */}
                    <div className="lp-hero__badge">
                        <span className="lp-hero__badgeInner">
                            「もしも」から始める、家族の防災認識一致サービス
                        </span>
                    </div>

                    {/* 説明文 */}
                    <div className="lp-hero__description">
                        <p>
                            避難場所や連絡手段など家族の中にある
                            <br />
                            被災時の認識のずれを可視化し、
                            <br />
                            修正することができます。
                        </p>
                    </div>

                    {/* ---- 重なりゾーン ---- */}
                    {/* DOM順: town(最背面) → mockup → fade → CTA(最前面) */}
                    <div className="lp-hero__stack">
                        <img
                            src={townSvg}
                            alt=""
                            className="lp-hero__town"
                            aria-hidden="true"
                        />
                        <div className="lp-hero__mockup">
                            <img
                                src={appMockup}
                                alt="もしもし防災 アプリのスクリーンショット"
                            />
                        </div>
                        <div className="lp-hero__mockup-fade" />
                        <button
                            type="button"
                            className="lp-hero__cta"
                            onClick={handleCTA}
                        >
                            早速使ってみる！
                        </button>
                    </div>

                </section>
            </div>
        </div>
    );
}
