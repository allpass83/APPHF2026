import { useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useParams } from 'react-router-dom';
import BallBoard from '../components/BallBoard';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import { useRoom } from '../hooks/useRoom';
import { getVoteCounts } from '../utils';
import { createAppUrl } from '../appUrl';

export default function ScreenPage() {
  const { roomId } = useParams();
  const { room, loading, error } = useRoom(roomId);
  const counts = useMemo(() => getVoteCounts(room?.votes), [room?.votes]);
  const total = counts[1] + counts[2] + counts[3];
  const voteUrl = createAppUrl(`/vote/${roomId}`);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!room) return <ErrorState title="找不到房間" message="請確認大螢幕網址或房間代碼。" />;

  async function enterFullscreen() {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen?.();
    } else {
      await document.exitFullscreen?.();
    }
  }

  return (
    <main className="screen-page">
      <header className="screen-header">
        <div className="screen-title">
          <p className="eyebrow">LIVE VOTE・{roomId}</p>
          <h1>{room.title}</h1>
          <p><strong>{total}</strong> 人已投票</p>
        </div>

        <div className="screen-tools">
          <button className="fullscreen-button" onClick={enterFullscreen}>全螢幕</button>
          <div className="screen-qr">
            <QRCodeSVG value={voteUrl} size={126} level="M" marginSize={1} />
            <div>
              <strong>掃描投票</strong>
              <span>{roomId}</span>
            </div>
          </div>
        </div>
      </header>

      <section className="screen-board-area">
        <BallBoard counts={counts} />
      </section>

      {room.status === 'closed' && (
        <div className="closed-overlay">
          <span>投票已結束</span>
        </div>
      )}
    </main>
  );
}
