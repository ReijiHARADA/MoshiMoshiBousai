import '../styles/landing.css';
import appMockup from '../assets/app_mockup.png';
import logoSvg from '../assets/logo.svg';
import townSvg from '../assets/town.svg';
import step1Svg from '../assets/step1.svg';
import step2Svg from '../assets/step2.svg';
import step3Svg from '../assets/step3.svg';
import step4Svg from '../assets/step4.svg';

const STEPS = [
    {
        id: 1,
        title: <>あなたの<br />"もしも"を<br />回答する</>,
        description: '自宅や外出先など、さまざまなシチュエーションを想定して避難プランを入力します。',
        illust: step1Svg,
    },
    {
        id: 2,
        title: <>家族間の<br />ずれを<br />知る</>,
        description: '家族をルームに招待し、回答を突き合わせます。認識が食い違っている「未一致」の項目を見つけます。',
        illust: step2Svg,
    },
    {
        id: 3,
        title: <>話し合って<br />わが家のルール<br />を決める</>,
        description: 'ズレた項目を話し合って修正し、家族全員が合意した「防災シート」を完成させます。',
        illust: step3Svg,
    },
    {
        id: 4,
        title: <>印刷して<br />物理的な備え<br />に変える</>,
        description: '完成したシートを印刷し、スマホが使えない時でも確認できるようにします。',
        illust: step4Svg,
    },
];

export default function LandingPage({ onCTA }) {
    const handleCTA = () => {
        if (onCTA) {
            onCTA();
        } else {
            window.location.href = '/';
        }
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

                {/* ========== 使い方の流れ ========== */}
                <section className="lp-steps" aria-label="使い方の流れ">
                    <div className="lp-steps__header">
                        <span className="lp-steps__header-text">使い方の流れ</span>
                    </div>
                    <ol className="lp-steps__list">
                        {STEPS.map((step) => (
                            <li key={step.id} className="lp-steps__item">
                                <div className="lp-steps__item-body">
                                    <p className="lp-steps__item-title">{step.title}</p>
                                    <p className="lp-steps__item-desc">{step.description}</p>
                                </div>
                                {/* イラスト */}
                                <div className="lp-steps__item-illust" aria-hidden="true">
                                    <img src={step.illust} alt="" />
                                </div>
                            </li>
                        ))}
                    </ol>
                </section>

            </div>
        </div>
    );
}
