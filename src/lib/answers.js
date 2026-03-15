import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * 回答（answers）の Firestore アクセスを集約する。
 * Questions の一括保存をここに寄せる。
 */

/**
 * 指定ルーム・ユーザーの回答を一括保存する。既存スキーマを維持する。
 * @param {string} roomId
 * @param {string} userId
 * @param {Array<{ id: string }>} questions - question.id を持つオブジェクトの配列
 * @param {Record<string, string>} answersMap - questionId -> answerText
 * @param {Record<string, string>} memosMap - questionId -> memoText
 */
export async function saveAnswers(roomId, userId, questions, answersMap, memosMap) {
    await Promise.all(
        questions.map((q) => {
            const aid = `${roomId}_${userId}_${q.id}`;
            return setDoc(doc(collection(db, 'answers'), aid), {
                id: aid,
                roomId,
                userId,
                questionId: q.id,
                answerText: answersMap[q.id] || '',
                memoText: memosMap[q.id] || '',
            });
        })
    );
}
