import { useMemo, useState } from 'react';
import { ref, set } from 'firebase/database';
import { Link, useParams } from 'react-router-dom';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import { db } from '../firebase';
import { useRoom } from '../hooks/useRoom';
import { getFriendlyError } from '../utils';

export default function VotePage() {
  const { roomId } = useParams();
  const { room, user, loading, error: loadError } = useRoom(roomId);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const existingVote = useMemo(() => {
    if (!room?.votes || !user) return null;
    return room.votes[user.uid] || null;
  }, [room?.votes, user]);

  if (loading) return <LoadingState label="正在進入投票…" />;
  if (loadError) return <ErrorState message={loadError} />;
  if (!room) return <ErrorState title="找不到投票" message="QR Code 可能已失效，請向主持人確認。" />;

  async function castVote(choice) {
    if (!user || submitting || existingVote || room.status !== 'open') return;

    setSubmitting(true);
    setError('');
    try {
      await set(ref(db, `rooms/${roomId}/votes/${user.uid}`), {
        choice: String(choice),
        createdAt: Date.now(),
      });
    } catch (voteError) {
      setError(getFriendlyError(voteError));
    } finally {
      setSubmitting(false);
    }
  }

  if (existingVote) {
    return (
      <main className="vote-page success-page">
        <div className="success-check">✓</div>
        <p className="eyebrow">VOTE RECEIVED</p>
        <h1>投票成功</h1>
        <p>你選擇了 <strong className={`inline-choice choice-${existingVote.choice}`}>{existingVote.choice}</strong></p>
        <p className="muted">請觀看大螢幕上的即時球體結果。</p>
      </main>
    );
  }

  return (
    <main className="vote-page">
      <header className="vote-header">
        <Link to="/" className="brand-link">球球投票</Link>
        <span className={`status-pill ${room.status}`}>
          {room.status === 'open' ? '可投票' : '已關閉'}
        </span>
      </header>

      <section className="vote-card">
        <p className="eyebrow">ROOM {roomId}</p>
        <h1>{room.title}</h1>
        <p className="vote-hint">請點選一個答案，送出後不能修改。</p>

        <div className="vote-options">
          {[1, 2, 3].map((choice) => (
            <button
              key={choice}
              className={`vote-option choice-${choice}`}
              disabled={room.status !== 'open' || submitting}
              onClick={() => castVote(choice)}
            >
              <span>{choice}</span>
            </button>
          ))}
        </div>

        {room.status !== 'open' && <p className="warning-banner">主持人目前已關閉投票。</p>}
        {error && <p className="error-banner">{error}</p>}
        <p className="privacy-note">匿名投票・不需要輸入姓名</p>
      </section>
    </main>
  );
}
