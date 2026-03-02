import { useParams, useNavigate } from 'react-router-dom';
import { Copy, Check, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export default function ShareRoom() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);

    const shareUrl = `${window.location.origin}/join/${roomId}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // フォールバック
            const input = document.createElement('input');
            input.value = shareUrl;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleCopyId = async () => {
        try {
            await navigator.clipboard.writeText(roomId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            /* ignore */
        }
    };

    return (
        <div className="min-h-screen bg-[#2B7A78]">
            <div className="px-6 pt-12 pb-8">
                <h1 className="text-3xl font-bold text-white leading-tight mb-3">
                    ルームが
                    <br />
                    作成されました！
                </h1>
                <p className="text-white/80 text-sm leading-relaxed">
                    以下のリンクまたはルームIDを家族に共有して、全員が参加してから質問に進みましょう。
                </p>
            </div>

            <div className="bg-white rounded-t-3xl px-6 pt-8 pb-10 min-h-[calc(100vh-220px)]">
                {/* ルームID */}
                <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-2">ルームID</p>
                    <div className="flex items-center gap-3">
                        <div className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 font-mono text-xl font-bold text-gray-800 tracking-widest text-center">
                            {roomId}
                        </div>
                        <button
                            onClick={handleCopyId}
                            className="p-3 rounded-xl bg-[#2B7A78] text-white hover:bg-[#236563] transition-all active:scale-95"
                        >
                            {copied ? (
                                <Check className="w-5 h-5" />
                            ) : (
                                <Copy className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </div>

                {/* 共有リンク */}
                <div className="mb-8">
                    <p className="text-sm text-gray-500 mb-2">リンクをコピー</p>
                    <button
                        onClick={handleCopy}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-left hover:bg-gray-100 transition-all"
                    >
                        <span className="flex-1 text-sm text-[#2B7A78] truncate">
                            {shareUrl}
                        </span>
                        {copied ? (
                            <Check className="w-4 h-4 text-green-500 shrink-0" />
                        ) : (
                            <Copy className="w-4 h-4 text-gray-400 shrink-0" />
                        )}
                    </button>
                </div>

                {/* 質問開始ボタン */}
                <button
                    onClick={() => navigate(`/room/${roomId}/questions`)}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-[#2B7A78] text-white font-bold text-lg shadow-lg hover:bg-[#236563] active:scale-[0.98] transition-all"
                >
                    質問に進む
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
