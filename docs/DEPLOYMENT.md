# GitHub Pages 部署

Vite 使用相對 `base: './'`，因此可部署在 GitHub Pages repository 子路徑。GitHub Actions 建置完成後將 `dist` 上傳至 Pages artifact；部署前必須通過 typecheck、lint、unit、E2E 與 build。

Gemma、OCR 語言包與遠端修復服務都不把金鑰寫入 workflow。Service Worker 只快取前端 shell；外部 AI 仍需網路，且必須通過 UI 授權。
