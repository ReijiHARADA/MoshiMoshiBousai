import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Firestore コレクションをリアルタイムで監視する汎用 Hook
 *
 * @param {string} collectionName - Firestoreコレクション名
 * @param {Array} conditions - where条件の配列 例: [['roomId', '==', 'abc123']]
 * @returns {{ data: Array, loading: boolean, error: Error|null }}
 */
export function useRealtimeCollection(collectionName, conditions = []) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // conditions に undefined/null が含まれていたら購読しない
        const hasInvalidCondition = conditions.some(
            (c) => c[2] === undefined || c[2] === null
        );
        if (hasInvalidCondition) {
            setLoading(false);
            return;
        }

        const collRef = collection(db, collectionName);
        const constraints = conditions.map(([field, op, value]) =>
            where(field, op, value)
        );
        const q = constraints.length > 0 ? query(collRef, ...constraints) : collRef;

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const docs = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setData(docs);
                setLoading(false);
            },
            (err) => {
                console.error(`Firestore onSnapshot error (${collectionName}):`, err);
                setError(err);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [collectionName, JSON.stringify(conditions)]);

    return { data, loading, error };
}
