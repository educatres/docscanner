# PaperScan

PaperScan 是手機優先、隱私優先的瀏覽器文件掃描器。相機、四角校正、透視／梯形校正、曲面去彎曲、影像清晰化、OCR、多頁管理與基本匯出都在瀏覽器中執行。

## 開發

```text
npm ci
npm run dev
npm run typecheck
npm run lint
npm run test
npm run test:e2e
npm run build
```

GitHub Pages 建置使用相對路徑，部署 workflow 位於 `.github/workflows/deploy.yml`。

## AI 設定

Gemma 是文件品質分析與處理參數顧問，不會被當作影像修復器。設定頁需要使用者自行提供相容模型端點、模型 ID 和 API Key；Key 預設只在工作階段記憶體中，只有勾選「記住金鑰」才寫入瀏覽器儲存。

影像修復需要真正支援 `multipart image-in/image-out` 的 REST endpoint，並在每次上傳前勾選同意。未設定時仍可使用本機去陰影、去折痕減輕與清晰化。

## 文件

- `PaperScan_FULL_SPEC_v2.md`：完整規格
- `docs/FEATURE_MATRIX.md`：F01–F20 對照
- `docs/QA.md`：測試與尚未實機驗證項目
- `docs/PRIVACY.md`：資料、金鑰與外傳界線
- `docs/ARCHITECTURE.md`：模組與資料流程
- `docs/DEPLOYMENT.md`：GitHub Pages 部署
- `docs/MODEL_LICENSES.md`：模型與依賴授權檢查
