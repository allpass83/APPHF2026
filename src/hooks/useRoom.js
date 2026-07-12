import { useEffect, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { db, ensureAnonymousUser, isFirebaseConfigured } from '../firebase';
import { getFriendlyError } from '../utils';

export function useRoom(roomId) {
  const [room, setRoom] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let unsubscribe = null;
    let cancelled = false;

    async function connect() {
      if (!isFirebaseConfigured || !db) {
        setError('Firebase 尚未設定。');
        setLoading(false);
        return;
      }

      try {
        const currentUser = await ensureAnonymousUser();
        if (cancelled) return;
        setUser(currentUser);

        unsubscribe = onValue(
          ref(db, `rooms/${roomId}`),
          (snapshot) => {
            if (cancelled) return;
            setRoom(snapshot.exists() ? snapshot.val() : null);
            setLoading(false);
          },
          (readError) => {
            if (cancelled) return;
            setError(getFriendlyError(readError));
            setLoading(false);
          },
        );
      } catch (connectError) {
        if (cancelled) return;
        setError(getFriendlyError(connectError));
        setLoading(false);
      }
    }

    connect();

    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, [roomId]);

  return { room, user, loading, error };
}
