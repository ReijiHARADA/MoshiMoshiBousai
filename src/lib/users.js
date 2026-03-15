import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * user 関連の Firestore アクセスを集約する。
 * Home / JoinRoom の user 作成ロジックの重複を減らす。
 */

/**
 * Firestore に user を1件保存する。既存スキーマを維持する。
 * @param {object} userData - id, roomId, name 等
 */
export async function createUser(userData) {
    const userId = userData.id;
    await setDoc(doc(collection(db, 'users'), userId), userData);
}

/**
 * Home（ルーム作成者）用の currentUser オブジェクトを組み立てる。
 * Firestore 保存・localStorage 保存の両方で同じ形を使う。
 */
export function buildUserForHome({ userId, roomId, name, location, attributes, otherText }) {
    const attrs = {
        ...(attributes || {}),
        otherText: (otherText || '').trim(),
        location: (location || '').trim(),
    };
    return {
        id: userId,
        roomId,
        name: (name || '').trim(),
        isCohabiting: true,
        location: (location || '').trim(),
        attributes: attrs,
    };
}

/**
 * JoinRoom（参加者）用の currentUser オブジェクトを組み立てる。
 */
export function buildUserForJoin({ userId, roomId, name, location, isCohabiting }) {
    return {
        id: userId,
        roomId,
        name: (name || '').trim(),
        location: (location || '').trim(),
        isCohabiting: isCohabiting === true,
        attributes: { location: (location || '').trim() },
    };
}
