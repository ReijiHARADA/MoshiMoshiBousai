import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { QUESTIONS } from '../../../data/questions';

/**
 * 質問ページのセッション責務: currentUser, ルーム属性, 質問フィルタ,
 * 回答/メモ state, 全問回答済み判定, 保存＆遷移。
 */
export function useQuestionSession(roomId) {
    const navigate = useNavigate();

    const currentUser = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('currentUser')) || {};
        } catch {
            return {};
        }
    }, []);

    const [roomAttributes, setRoomAttributes] = useState(null);
    useEffect(() => {
        const fetchRoom = async () => {
            try {
                const roomDoc = await getDoc(doc(db, 'rooms', roomId));
                if (roomDoc.exists()) {
                    setRoomAttributes(roomDoc.data().attributes || {});
                }
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
        setSaving(true);
        try {
            const userId = currentUser.id;
            await Promise.all(filteredQuestions.map((q) => {
                const aid = `${roomId}_${userId}_${q.id}`;
                return setDoc(doc(collection(db, 'answers'), aid), {
                    id: aid,
                    roomId,
                    userId,
                    questionId: q.id,
                    answerText: answers[q.id] || '',
                    memoText: memos[q.id] || '',
                });
            }));
            setIsExiting(true);
            setTimeout(() => {
                navigate(`/room/${roomId}/summary`, { state: { fromQuestions: true } });
            }, 200);
        } catch (err) {
            console.error('回答保存エラー:', err);
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
