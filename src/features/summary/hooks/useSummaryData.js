import { useRealtimeCollection } from '../../../hooks/useRealtimeCollection';

/**
 * Summary ページ用の Firestore リアルタイム購読。
 * users / answers / agreements を roomId で取得する責務のみを持つ。
 */
export function useSummaryData(roomId) {
    const { data: users } = useRealtimeCollection('users', [['roomId', '==', roomId]]);
    const { data: answers } = useRealtimeCollection('answers', [['roomId', '==', roomId]]);
    const { data: agreements } = useRealtimeCollection('agreements', [['roomId', '==', roomId]]);
    return { users, answers, agreements };
}
