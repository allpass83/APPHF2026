export default function LoadingState({ label = '正在連線…' }) {
  return (
    <main className="center-page">
      <div className="spinner" aria-hidden="true" />
      <p>{label}</p>
    </main>
  );
}
