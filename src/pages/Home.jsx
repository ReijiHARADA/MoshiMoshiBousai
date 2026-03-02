import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { MapPin, BadgeCheck, Info, Share } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

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

    // スマホのLANテスト時用にcrypto.randomUUID()の代わりを作成（httpではcrypto.randomUUIDが使えないため）
    const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    const handleCheckbox = (key) => {
        setAttributes((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleCreateRoom = async () => {
        if (!name.trim()) {
            alert('名前を入力してください');
            return;
        }

        setLoading(true);
        try {
            const roomId = generateRoomId();
            const userId = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : generateUUID();

            await setDoc(doc(db, 'rooms', roomId), {
                id: roomId,
                createdAt: serverTimestamp(),
                attributes: {
                    ...attributes,
                    otherText: otherText.trim(),
                },
            });

            await setDoc(doc(collection(db, 'users'), userId), {
                id: userId,
                roomId,
                name: name.trim(),
                isCohabiting: true,
                location: location.trim(),
                attributes: {
                    ...attributes,
                    otherText: otherText.trim(),
                    location: location.trim(),
                },
            });

            localStorage.setItem(
                'currentUser',
                JSON.stringify({
                    id: userId,
                    roomId,
                    name: name.trim(),
                    isCohabiting: true,
                    location: location.trim(),
                    attributes: {
                        ...attributes,
                        otherText: otherText.trim(),
                        location: location.trim(),
                    },
                })
            );

            setCreatedRoomId(roomId);
            setShowModal(true);
        } catch (error) {
            console.error('Firebaseエラー:', error);
            alert('エラーが発生しました。もう一度お試しください。');
        } finally {
            setLoading(false);
        }
    };

    const shareUrl = `${window.location.origin}/join/${createdRoomId}`;

    const handleShareLink = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'もしもし防災 - ルーム招待',
                    url: shareUrl,
                });
                return;
            } catch {
                // share cancelled, fall through to clipboard
            }
        }
        try {
            await navigator.clipboard.writeText(shareUrl);
        } catch {
            const input = document.createElement('input');
            input.value = shareUrl;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
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

    return (
        <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center py-10 px-5">
            <div className="w-full max-w-[402px]">
                {/* ヘッダー部分 */}
                <div className="mb-6">
                    <h1 className="text-[#137FDE] font-black text-[32px] leading-tight mb-2">
                        もしもし防災へ
                        <br />
                        ようこそ！
                    </h1>
                    <p className="text-[#484848] text-[14px] leading-[1.4] opacity-80 text-justify">
                        もしも防災では、避難場所や連絡手段など家族の中にある被災時の認識のずれを可視化し、修正することができます。
                    </p>
                </div>

                {/* メインカード（青） ※ <form> タグは使わない */}
                <div className="bg-[#137FDE] rounded-[20px] px-7 py-7 flex flex-col gap-6">
                    <h2 className="text-[#F9F9F9] font-bold text-[24px]">
                        もしもし防災を始める
                    </h2>

                    <div className="flex flex-col gap-9">
                        {/* 名前 */}
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1">
                                    <BadgeCheck size={20} className="text-[#F9F9F9]" />
                                    <span className="text-[#F9F9F9] font-bold text-[20px]">
                                        名前
                                    </span>
                                </div>
                                <p className="text-[#F9F9F9] text-[12px] leading-[1.4] opacity-70 text-justify">
                                    アプリ内での表示名です。お互いを識別しやすい名前を自由につけてください。
                                </p>
                            </div>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="パパ"
                                className="w-full h-9 rounded-lg bg-[#F9F9F9] px-4 text-[16px] font-medium text-[#484848] placeholder-[#CDCDCD] outline-none transition-colors"
                            />
                        </div>

                        {/* よくいる場所 */}
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1">
                                    <MapPin size={20} className="text-[#F9F9F9]" />
                                    <span className="text-[#F9F9F9] font-bold text-[20px]">
                                        よくいる場所
                                    </span>
                                </div>
                                <p className="text-[#F9F9F9] text-[12px] leading-[1.4] opacity-70 text-justify">
                                    災害は家にいる時に起こるとは限りません。学校や職場など、日中の主な居場所を入力しましょう。
                                </p>
                            </div>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="豊洲の職場"
                                className="w-full h-9 rounded-lg bg-[#F9F9F9] px-4 text-[16px] font-medium text-[#484848] placeholder-[#CDCDCD] outline-none transition-colors"
                            />
                        </div>

                        {/* 一緒に住んでいる家族 */}
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1">
                                    <Info size={20} className="text-[#F9F9F9]" />
                                    <span className="text-[#F9F9F9] font-bold text-[20px]">
                                        一緒に住んでいる家族
                                    </span>
                                </div>
                                <p className="text-[#F9F9F9] text-[12px] leading-[1.4] opacity-70 text-justify">
                                    避難時の「誰が助ける？」をあいまいにしないために、支援が必要なご家族を教えてください。
                                </p>
                            </div>

                            {/* チェックボックス */}
                            <div className="flex flex-col gap-1">
                                {checkboxItems.map(({ key, label }) => (
                                    <label
                                        key={key}
                                        className="flex items-center gap-2.5 cursor-pointer py-2.5 -mx-2 px-2 rounded-lg active:bg-white/10 transition-colors"
                                    >
                                        <div
                                            className={`w-5 h-5 rounded-sm border-2 border-[#F9F9F9] flex items-center justify-center flex-shrink-0 transition-colors ${attributes[key]
                                                ? 'bg-[#F9F9F9]'
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
                                                        stroke="#137FDE"
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
                                        <span className="text-[#F9F9F9] text-[16px] font-medium">
                                            {label}
                                        </span>
                                    </label>
                                ))}

                                {/* その他入力欄 */}
                                <input
                                    type="text"
                                    value={otherText}
                                    onChange={(e) => setOtherText(e.target.value)}
                                    placeholder="その他"
                                    className="w-full h-9 rounded-lg bg-[#154F81] px-4 text-[16px] font-medium text-[#F9F9F9] placeholder-[#137FDE] outline-none focus:text-[#F9F9F9] transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ★ 送信ボタン: type="button" で onClick のみ */}
                    <button
                        type="button"
                        onClick={handleCreateRoom}
                        disabled={loading}
                        className="w-full h-[46px] rounded-full bg-[#F9F9F9] flex items-center justify-center shadow-[0_0_11.5px_0_rgba(93,93,93,0.50)] transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="text-[#137FDE] font-bold text-[20px]">
                            {loading ? '作成中...' : '家族のズレを確認する'}
                        </span>
                    </button>
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

                        <div className="flex justify-center mb-6">
                            <div className="p-4 bg-white rounded-xl">
                                <QRCodeSVG
                                    value={shareUrl}
                                    size={200}
                                    level="M"
                                    includeMargin={false}
                                />
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleShareLink}
                            className="w-full flex items-center justify-center gap-2 py-3.5 mb-3 rounded-xl border-2 border-[#137FDE] bg-white text-[#137FDE] font-bold text-base hover:bg-[#137FDE]/5 active:scale-[0.98] transition-all"
                        >
                            <Share className="w-5 h-5" />
                            {copied ? 'コピーしました！' : 'リンクを共有する'}
                        </button>

                        <button
                            type="button"
                            onClick={handleGoToQuestions}
                            className="w-full py-3.5 rounded-xl bg-[#137FDE] text-white font-bold text-base shadow-lg hover:bg-[#0f6dbf] active:scale-[0.98] transition-all"
                        >
                            回答に進む
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
