import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * agreements の Firestore 書き込みを集約する。
 * 購読は既存の useRealtimeCollection に残す。
 */

/**
 * 合意を1件保存する。既存スキーマを維持する。
 * @param {object} agreementData - id, roomId, questionId, agreedText, memoText, createdAt
 */
export async function saveAgreement(agreementData) {
    await setDoc(doc(collection(db, 'agreements'), agreementData.id), agreementData);
}
