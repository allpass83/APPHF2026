import { useState } from 'react';
import { get, ref, set } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import SetupNotice from '../components/SetupNotice';
import { db, ensureAnonymousUser, isFirebaseConfigured } from '../firebase';
import { createRoomCode, getFriendlyError, normalizeRoomCode } from '../utils';

export default function HomePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('請選擇你的答案');
  const [roomCode, setRoomCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  async function findAvailableCode() {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const code = createRoomCode();
      const snapshot = await get(ref(db, `rooms/${code}`));
      if (!snapshot.exists()) return code;
    }
    throw new Error('暫時無法產生房間代碼，請再試一次。');
  }

  async function handleCreate(event) {
    event.preventDefault();
    if (!title.trim()) return;

    setCreating(true);
    setError('');

    try {
      const user = await ensureAnonymousUser();
      const code = await findAvailableCode();
      await set(ref(db, `rooms/${code}`), {
        createdBy: user.uid,
        title: title.trim(),
        status: 'open',
        createdAt: Date.now(),
      });
      navigate(`/host/${code}`);
    } catch (createError) {
      setError(getFriendlyError(createError));
    } finally {
      setCreating(false);
    }
  }

  function openRoom(mode) {
    const code = normalizeRoomCode(roomCode);
    if (code.length !== 6) {
      setError('請輸入六位房間代碼。');
      return;
    }
    navigate(`/${mode}/${code}`);
  }

  return (
    <main className="home-page">
      <section className="hero">
        <p className="eyebrow">LIVE AUDIENCE VOTING</p>
        <h1>即時球球投票</h1>
        <p>觀眾掃描 QR Code，在手機選擇 1、2、3；大螢幕即時用掉落球體呈現票數。</p>
      </section>

      {!isFirebaseConfigured && <SetupNotice />}

      <section className="home-grid">
        <form className="panel" onSubmit={handleCreate}>
          <div className="panel-number">01</div>
          <h2>建立新投票</h2>
          <label htmlFor="title">大螢幕題目</label>
          <input
            id="title"
            value={title}
            maxLength={100}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="例如：你最喜歡哪個方案？"
          />
          <button className="button primary" disabled={creating || !isFirebaseConfigured}>
            {creating ? '正在建立…' : '建立投票房間'}
          </button>
        </form>

        <section className="panel">
          <div className="panel-number">02</div>
          <h2>加入既有房間</h2>
          <label htmlFor="room-code">六位房間代碼</label>
          <input
            id="room-code"
            className="room-code-input"
            value={roomCode}
            inputMode="text"
            autoCapitalize="characters"
            onChange={(event) => setRoomCode(normalizeRoomCode(event.target.value))}
            placeholder="ABC123"
          />
          <div className="button-row">
            <button className="button secondary" type="button" onClick={() => openRoom('vote')}>
              手機投票
            </button>
            <button className="button secondary" type="button" onClick={() => openRoom('screen')}>
              大螢幕
            </button>
          </div>
        </section>
      </section>

      {error && <p className="error-banner">{error}</p>}
    </main>
  );
}
