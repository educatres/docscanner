# F01–F20 實作對照

| ID | 實作位置 | 驗證／限制 |
|---|---|---|
| F01 | `src/app/App.tsx` 相機、相簿、鏡頭切換 | Playwright UI 已驗證；iOS/Android 實機待驗 |
| F02 | `cameraOn`、`autoCapture` interval | 需實機確認穩定度與不重複拍攝 |
| F03 | `src/engines/documentDetection.ts` 多策略邊緣／凸包／fallback | 單元幾何測試；完整影像 fixture 待補 |
| F04 | `cornerEditor` Pointer Events、44px 控制點、loupe | 瀏覽器自動測試尚未覆蓋觸控拖曳 |
| F05 | `src/engines/perspective.ts` homography + warp、keystone、旋轉 | 透視 warp 為本機實作；不同角度 fixture 待補 |
| F06 | `src/engines/dewarping.ts` 非線性列切片去彎曲 | 書頁曲率效果尚未在實機量測 |
| F07 | `src/engines/enhancement.ts` color/gray/bw/smart | 可預覽與重設 |
| F08 | enhancement 的照明場、shadow、crease 參數 | 是減輕亮度／顏色陰影，不宣稱恢復遺失筆畫 |
| F09 | enhancement 的 denoise、contrast、sharpen、brightness | 有滑桿、重設與原圖保留 |
| F10 | `src/services/ai.ts` `analyzeWithGemma`、設定頁 | 真實 API adapter；未設定時按鈕停用 |
| F11 | `restoreImage` multipart image-in/image-out + consent | 未設定明確顯示不可用；真實服務需使用者端點與 CORS |
| F12 | `src/engines/ocr.ts` Tesseract.js chi_tra/eng | 本機 OCR；語言包首次下載時間依網路而定 |
| F13 | `src/engines/export.ts` pdf-lib + Noto Sans TC 隱藏文字層 | 常見閱讀器與繁中字型仍需實機檢查 |
| F14 | Gallery、多頁刪除、HTML5 拖曳排序、單頁編輯、多頁匯出 | 觸控裝置上的原生 drag/drop 相容性仍需實機驗 |
| F15 | JPG/PNG/單頁 PDF/多頁 PDF/Share fallback | 自動化 smoke 通過，檔案閱讀器矩陣待驗 |
| F16 | `src/storage/indexedDb.ts` 原圖 Blob + 參數 + OCR | 重整恢復流程已接入 |
| F17 | `public/sw.js`、manifest、離線 shell | OCR 語言包離線完整快取尚未實機驗證 |
| F18 | privacy banner、session memory Key、清理資料、consent | 未設定 AI 時不送影像由程式路徑保證；需 Network 實測 |
| F19 | 手機版 CSS、底部導覽、狀態提示、touch-action | iOS Safari/Android Chrome 尚未實機驗 |
| F20 | `.github/workflows/deploy.yml`、相對 base、Vitest/Playwright | CI workflow 尚未在 GitHub Actions 真跑 |

這份矩陣刻意保留未實測項目；請以 `docs/QA.md` 為準，不把未驗證的裝置或遠端服務描述成已通過。
