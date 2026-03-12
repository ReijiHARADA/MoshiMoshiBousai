import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { MapPin, BadgeCheck, Info } from 'lucide-react';

export default function JoinRoom() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [isCohabiting, setIsCohabiting] = useState(null); // null = 未選択, true = 同居, false = 別居
    const [loading, setLoading] = useState(false);

    // スマホのLANテスト時用にcrypto.randomUUID()の代わりを作成
    const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            alert('名前を入力してください');
            return;
        }
        if (isCohabiting === null) {
            alert('同居・別居を選択してください');
            return;
        }

        setLoading(true);
        try {
            // ルームの存在確認
            const roomDoc = await getDoc(doc(db, 'rooms', roomId));
            if (!roomDoc.exists()) {
                alert('このルームIDは存在しません。');
                setLoading(false);
                return;
            }
            // ユーザーを作成（同じ部屋に追加）
            const userId = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : generateUUID();

            const userData = {
                id: userId,
                roomId,
                name: name.trim(),
                location: location.trim(),
                isCohabiting,
                attributes: { location: location.trim() },
            };

            // Firestore に保存
            await setDoc(doc(collection(db, 'users'), userId), userData);

            // localStorage に保存
            localStorage.setItem('currentUser', JSON.stringify(userData));

            // 質問画面へ遷移
            navigate(`/room/${roomId}/questions`);
        } catch (error) {
            console.error('Error joining room:', error);
            alert('エラーが発生しました。もう一度お試しください。');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center relative" style={{ zIndex: 1 }}>
            <div className="w-full py-10 px-5 relative bg-white">
                <div className="w-full max-w-[402px] mx-auto">
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

                {/* メインカード（青） */}
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

                        {/* リンク作成者と同居していますか？ */}
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1">
                                    <Info size={20} className="text-[#F9F9F9]" />
                                    <span className="text-[#F9F9F9] font-bold text-[20px]">
                                        リンク作成者と同居していますか？
                                    </span>
                                </div>
                                <p className="text-[#F9F9F9] text-[12px] leading-[1.4] opacity-70 text-justify">
                                    「同居」か「別居」かで、備えるべき防災の形は変わります。離れていても避難先を共有し、合流計画を立てましょう。
                                </p>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="flex items-center gap-2.5 cursor-pointer py-2.5 -mx-2 px-2 rounded-lg active:bg-white/10 transition-colors">
                                    <div
                                        className={`w-5 h-5 rounded-full border-2 border-[#F9F9F9] flex items-center justify-center flex-shrink-0 transition-colors ${isCohabiting === true ? 'bg-[#F9F9F9]' : 'bg-transparent'}`}
                                    >
                                        {isCohabiting === true && (
                                            <div className="w-2.5 h-2.5 rounded-full bg-[#137FDE]" />
                                        )}
                                    </div>
                                    <input
                                        type="radio"
                                        name="cohabiting"
                                        className="sr-only"
                                        checked={isCohabiting === true}
                                        onChange={() => setIsCohabiting(true)}
                                    />
                                    <span className="text-[#F9F9F9] text-[16px] font-medium">
                                        はい、同居です
                                    </span>
                                </label>
                                <label className="flex items-center gap-2.5 cursor-pointer py-2.5 -mx-2 px-2 rounded-lg active:bg-white/10 transition-colors">
                                    <div
                                        className={`w-5 h-5 rounded-full border-2 border-[#F9F9F9] flex items-center justify-center flex-shrink-0 transition-colors ${isCohabiting === false ? 'bg-[#F9F9F9]' : 'bg-transparent'}`}
                                    >
                                        {isCohabiting === false && (
                                            <div className="w-2.5 h-2.5 rounded-full bg-[#137FDE]" />
                                        )}
                                    </div>
                                    <input
                                        type="radio"
                                        name="cohabiting"
                                        className="sr-only"
                                        checked={isCohabiting === false}
                                        onChange={() => setIsCohabiting(false)}
                                    />
                                    <span className="text-[#F9F9F9] text-[16px] font-medium">
                                        いいえ、別居です
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* 送信ボタン */}
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full h-[46px] rounded-full bg-[#F9F9F9] flex items-center justify-center shadow-[0_0_11.5px_0_rgba(93,93,93,0.50)] transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="text-[#137FDE] font-bold text-[20px]">
                            {loading ? '参加中...' : '家族のズレを確認する'}
                        </span>
                    </button>
                </div>
            </div>
            </div>
        </div>
    );
}
