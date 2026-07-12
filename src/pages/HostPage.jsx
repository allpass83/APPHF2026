import { useMemo, useState } from 'react';
import { remove, ref, update } from 'firebase/database';
import { QRCodeSVG } from 'qrcode.react';
import { Link, useParams } from 'react-router-dom';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import { db } from '../firebase';
import { useRoom } from '../hooks/useRoom';
import { getFriendlyError, getVoteCounts } from '../utils';
import { createAppUrl } from '../appUrl';

export default function HostPage() {
  const { roomId } = useParams();
  const { room, user, loading, error: loadError } = useRoom(roomId);
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);
  const counts = useMemo(() => getVoteCounts(room?.votes), [room?.votes]);
  const total = counts[1] + counts[2] + counts[3];
  const voteUrl = createAppUrl(`/vote/${roomId}`);
  const screenUrl = createAppUrl(`/screen/${roomId}`);
  const isOwner = Boolean(room && user && room.createdBy === user.uid);

  if (loading) return <LoadingState />;
  if (loadError) return <ErrorState message={loadError} />;
  if (!room) return <ErrorState title="找不到房間" message="請確認房間代碼是否正確。" />;

  async function runAction(action) {
    setBusy(true);
    setActionError('');
    try {
      await action();
    } catch (error) {
      setActionError(getFriendlyError(error));
    } finally {
      setBusy(false);
    }
  }

  async function toggleStatus() {
    await runAction(() => update(ref(db, `rooms/${roomId}`), {
      status: room.status === 'open' ? 'closed' : 'open',
    }));
  }

  async function resetVotes() {
    const confirmed = window.confirm('確定要清除目前所有票數嗎？');
    if (!confirmed) return;
    await runAction(() => remove(ref(db, `rooms/${roomId}/votes`)));
  }

  async function copyText(value) {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      setActionError('瀏覽器無法自動複製，請手動選取網址。');
    }
  }

  return (
    <main className="host-page">
      <header className="topbar">
        <Link to="/" className="brand-link">球球投票</Link>
        <span className={`status-pill ${room.status}`}>
          {room.status === 'open' ? '投票進行中' : '投票已關閉'}
        </span>
      </header>

      <section className="host-header">
        <div>
          <p className="eyebrow">HOST CONTROL</p>
          <h1>{room.title}</h1>
          <p>房間代碼 <strong>{roomId}</strong>・目前共 {total} 票</p>
        </div>
        <div className="host-actions">
          <button className="button primary" disabled={!isOwner || busy} onClick={toggleStatus}>
            {room.status === 'open' ? '結束投票' : '重新開放'}
          </button>
          <button className="button danger" disabled={!isOwner || busy} onClick={resetVotes}>
            清空票數
          </button>
        </div>
      </section>

      {!isOwner && (
        <p className="warning-banner">這個瀏覽器不是房間建立者，因此只能查看，無法控制或重設投票。</p>
      )}
      {actionError && <p className="error-banner">{actionError}</p>}

      <section className="host-grid">
        <article className="qr-panel">
          <div className="qr-wrap">
            <QRCodeSVG value={voteUrl} size={230} level="M" marginSize={2} />
          </div>
          <h2>請觀眾掃描投票</h2>
          <p className="mono-link">{voteUrl}</p>
          <button className="text-button" onClick={() => copyText(voteUrl)}>複製投票網址</button>
        </article>

        <article className="result-panel">
          <div className="result-summary">
            {[1, 2, 3].map((choice) => (
              <div key={choice} className={`summary-card choice-${choice}`}>
                <span>選項 {choice}</span>
                <strong>{counts[choice]}</strong>
                <small>票</small>
              </div>
            ))}
          </div>

          <div className="screen-launch">
            <div>
              <h2>開啟大螢幕動畫</h2>
              <p>投影這個頁面，觀眾每投一票就會新增球體。</p>
            </div>
            <a className="button secondary" href={screenUrl} target="_blank" rel="noreferrer">
              開啟大螢幕
            </a>
          </div>
        </article>
      </section>
    </main>
  );
}
