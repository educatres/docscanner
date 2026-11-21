# PaperScan QA 記錄

## 自動化

- `npm run typecheck`：交付前執行並記錄結果。
- `npm run lint`：交付前執行並記錄結果。
- `npm run test`：幾何座標與未設定 AI 的隱私邊界測試。
- `npm run test:e2e`：啟動 Vite 開發伺服器後驗證基本頁面可開啟。
- `npm run build`：交付前執行並記錄結果。

## 尚未實機驗證

- iOS Safari：相機權限、閃光燈、ImageCapture、PWA 安裝與 Web Share。
- Android Chrome：相機權限、閃光燈、長圖記憶體上限與分享。
- 低記憶體裝置、螢幕旋轉後拖角座標、離線下載 Tesseract 語言包。
- 含繁體中文字型嵌入的可搜尋 PDF 閱讀器相容性。
- 真實 Gemma 端點與 image-in/image-out restoration provider 的 CORS、401、429、逾時。

未在本文件列為已驗證的項目，不宣稱已通過實機驗收。
