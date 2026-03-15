import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * room 関連の Firestore アクセスを集約する。
 */

/**
 * ルームを1件作成する。既存スキーマを維持する。
 * @param {string} roomId
 * @param {{ attributes: object }} roomData - attributes 必須
 */
export async function createRoom(roomId, roomData) {
    await setDoc(doc(db, 'rooms', roomId), {
        id: roomId,
        createdAt: serverTimestamp(),
        attributes: roomData.attributes || {},
    });
}

/**
 * ルームを1件取得する。存在しなければ null。
 * @param {string} roomId
 * @returns {Promise<{ id: string, attributes?: object } | null>}
 */
export async function getRoomById(roomId) {
    const roomDoc = await getDoc(doc(db, 'rooms', roomId));
    if (!roomDoc.exists()) return null;
    return { id: roomDoc.id, ...roomDoc.data() };
}
