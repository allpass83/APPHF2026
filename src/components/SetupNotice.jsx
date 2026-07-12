export default function SetupNotice() {
  return (
    <section className="notice-card">
      <div className="notice-icon">⚙️</div>
      <div>
        <h2>尚未連接 Firebase</h2>
        <p>
          請複製 <code>.env.example</code> 成 <code>.env</code>，填入 Firebase 網頁應用程式設定，
          再重新執行 <code>npm run dev</code>。
        </p>
      </div>
    </section>
  );
}
