import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../../lib/session';
import { getRoomById } from '../../../lib/rooms';
import { saveAnswers } from '../../../lib/answers';
import { haptics } from '../../../lib/haptics';
import { QUESTIONS } from '../../../data/questions';

/**
 * 質問ページのセッション責務: currentUser, ルーム属性, 質問フィルタ,
 * 回答/メモ state, 全問回答済み判定, 保存＆遷移。
 */
export function useQuestionSession(roomId) {
    const navigate = useNavigate();

    const currentUser = useMemo(() => getCurrentUser(), []);

    const [roomAttributes, setRoomAttributes] = useState(null);
    useEffect(() => {
        const fetchRoom = async () => {
            try {
                const room = await getRoomById(roomId);
                if (room) setRoomAttributes(room.attributes || {});
            } catch (err) {
                console.error('Room fetch error:', err);
            }
        };
        fetchRoom();
    }, [roomId]);

    const filteredQuestions = useMemo(() => {
        const attrs = { ...(roomAttributes || {}), ...(currentUser.attributes || {}) };
        return QUESTIONS.filter((q) => {
            if (q.targetAttribute === 'all') return true;
            const val = attrs[q.targetAttribute];
            return q.targetAttribute === 'otherText' ? !!val && val.trim().length > 0 : val === true;
        });
    }, [currentUser, roomAttributes]);

    const [answers, setAnswers] = useState({});
    const [memos, setMemos] = useState({});
    const [saving, setSaving] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    const { allAnswered, firstUnansweredIndex } = useMemo(() => {
        const firstQuestion = filteredQuestions[0];
        const adminSkip = firstQuestion && (memos[firstQuestion.id] || '').trim().toLowerCase() === 'admin';

        let first = -1;
        const all = adminSkip || filteredQuestions.every((q, i) => {
            const hasAnswer = (answers[q.id] || '').trim().length > 0;
            if (!hasAnswer && first < 0) first = i;
            return hasAnswer;
        });
        return { allAnswered: all, firstUnansweredIndex: first >= 0 ? first : 0 };
    }, [filteredQuestions, answers, memos]);

    const handleAnswerChange = (qId, val) => setAnswers((p) => ({ ...p, [qId]: val }));
    const handleMemoChange = (qId, val) => setMemos((p) => ({ ...p, [qId]: val }));

    const handleSaveAndNavigate = async () => {
        // 実機では振動APIが「ユーザー操作の同期処理内」でないと発火しないため、
        // await の前にタップ直後で success を鳴らす
        haptics.success();
        setSaving(true);
        try {
            const userId = currentUser.id;
            await saveAnswers(roomId, userId, filteredQuestions, answers, memos);
            setIsExiting(true);
            setTimeout(() => {
                navigate(`/room/${roomId}/summary`, { state: { fromQuestions: true } });
            }, 200);
        } catch (err) {
            console.error('回答保存エラー:', err);
            haptics.error();
            alert('回答の保存に失敗しました。');
        } finally {
            setSaving(false);
        }
    };

    return {
        currentUser,
        roomAttributes,
        filteredQuestions,
        answers,
        memos,
        saving,
        allAnswered,
        firstUnansweredIndex,
        handleAnswerChange,
        handleMemoChange,
        handleSaveAndNavigate,
        isExiting,
    };
}
