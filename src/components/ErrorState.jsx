import { Link } from 'react-router-dom';

export default function ErrorState({ title = '無法開啟', message }) {
  return (
    <main className="center-page">
      <div className="state-icon">!</div>
      <h1>{title}</h1>
      <p>{message}</p>
      <Link className="button secondary" to="/">回到首頁</Link>
    </main>
  );
}
