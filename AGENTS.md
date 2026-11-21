# AGENTS.md — PaperScan Codex 實作規則

你正在建置 PaperScan：GitHub Pages 託管、手機優先、隱私優先的完整 AI 文件掃描器。請先閱讀 `PaperScan_FULL_SPEC_v2.md`，其中 F01–F20 **全部屬於第一版必備功能**。

## 工作方式

1. 不要先詢問是否把某個功能延到第二階段。可內部分拆任務，但首次交付必須涵蓋所有功能。
2. 以可用的實作及測試為完成標準，不可只產生 mock UI、placeholder 或成功假資料。
3. 影像檢測、四角拖曳、透視裁切、曲面校正、去陰影與折痕減輕、OCR、多頁 PDF 都必須能在沒有 AI Key 的基本情境中運作。
4. Gemma 的角色是影像品質分析和參數建議；不得把 VLM 文字輸出視為圖片修復結果。
5. 專用影像修復 provider 應具備使用者設定頁、實際 image-in/image-out 通訊、完整錯誤處理和明確上傳同意；未設定時誠實標示不可使用，不得假裝已修復。
6. 始終保留原始影像，所有編輯使用版本化、可恢復的參數。不得憑 AI 生成新文字、簽名、數字或印章。
7. 手機實際相機 API 與影像坐標需特別測試；Canvas 預覽與原圖輸出分離，避免記憶體耗盡。
8. 公開網頁 bundle 不得包含任何共享 API Key。使用者輸入的 Key 預設不持久化，不得外洩掃描內容。
9. 所有新增依賴須確認授權及瀏覽器相容性，避免加入只能在 Node/Python 後端運作的 runtime。
10. 使用 TypeScript 嚴格模式、清楚的模組邊界、error boundary、取消機制與 loading 狀態。

## 技術約束

- React + TypeScript + Vite + Tailwind CSS
- OpenCV.js / Canvas / Web Worker，必要時 ONNX Runtime Web
- OCR：Tesseract.js；PDF：pdf-lib + 支援 CJK 的字型與文字層
- IndexedDB 保存掃描工作；PWA 本機快取
- GitHub Pages: 正確設置 `base`、相對資源路徑、GitHub Actions deploy
- 實機主要目標：iOS Safari、Android Chrome

## 提交前必跑

- `npm ci`、`npm run typecheck`、`npm run lint`、`npm run test`、`npm run build`
- 有配置時 `npm run test:e2e`；需有至少一套端到端流程。
- 檢查 F01–F20 每項有 UI、實際邏輯、測試、文件。
- 檢查 `docs/QA.md` 紀錄未實測項目，不得宣稱已驗證。
- 檢查預設不將使用者影像送至網路，AI 授權後才會發送。
- 檢查 CORS / 離線 / PWA / model download 失敗情境有明確 UI 反饋。

## 完成回報格式

- 功能對照：F01–F20 真實實作位置、測試結果。
- CI: typecheck / lint / unit / E2E / build 的實際結果。
- 瀏覽器驗證：列出有實機測過和未測過的裝置。
- AI 設定：Gemma model、端點設定與 image restoration provider 使用說明。
- 部署：只有 Pages 真正部署後才回報可用 URL。
- 限制：如低階手機 AI 模型性能或未提供外部 API Key，必須明確揭露。
