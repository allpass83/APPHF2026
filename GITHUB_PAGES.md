# 上傳 GitHub 與啟用 GitHub Pages

這個版本已加入 GitHub Actions。每次把程式推送到 `main` 分支，GitHub 都會自動安裝套件、建置 Vite 專案並發布到 GitHub Pages。

## 一、建立 GitHub Repository

1. 登入 GitHub，按右上角 `＋` → `New repository`。
2. Repository name 建議填：`live-ball-vote`。
3. 使用 GitHub Free 時，若要免費使用 Pages，建議選擇 `Public`。
4. 不要勾選自動建立 README、.gitignore 或 License，然後按 `Create repository`。

## 二、將專案推送至 GitHub

在解壓縮後的專案資料夾開啟 PowerShell：

```powershell
git init
git add .
git commit -m "Initial live ball vote"
git branch -M main
git remote add origin https://github.com/你的GitHub帳號/live-ball-vote.git
git push -u origin main
```

若電腦尚未安裝 Git，可安裝 Git for Windows，或直接在 GitHub Repository 內選擇 `Add file` → `Upload files`，上傳解壓縮後的檔案。不要只上傳 ZIP。

## 三、加入 Firebase Repository Secrets

專案不會把 `.env` 上傳 GitHub。請進入 Repository：

`Settings` → `Secrets and variables` → `Actions` → `New repository secret`

逐一建立以下 7 個 Secrets，值與你電腦 `.env` 內的設定相同：

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_DATABASE_URL`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

注意：Vite 的 `VITE_` 變數會被編譯進前端，因此 Firebase 的真正保護仍須依靠 `database.rules.json`，不能只依靠變數隱藏。

## 四、啟用 GitHub Pages

1. Repository → `Settings` → `Pages`。
2. 在 `Build and deployment` 的 `Source` 選擇 `GitHub Actions`。
3. 到 Repository 的 `Actions` 頁籤。
4. 找到 `Deploy to GitHub Pages`，等候出現綠色勾勾。

網站網址通常會是：

```text
https://你的GitHub帳號.github.io/live-ball-vote/
```

若 Firebase Authentication 顯示網域未授權，請到 Firebase Console 的 Authentication → Settings → Authorized domains，加入 `你的GitHub帳號.github.io`。

## 五、部署 Firebase Database Rules

GitHub Pages 只負責網頁，Realtime Database 規則仍需部署到 Firebase。首次設定時，在本機執行：

```powershell
npm install -g firebase-tools
firebase login
firebase use --add
firebase deploy --only database
```

## 六、日後更新網站

修改程式後執行：

```powershell
git add .
git commit -m "Update voting website"
git push
```

GitHub Actions 會自動重新發布。

## 常見問題

### Actions 顯示 Firebase 變數未設定

代表 Repository Secrets 尚未完整建立，或名稱有拼字錯誤。Secret 名稱必須與上方清單完全相同。

### 網站打得開，但建立房間失敗

確認 Firebase Authentication 已啟用 Anonymous／匿名登入，Realtime Database 已建立，而且 Database Rules 已部署。

### QR Code 掃描後網址有 `#/vote/...`

這是正常的。專案使用 Hash Router，能避免 GitHub Pages 在重新整理投票頁時出現 404。
