import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { createClientId } from '../lib/createClientId';
import { MapPin, BadgeCheck, Info } from 'lucide-react';
import BlueFormCard from '../components/forms/BlueFormCard';
import FieldBlock from '../components/forms/FieldBlock';
import TextInput from '../components/forms/TextInput';
import PrimaryButton from '../components/ui/PrimaryButton';

export default function JoinRoom() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [isCohabiting, setIsCohabiting] = useState(null); // null = 未選択, true = 同居, false = 別居
    const [loading, setLoading] = useState(false);

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
            const userId = createClientId();

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

                <BlueFormCard title="もしもし防災を始める">
                    <div className="flex flex-col gap-9">
                        <FieldBlock
                            icon={<BadgeCheck size={20} className="text-[#F9F9F9]" />}
                            label="名前"
                            description="アプリ内での表示名です。お互いを識別しやすい名前を自由につけてください。"
                        >
                            <TextInput
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="パパ"
                            />
                        </FieldBlock>

                        <FieldBlock
                            icon={<MapPin size={20} className="text-[#F9F9F9]" />}
                            label="よくいる場所"
                            description="災害は家にいる時に起こるとは限りません。学校や職場など、日中の主な居場所を入力しましょう。"
                        >
                            <TextInput
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="豊洲の職場"
                            />
                        </FieldBlock>

                        <FieldBlock
                            icon={<Info size={20} className="text-[#F9F9F9]" />}
                            label="リンク作成者と同居していますか？"
                            description="「同居」か「別居」かで、備えるべき防災の形は変わります。離れていても避難先を共有し、合流計画を立てましょう。"
                        >
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
                        </FieldBlock>
                    </div>

                    <PrimaryButton onClick={handleSubmit} disabled={loading}>
                        {loading ? '参加中...' : '家族のズレを確認する'}
                    </PrimaryButton>
                </BlueFormCard>
            </div>
            </div>
        </div>
    );
}
