import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClientId } from '../lib/createClientId';
import { buildRoomUrl, shareRoom } from '../lib/share';
import { createRoom } from '../lib/rooms';
import { createUser, buildUserForHome } from '../lib/users';
import { setCurrentUser } from '../lib/session';
import { MapPin, BadgeCheck, Info, Share } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import LandingPage from './LandingPage';
import BlueFormCard from '../components/forms/BlueFormCard';
import FieldBlock from '../components/forms/FieldBlock';
import TextInput from '../components/forms/TextInput';
import PrimaryButton from '../components/ui/PrimaryButton';

function generateRoomId() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export default function Home() {
    const navigate = useNavigate();
    const [location, setLocation] = useState('');
    const [name, setName] = useState('');
    const [attributes, setAttributes] = useState({
        hasPet: false,
        hasChild: false,
        hasElder: false,
        hasDisability: false,
    });
    const [otherText, setOtherText] = useState('');
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [createdRoomId, setCreatedRoomId] = useState('');
    const [copied, setCopied] = useState(false);
    const [agreedPrivacy, setAgreedPrivacy] = useState(false);

    const handleCheckbox = (key) => {
        setAttributes((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleCreateRoom = async () => {
        if (!name.trim()) {
            alert('名前を入力してください');
            return;
        }
        if (!agreedPrivacy) {
            alert('同意してください');
            return;
        }

        setLoading(true);
        try {
            const roomId = generateRoomId();
            const userId = createClientId();

            await createRoom(roomId, {
                attributes: { ...attributes, otherText: otherText.trim() },
            });

            const userData = buildUserForHome({
                userId,
                roomId,
                name,
                location,
                attributes,
                otherText,
            });
            await createUser(userData);
            setCurrentUser(userData);

            setCreatedRoomId(roomId);
            setShowModal(true);
        } catch (error) {
            console.error('Firebaseエラー:', error);
            alert('エラーが発生しました。もう一度お試しください。');
        } finally {
            setLoading(false);
        }
    };

    const shareUrl = buildRoomUrl(createdRoomId);

    const handleShareLink = async () => {
        const result = await shareRoom(createdRoomId, { title: 'もしもし防災 - ルーム招待' });
        if (result.copied) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleGoToQuestions = () => {
        setShowModal(false);
        navigate(`/room/${createdRoomId}/questions`);
    };

    const checkboxItems = [
        { key: 'hasPet', label: 'ペット' },
        { key: 'hasChild', label: '子供' },
        { key: 'hasElder', label: '高齢者' },
        { key: 'hasDisability', label: '障害をもった方' },
    ];

    const handleScrollToForm = () => {
        document.getElementById('home-form')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center relative" style={{ zIndex: 1 }}>
            <LandingPage onCTA={handleScrollToForm} />
            <div id="home-form" className="w-full py-10 relative bg-white">
                <div className="mx-4">
                    <BlueFormCard title="もしもし防災を始める">
                        <div className="flex flex-col gap-9">
                            <FieldBlock
                                icon={<BadgeCheck size={20} className="text-on-primary" />}
                                label="名前"
                                description="アプリ内での表示名です。お互いを識別しやすい名前を自由につけてください。"
                                required
                            >
                                <TextInput
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="パパ"
                                />
                            </FieldBlock>

                            <FieldBlock
                                icon={<MapPin size={20} className="text-on-primary" />}
                                label="よくいる場所"
                                description="災害は家にいる時に起こるとは限りません。学校や職場など、日中の主な居場所を入力しましょう。"
                                required
                            >
                                <TextInput
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="豊洲の職場"
                                />
                            </FieldBlock>

                            <FieldBlock
                                icon={<Info size={20} className="text-on-primary" />}
                                label="一緒に住んでいる家族"
                                description="避難時の「誰が助ける？」をあいまいにしないために、支援が必要なご家族を教えてください。"
                            >
                                <div className="flex flex-col gap-1">
                                    {checkboxItems.map(({ key, label }) => (
                                        <label
                                            key={key}
                                            className="flex items-center gap-2.5 cursor-pointer py-1 -mx-2 px-2 rounded-lg active:bg-white/10 transition-colors"
                                        >
                                            <div
                                                className={`w-5 h-5 rounded-sm border-2 border-on-primary flex items-center justify-center flex-shrink-0 transition-colors text-primary ${attributes[key]
                                                    ? 'bg-on-primary'
                                                    : 'bg-transparent'
                                                    }`}
                                            >
                                                {attributes[key] && (
                                                    <svg
                                                        width="12"
                                                        height="10"
                                                        viewBox="0 0 10 8"
                                                        fill="none"
                                                    >
                                                        <path
                                                            d="M1 4L3.5 6.5L9 1"
                                                            className="stroke-primary"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    </svg>
                                                )}
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="sr-only"
                                                checked={attributes[key]}
                                                onChange={() => handleCheckbox(key)}
                                            />
                                            <span className="text-on-primary text-[16px] font-medium">
                                                {label}
                                            </span>
                                        </label>
                                    ))}
                                    <input
                                        type="text"
                                        value={otherText}
                                        onChange={(e) => setOtherText(e.target.value)}
                                        placeholder="その他"
                                        className="w-full h-input rounded-input bg-input-dark px-4 text-[16px] font-medium text-on-primary placeholder-primary outline-none focus:text-on-primary transition-colors"
                                    />
                                </div>
                            </FieldBlock>
                        </div>

                        <div className="mt-8 mb-3">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={agreedPrivacy}
                                    onChange={(e) => setAgreedPrivacy(e.target.checked)}
                                    className="w-3.5 h-3.5 rounded border border-on-primary bg-transparent"
                                />
                                <span className="text-xs text-on-primary/80">
                                    <a href="/privacy" className="underline underline-offset-2">
                                        プライバシーポリシー
                                    </a>
                                    に同意する
                                </span>
                            </label>
                        </div>

                        <PrimaryButton
                            onClick={handleCreateRoom}
                            disabled={loading || !agreedPrivacy || !name.trim()}
                        >
                            {loading ? '作成中...' : '家族のズレを確認する'}
                        </PrimaryButton>
                        <p className="mt-2 text-xs text-[rgba(249,249,249,1)] opacity-70">
                            住所や本名など、詳しい情報は入力しないでください。
                        </p>
                    </BlueFormCard>
                </div>
            </div>

            {/* ===== 招待モーダル（オーバーレイ） ===== */}
            {showModal && (
                <div
                    className="fixed top-0 bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 flex items-center justify-center p-6"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setShowModal(false);
                    }}
                >
                    {/* 半透明黒背景 */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                    {/* モーダルカード */}
                    <div className="relative w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl animate-[fadeInUp_0.3s_ease-out]">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800">
                                スキャンして招待する
                            </h2>
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-all"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="flex justify-center mb-0.5">
                            <div className="p-4 bg-white rounded-xl">
                                <QRCodeSVG
                                    value={shareUrl}
                                    size={200}
                                    level="M"
                                    includeMargin={false}
                                />
                            </div>
                        </div>

                        <p className="text-xs text-text/80 mt-0.5 mb-6 text-center">
                            招待リンクは信頼できる相手だけに共有してください
                        </p>

                        <button
                            type="button"
                            onClick={handleShareLink}
                            className="w-full flex items-center justify-center gap-2 py-3.5 mb-3 rounded-xl border-2 border-primary bg-white text-primary font-bold text-base hover:bg-primary/5 active:scale-[0.98] transition-all"
                        >
                            <Share className="w-5 h-5" />
                            {copied ? 'コピーしました！' : 'リンクを共有する'}
                        </button>

                        <button
                            type="button"
                            onClick={handleGoToQuestions}
                            className="w-full py-3.5 rounded-full bg-primary text-white font-bold text-base shadow-lg hover:bg-primary-hover active:scale-[0.98] transition-all"
                        >
                            回答に進む
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
