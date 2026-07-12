# 即時球球投票

觀眾掃描 QR Code，在手機選擇 **1、2、3**；大螢幕會即時顯示票數，並用 Matter.js 的球體掉落動畫表現各選項多寡。

## 已完成的功能

- 主持人建立六位房間代碼
- 大螢幕與主持頁顯示 QR Code
- 手機匿名投票，不需要姓名或註冊
- 同一個 Firebase 匿名帳號在同一輪只能投一次
- 選項固定為 1、2、3
- Firebase Realtime Database 即時同步
- 大螢幕球體物理動畫與實際票數
- 開放／關閉投票
- 清空票數後重新開始
- 票數過多時自動調整視覺比例，數字仍顯示真實票數

## Windows 安裝步驟

### 1. 安裝 Node.js

建議安裝 Node.js 22 LTS。安裝完成後，重新開啟 PowerShell。

### 2. 安裝專案套件

在專案資料夾空白處按住 Shift＋滑鼠右鍵，選擇「在終端機中開啟」，執行：

```powershell
npm install
```

### 3. 建立 Firebase 專案

1. 前往 Firebase Console，新增專案。
2. 在「專案設定」新增 Web App。
3. 建立 Realtime Database。
4. 在 Authentication → Sign-in method 啟用 **Anonymous／匿名**。

### 4. 填入 Firebase 設定

複製 `.env.example`，重新命名為 `.env`，把 Firebase 提供的設定填入：

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_DATABASE_URL=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

`VITE_FIREBASE_DATABASE_URL` 必須使用 Realtime Database 頁面顯示的完整網址。

### 5. 部署安全規則

先安裝 Firebase CLI：

```powershell
npm install -g firebase-tools
firebase login
firebase use --add
firebase deploy --only database
```

專案已附上 `database.rules.json`。規則限制：

- 使用者必須經過 Firebase 匿名驗證才能讀取房間。
- 一個匿名 UID 只能新增一次投票。
- 只有建立房間的主持人能開關投票與清空票數。

### 6. 在電腦測試

```powershell
npm run dev
```

開啟終端機顯示的網址，例如：

```text
http://localhost:5173
```

注意：手機無法直接掃描 `localhost`。要用手機測試，最簡單的方式是先部署到 Firebase Hosting。

## 部署到 GitHub Pages

專案已內建 `.github/workflows/deploy-pages.yml`，可在推送到 GitHub 的 `main` 分支後自動發布。詳細步驟請查看 [GITHUB_PAGES.md](./GITHUB_PAGES.md)。

GitHub Pages 只負責前端網頁；Firebase Authentication、Realtime Database 與 Database Rules 仍由 Firebase 提供。

## 部署到 Firebase Hosting

把 `.firebaserc.example` 複製成 `.firebaserc`，填入 Firebase 專案 ID，然後執行：

```powershell
npm run build
firebase deploy --only hosting,database
```

部署完成後，Firebase 會提供 HTTPS 網址。從首頁建立房間，再按「開啟大螢幕」即可投影；網址會使用 `#/screen/房間碼`。

## 現場使用流程

1. 主持人從首頁建立投票。
2. 主持頁按「開啟大螢幕」。
3. 將大螢幕頁投影並按「全螢幕」。
4. 觀眾掃描右上角 QR Code。
5. 觀眾在手機選擇 1、2 或 3。
6. 球體與票數即時更新。
7. 主持人可結束投票或清空票數進行下一輪。

## 路由

- `#/`：首頁
- `#/host/ABC123`：主持人控制頁
- `#/vote/ABC123`：手機投票頁
- `#/screen/ABC123`：大螢幕動畫頁

## 匿名與防重複投票說明

系統不要求姓名，但會使用 Firebase Anonymous Authentication 產生匿名 UID。同一瀏覽器在未清除網站資料的情況下，同一輪只能投一次。使用不同裝置、無痕模式或清除網站資料仍可能再次投票，因此這是活動互動用的基本防重複機制，不是高風險正式選舉系統。
