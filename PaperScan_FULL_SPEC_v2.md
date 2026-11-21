# PaperScan — 手機版 AI 文件掃描器完整開發規格

> 版本：2.0（一次性交付完整功能）  
> 目標平台：GitHub Pages / 行動瀏覽器 / PWA  
> 開發方式：交由 Codex 自主實作，完成全部功能並通過驗收後才算交付  
> 文檔日期：2026-11-21  
> 語言：介面預設繁體中文（zh-TW）

## 0. 本版修正與不可妥協的規則

本規格取代 v1.0 的 Phase 1–5 漸進式交付方式。Codex 可以在內部採用階段式工程流程與提交記錄，但**首次交付的產品必須涵蓋本文件全部功能**；不能以「稍後開發」「Coming soon」「假按鈕」「假 AI 修復」作為完成。需要使用者提供 API 金鑰或外部模型服務的功能，必須有已實作的設定介面、連線測試、實際呼叫、錯誤處理、文件說明；未設定時明確告知，並且不影響純本機掃描。

**最重要的技術界線：**

- GitHub Pages 是靜態託管服務，不提供可常駐的 GPU / Python / Node 後端。
- Gemma 4 是可讀取文件影像的視覺語言模型，應用於內容理解、品質診斷、處理參數與 OCR 輔助；不能把它的文字回答當成已經完成的像素層級修復。
- 平面文件的梯形／透視校正使用數學轉換；曲面書頁使用非線性網格去彎曲（dewarping）；折痕減輕使用照明估測、局部修補和可選的專用影像修復推論。三者不得混淆。
- 文件修復不得補造文字、數字、印章或簽名。所有處理非破壞性，保留原圖；顯示前後對照，使用者可返回原圖。
- 不承諾對嚴重失焦、遮擋、已遺失的文字資訊作真實恢復；應顯示品質限制與重新拍攝建議。

## 1. 產品目標

建立一款無需安裝原生 App 的行動文件掃描器。使用者以手機後置相機拍照、或從相簿匯入影像後，系統能自動判定矩形紙張輪廓、提供精確手動四角校正、將斜拍文件還原為平整矩形，接著進行陰影／折痕／模糊處理與 OCR，最後匯出圖片、多頁 PDF 或可搜尋的 PDF。支援 A4、A5、Letter、收據、作業紙、講義、表單、筆記、書頁等不同尺寸；**不可假設文件必為白紙或 A4。**

基本掃描與本機 OCR 不要求帳號或 API Key。進階 Gemma 分析及遠端 AI 修復採使用者自備金鑰或模型服務端點（BYOK/BYO endpoint）。

## 2. 完整端到端流程

1. 首次啟動顯示相機權限說明、隱私政策及「拍照 / 匯入圖片」。
2. 呼叫後置相機；支援對焦／曝光（裝置支援時）、閃光燈或補光（裝置支援時），可手動拍照，亦可在畫面穩定、文件輪廓穩定時提示或自動拍照。
3. 讀入完整原圖、處理 EXIF 旋轉，建立縮小預覽及原圖座標映射。
4. 以多策略自動尋找候選四邊形；畫出四角與輪廓，回報信心；高信心可自動完成初次裁切，仍允許進入編輯；低信心直接要求手動確認。
5. 使用者可拖動四角（按住時顯示放大鏡）、放大縮小、平移、重新偵測、重置及復原／重做。
6. 執行四點透視／梯形（Keystone）校正、水平與垂直校正、任意角度旋轉、90 度翻轉。自由長寬比、A4、A5、Letter、收據等為可選輸出比例。
7. 提供曲面校正（書頁彎曲與紙張波浪）；先以文字基線／頁邊線或模型估測曲率，建立稠密形變網格，再進行 remap；保留手動修正與「套用／還原」。
8. 提供原色、灰階、純黑白、智慧增強、去陰影、去折痕、去雜訊、亮度、對比、銳化、白平衡，並有可調強度。
9. 選用 Gemma 文件品質分析：判斷紙張、照明、折痕、模糊、反光、拍攝方向，產出有 schema 的 JSON 建議；經驗證才可套用參數。可選專用 AI 影像修復服務；不得把生成新文字的結果直接覆蓋原文。
10. 可選本機 OCR（繁體中文、英文，支援混合），查看辨識文字與框線、複製或匯出 TXT，搜尋及編輯 OCR 文字結果。
11. 連續掃描多頁；新增、刪除、重新拍攝、旋轉、重新編輯單頁、拖曳排序；自動保存工作進度。
12. 輸出 JPG、PNG、單頁 PDF、多頁 PDF、OCR 搜尋式 PDF；可自訂檔名、品質、頁面尺寸、邊距及文字層設定。
13. 使用 Web Share API（支援時）分享檔案；不支援時下載。退出後可重新開啟上次的本機工作階段。

## 3. 全功能清單與驗收

| ID | 功能 | 必須達到的使用者行為 | 完成判準 |
|---|---|---|---|
| F01 | 相機與匯入 | 前置/後置可切換（可用時）；預設後置；相簿匯入；拍照重拍 | iOS Safari、Android Chrome 可拍照與匯入 |
| F02 | 自動拍攝 | 在穩定畫面和高信心輪廓下自動拍照，可關閉 | 不連拍、避免晃動重複取樣 |
| F03 | 文件偵測 | 淺/深色背景、不同紙張顏色；輸出四角與信心 | 有誤判時能手動接管，永不強制錯切 |
| F04 | 四角調整 | 4 點觸控拖曳、局部放大鏡、縮放與平移 | 觸控、螢幕旋轉後座標正確；無交叉 |
| F05 | 透視與 T 型校正 | 四角透視、梯形、上下/左右 Keystone、旋轉與拉直 | 斜拍平面紙可轉為矩形，文字未被任意拉伸 |
| F06 | 曲面去彎曲 | 書頁彎曲／非線性矯正、網格預覽、強度調整 | 明顯曲線文字行有改善；失敗可取消 |
| F07 | 彩色/灰階/黑白 | 可切換且可預覽，不覆蓋原始圖片 | 匯出與預覽一致 |
| F08 | 去陰影/去折痕 | 光照場估算、文字保護、自適應對比、局部修補 | 折痕陰影減弱且不能刪失文字筆畫 |
| F09 | 文字清晰化 | 去雜訊、局部對比、銳化、模糊品質提示 | 有強度調整、原圖對照與重置 |
| F10 | Gemma | 可選 API Key、端點、模型；JSON 品質診斷 | 真實請求/回應、schema 校驗、連線錯誤可理解 |
| F11 | AI 影像修復 | 設定專用模型端點；上傳前明確同意；取得影像結果 | 未設定清楚標示；已設定必須真實呼叫並回傳影像，不得假裝完成 |
| F12 | OCR | 繁體中文、英文、混合辨識，顯示區塊與文字 | 可搜尋、複製、匯出 TXT、逐頁重跑 |
| F13 | 可搜尋 PDF | 符合座標映射的隱藏文字層 | 常見 PDF 閱讀器可搜尋已辨識詞句 |
| F14 | 多頁作業 | 連續掃描、刪除、複製、排序、單頁編輯 | 所見頁序與輸出 PDF 頁序一致 |
| F15 | 匯出 | JPG / PNG / 單頁 PDF / 多頁 PDF | 圖片可正常開啟；PDF 尺寸與方向正確 |
| F16 | 本機持久化 | IndexedDB 暫存原圖、角點、處理參數、OCR | 重整頁面可以恢復掃描工作 |
| F17 | PWA/離線 | 可安裝；核心掃描、編輯、匯出離線可用 | 安裝所需資源與 OCR 語言包後可離線運作 |
| F18 | 隱私、安全與清理 | 不自動上傳；手動刪除所有本機資料和金鑰 | Network 驗證預設不傳送掃描內容 |
| F19 | 可及性 | 觸控目標、文字對比、焦點、狀態提示 | 手機直/橫向介面正常，不會卡住 |
| F20 | 部署與測試 | GitHub Pages 自動發布、端到端測試 | CI 綠燈、正式路徑能直接開啟 |

### 3.1 「T 型校正」定義

本規格將原始需求中的「T 型校正」實作為**梯形校正 / Keystone Correction / 透視校正**，同時提供垂直、水平及四點自由校正；另外加入非線性曲面校正。不要僅實作旋轉後宣稱已完成梯形校正。

### 3.2 自動邊緣偵測演算法

採組合式偵測，支援多個候選：

1. 在原圖保留 EXIF 校正資訊，取約 1024–1600px 長邊的工作預覽，原圖保留高解析度輸出。
2. 使用 Lab / HSV / RGB 亮度與色差分析，搭配區域照明正規化、Gaussian/Bilateral 平滑及 Canny 邊緣。
3. 擷取輪廓：findContours → convex hull → approxPolyDP；必要時使用 HoughLinesP 合併長直線並推算四角。
4. 候選分數綜合面積、凸性、角度、四邊長、邊緣連續性、內外部色差、畫面位置及裁切合理性；不能只採最大白色輪廓。
5. 使用排序後的 TL/TR/BR/BL 角點，所有座標以原圖 normalized [0,1] 保存；排除自相交和面積過小四邊形。
6. 低信心：保留近似四角候選且提示手動調整；完全無候選：預設中央可拖動矩形。
7. 遮擋、反光、桌面同色、文件內部表格線、影子和多張紙為必測案例。

### 3.3 四角拖曳 UI

- Canvas/SVG overlay 疊於圖片上；四邊框清楚可見，四個圓點觸控有效區至少約 44×44 CSS px。
- 以 Pointer Events 處理 pointerdown/move/up/cancel；設定適合的 touch-action，避免拖角時整頁捲動。
- 拖角期間顯示 3–4 倍局部放大鏡，中心顯示精準十字準星；放大鏡不得遮住當前角點。
- 縮放／拖曳圖片的 transform 與原圖座標分離，畫面尺寸改變後可重投影。
- 正式執行 warp 前檢查凸性、四角順序、面積、邊長是否合理；提供 Undo / Redo。

### 3.4 透視校正、輸出幾何

- `cv.getPerspectiveTransform(srcPts, dstPts)` + `cv.warpPerspective`。
- 輸出長寬比預設參考對邊長度和透視資訊推估，不能將所有文件硬套 A4；當資訊不足使用者可選自由/A4/A5/Letter/收據。
- 提供 auto-rotate、90 度左右旋轉、180 度、任意角度 deskew、上下/左右 Keystone 修正；變換應以非破壞性參數堆疊實作。
- 預覽在縮圖處理，最終輸出從原圖重新執行演算法，以限制重複插值造成的品質損失。
- 支援高解析度輸出但限制 Canvas 尺寸以免低記憶體裝置崩潰；必要時分塊處理並允許使用者選擇品質。

### 3.5 曲面文件校正

- 不得以四點透視轉換冒充書頁去彎曲。提供 `DewarpEngine` 抽象：
  - 預設本機實作：以 OCR 行框/文字基線、頁邊線、局部直線估測曲率；建立分段連續的水平/垂直矯正網格，再做雙線性/雙三次取樣。
  - 可選專用模型：經驗證、具合法授權、已能在瀏覽器 ONNX/WASM/WebGPU 執行的文檔去彎曲模型，或使用者提供的遠端修復端點。
- 提供「曲面校正」開關、強度與前後對照；線條資訊不足時顯示低信心，不要強行扭曲。
- 驗收使用書籍中央彎曲、單張波浪形紙張、四角透視混合彎曲等測例。

### 3.6 去陰影、皺摺、清晰化

- 使用文字保護的影像增強流程：照明場平滑估測 → 背景校正 → 局部對比增強（CLAHE）→ 適度去噪 → 自適應二值化/色彩保留 → 可調銳化。
- 去皺摺最低可用能力：減輕皺摺的亮度／顏色陰影，避免抹去文字；幾何皺摺由曲面/網格校正處理。
- 進階專用 AI 修復：提供 `RestorationProvider` 介面，能呼叫真正以影像輸入/影像輸出工作的模型服務，非聊天模型文字輸出。服務須支援 CORS 或同源代理（GitHub Pages 不能提供後端代理）。
- 修復圖片需套用像素/文字保護檢查（OCR 差異提示、人工前後滑桿比較）；不自動替換原始文件。
- 可手動調整增強強度，並有「重設」「保存處理版本」及「回原圖」。

## 4. Gemma 與外部 AI 規格

### 4.1 Gemma 角色

Gemma 是**文件品質分析器與影像增強參數顧問**：輸入裁切後低解析度文件圖，輸出 JSON 格式的可讀性評估、瑕疵類型、是否需要重拍、推薦的本機影像處理參數，不直接輸出「修復好的圖片」。Gemma 4 可透過支援該模型的 Google Gemini API 或自建相容服務提供，模型名稱不可硬編碼為唯一選項；提供端點與模型設定。

建議的 JSON 輸出：

```json
{
  "rotationDeg": 0,
  "issues": {"shadow": 0.8, "crease": 0.6, "blur": 0.2, "glare": 0.1, "curvature": 0.3},
  "recommendations": {"contrast": 0.25, "denoise": 0.2, "sharpen": 0.15, "shadowRemoval": 0.8, "dewarp": 0.3},
  "retakeSuggested": false,
  "warnings": []
}
```

所有數值依本地 JSON Schema 驗證、裁限範圍，非合法值一律拒絕套用。不得讓模型的任意輸出直接執行程式。

### 4.2 API 設定與安全

- UI 有 Provider 類型、Base URL、Model ID、API Key、測試連線、已使用 token/成本（若供應者返回）、清除金鑰。
- BYOK 金鑰預設僅存在 session memory；若提供「記住金鑰」，需明確告知瀏覽器端儲存風險並由使用者主動勾選。
- GitHub Actions、repo、前端 bundle 及 log **絕不可內建共享金鑰**。任何使用者輸入瀏覽器的金鑰都可被該使用者的瀏覽器環境與擴充程式存取，不能宣稱絕對安全。
- 寄出文件圖像之前，顯示「此影像將傳至你設定的服務」的確認選項、目的端與隱私提醒。取消後不傳輸。
- 網路錯誤、逾時、CORS、429、模型不存在和 401/403 要有具體可理解提示；可選擇退回本機演算法。

### 4.3 AI 修復服務合約

設定 `RestorationProvider.restore(inputImage, options): Promise<RestorationResult>`。可採任意合規的影像輸入／影像輸出服務，只要透過明確的 Provider adapter 完成 request/response，並確認服務真的返回影像。

`RestorationResult` 至少包含 imageBlob, provider, model, processingFlags, warnings, elapsedMs；檢查 MIME、尺寸、內容完整性。若服務不提供修復影像，必須顯示不可用，不得用文字診斷或隨意套用銳化冒充該服務成功。

## 5. OCR 與可搜尋 PDF

- 預設使用 Tesseract.js WASM 在本機運行；語言包含 `chi_tra`、`eng`，可單獨或混合載入，選擇是否下載語言包以供離線使用。
- OCR 應於完成幾何校正與文字增強後執行；結果保存文字、bounding boxes、confidence、語言與對應頁面處理版本。
- 編輯角點、旋轉或曲面校正後，OCR 結果須標為過期並重新辨識或提示使用者重新執行。
- 顯示 OCR 覆蓋框、結果文字、搜尋結果定位、複製文字、`.txt` 匯出。
- 用 pdf-lib 等 PDF 工具產出可搜尋 PDF；文字層座標、旋轉、縮放與最終影像完全一致。處理繁體中文 Unicode 字型，文字層可搜尋/複製；若 OCR 信心不足，不可默默將錯字當作真實原文。
- 多頁 PDF 依頁序輸出，提供頁面大小、自動依圖、固定 A4/A5/Letter、邊距、方向、圖片壓縮品質。單頁圖片輸出 JPG、PNG。

## 6. 使用者介面（Mobile First）

**畫面 A：相機／匯入** — 頂部權限／閃光燈／切換相機；中央全幅預覽與邊框偵測；底部相簿、拍攝鍵、自動拍攝開關、已有頁數。拍攝後儘可能直接進入校正。

**畫面 B：四角校正** — 原圖全幅、四角控制點、半透明外部遮罩；拖曳放大鏡；工具列「重偵測」「重設」「旋轉」「梯形」「套用」。

**畫面 C：進階形狀校正** — 透視/Keystone/曲面去彎曲；網格疊圖、強度滑桿、套用、還原、前後比較。

**畫面 D：文件清晰化** — 上方結果即時預覽；底部濾鏡列（原色、灰階、黑白、增強、去陰影、去折痕）；細部滑桿；「Gemma 分析」「AI 影像修復」入口；若需外傳先確認。

**畫面 E：OCR** — 頁面縮圖與框線、OCR 語言切換、重跑、檢索、文字修訂、複製及匯出 TXT。

**畫面 F：多頁總覽** — 縮圖拖曳排序、加入下一頁、批次旋轉/刪除、單頁重編輯、輸出選擇。

**畫面 G：設定** — AI Provider、API Key、安全保存、影像處理品質、PWA/離線資源管理、資料清理、隱私說明。

- 介面預設繁體中文、單手使用友善；大尺寸按鈕與底部控制列。
- 使用者每一步都應有清楚的 Loading / Progress / Cancel；超大圖片顯示縮圖進度而不是空白畫面。
- 直橫向切換、瀏覽器返回、手機螢幕鎖定恢復後，狀態不應遺失或無法操作。

## 7. 技術選型與工程架構

| 類別 | 建議實作 |
|---|---|
| 前端 | React + TypeScript + Vite + Tailwind CSS |
| 路由 | 專案相對路徑或 hash router，避免 GitHub Pages deep-link 404 |
| 相機 | `navigator.mediaDevices.getUserMedia()`；`ImageCapture` 可用時使用；fallback `<input type="file" accept="image/*" capture="environment">` |
| 幾何與影像 | OpenCV.js、Canvas 2D、OffscreenCanvas（可用時） |
| 背景處理 | Web Worker、可取消作業、可觀測處理進度 |
| 曲面模型 | 自行實作文字行/幾何網格，並保留 ONNX Runtime Web adapter |
| OCR | Tesseract.js（本機） |
| Gemma | 可設定 Google Gemini API Gemma 4 或相容模型服務 |
| 遠端影像修復 | 可設定 REST adapter：image-in/image-out |
| PDF | pdf-lib + 支援 Unicode 字型嵌入方案 |
| 儲存 | IndexedDB（原圖 Blob、頁面、修改參數）＋ session memory（API Key） |
| PWA | Web App Manifest + Service Worker，workbox 或同等策略 |
| 測試 | Vitest、Playwright、手動 iOS Safari / Android Chrome matrix |
| 部署 | GitHub Actions → GitHub Pages，Vite `base` 設定正確 |

### 7.1 目錄建議

```text
paperscan/
├── .github/workflows/deploy.yml
├── public/{icons,models,ocr,manifest.webmanifest}/
├── src/
│   ├── app/{App,router,state}/
│   ├── components/{Camera,CornerEditor,Loupe,ScanPreview,PageGallery,ExportDialog,Settings}/
│   ├── engines/
│   │   ├── documentDetection/
│   │   ├── perspective/
│   │   ├── dewarping/
│   │   ├── enhancement/
│   │   ├── ocr/
│   │   └── export/
│   ├── ai/{GemmaProvider,RestorationProvider,ProviderRegistry,schema}/
│   ├── services/{camera,permissions,files,share,pwa}/
│   ├── workers/{image.worker,ocr.worker}/
│   ├── storage/{indexedDb,migrations,session}/
│   ├── types/
│   └── styles/
├── tests/{unit,integration,e2e,fixtures,golden}/
├── docs/{ARCHITECTURE,PRIVACY,QA,DEPLOYMENT,MODEL_LICENSES}.md
├── AGENTS.md
├── README.md
├── package.json
└── vite.config.ts
```

### 7.2 影像資料模型

```typescript
type Point = { x: number; y: number };  // normalized original image coordinates [0,1]
type Page = {
  id: string;
  originalBlobId: string;
  originalWidth: number;
  originalHeight: number;
  corners: [Point, Point, Point, Point]; // TL, TR, BR, BL
  outputAspect: 'auto' | 'A4' | 'A5' | 'Letter' | 'receipt' | 'free';
  geometry: { rotationDeg: number; keystoneX: number; keystoneY: number; dewarpEnabled: boolean; dewarpStrength: number };
  enhancement: { mode: 'color'|'gray'|'bw'|'smart'; shadow: number; crease: number; contrast: number; denoise: number; sharpen: number };
  ocr?: { language: string[]; text: string; blocks: unknown[]; basedOnRevision: number };
  revision: number;
};
type ScanProject = { id: string; title: string; pages: Page[]; createdAt: number; updatedAt: number };
```

所有處理參數應可序列化；應用重新載入後需能從原圖與參數重建輸出。

## 8. PWA、效能與隱私

- 首次啟動只下載核心前端與必要的 WASM；OCR 語言資料／大型模型按需下載並提示大小和網路使用。
- 已下載且快取完整的核心功能（相機、文件偵測、校正、一般增強、匯出、已下載 OCR 語言）應可離線運作；Gemma / 雲端修復需連線且不得被標示為離線可用。
- 預覽長邊目標約 1280px（依裝置可調）；輸出從原圖重算。避免反覆對全尺寸圖片套用多次轉換。
- 主執行緒不執行耗時的逐像素處理；重要任務提供取消、逾時、資源釋放、錯誤回復。
- 處理超大圖片時有記憶體保護及品質／尺寸選項；無法處理時給出原因和縮小建議，而非瀏覽器當掉。
- 預設所有影像留在本機；除必要靜態資源載入外，無未授權的文件上傳；不整合第三方分析追蹤掃描內容。
- 可「刪除單頁」「刪除整個專案」「清除全部本機資料」「清除 API Key」。
- 不可暗中保存原始圖片在 console、遠端 log、測試快照或 telemetry。

## 9. 測試資料與完成定義（DoD）

### 9.1 必備影像情境

至少準備以下自製或授權影像 fixture，不可只以桌面畫布模擬：

1. 白色 A4 / 深色桌面；白色 A4 / 淺色桌面；淺黃色紙 / 木紋桌面。
2. A5、Letter、狹長收據、手寫筆記、印有大型表格的表單。
3. 斜拍（上下梯形、左右梯形）、旋轉 20–30 度、陰影、反光、手機拍攝模糊。
4. 部分邊角遮住、兩張紙重疊、背景存在其它矩形物件。
5. 書籍內頁弧形、波浪紙面、明顯折痕、彩色插圖 + 文字共存。
6. 繁體中文、英文、雙語、數字表格、文件印章／簽名（驗證不能被造假）。

### 9.2 自動化測試

- Unit：點座標轉換、角點排序、凸多邊形檢查、輸出長寬比、透視矩陣、OCR 座標、provider schema。
- Integration：影像匯入 → 偵測 → 校正 → 增強 → OCR → PDF；刪除／重排／狀態恢復。
- E2E：手機尺寸 viewport 中可完成 3 頁文件、調整四角、修改其中一頁、切換濾鏡、輸出 PDF，並重開恢復工作階段。
- AI mock：Gemma 合法 JSON／非法 JSON、API 401／429／timeout／CORS；影像修復成功、返回非圖片及影像尺寸不符時皆有正確處理。
- 安全：沒有啟用 AI 時，掃描圖片不得對外傳輸；使用者取消授權後不得上傳。
- CI：typecheck、lint、unit tests、build、最少一套 E2E，全部通過才部署。

### 9.3 手機實機測試

- iOS Safari：拍照、相簿、手動四角、旋轉、清晰化、多頁、OCR、匯出、分享、PWA。
- Android Chrome：同上。
- 模擬低記憶體情境、離線情境、網路不穩、API 失敗與頁面重整。
- 記錄已知的瀏覽器限制；不可把未驗證的 WebGPU 模型能力標示成普遍相容。

### 9.4 完成標準

全部 F01–F20 均需有：實際 UI、可執行實作、至少一個對應測試、具體操作文件。對高風險修復／OCR 功能須標註信心與局限。若外部 API 未提供金鑰，交付仍須包含真正的整合流程、測試方式和可清楚辨識的不可用狀態；不能聲稱未設定的遠端模型已經執行。

**不允許：** TODO 擋住必備路徑、mock 影像假裝 AI 修復、以靜態假圖代替實際相機拍照、用 CSS transform 代替透視重採樣、用單純四點 warp 假裝完成曲面 dewarping、在 localStorage 明文偷偷保存使用者 API Key。

## 10. Codex 執行指令（直接貼給 Codex）

> 你是資深前端／電腦視覺工程師。請在目前 GitHub 專案中依照 `PaperScan_FULL_SPEC_v2.md` 完整建立 PaperScan。這是**一次性交付完整版本**，不是 MVP、不是概念樣板、也不是分階段展示。必須實作 F01–F20 的每個項目，並提供真正可操作的使用者介面、完整演算法、錯誤處理、文件與自動化測試。可以按照模組依序開發，但不可以留下「未來再做」的必備功能。優先確保 iPhone Safari 與 Android Chrome 可以拍照、拖曳四角、修正梯形/透視/曲面、清晰化、OCR、多頁匯出和恢復工作階段。
>
> 前端只能部署到 GitHub Pages；一般掃描、OCR 和匯出在本機完成。Gemma 只做品質分析與參數建議，不冒充影像修復。專用影像修復必須有可運作的 provider adapter、API 設定、真實 image-in/image-out 連線及明確的隱私授權；當使用者尚未設定服務時，顯示限制並提供本機去陰影／折痕減輕。不得任意生成新文字或改動文件事實。
>
> 完成後執行 typecheck、lint、unit/integration/E2E、production build，修復全部失敗；設置 GitHub Actions Pages 部署。最後回報：已完成的功能清單、測試結果、實機測試結果（實際驗證才可聲稱）、外部模型設定流程、部署 URL（實際部署成功才提供）與確實存在的限制。不得把程式尚未實作的功能描述成已完成。

## 11. 官方參考資料

- Vite / GitHub Pages 部署：https://vite.dev/guide/static-deploy.html
- GitHub Pages 自動部署：https://docs.github.com/en/get-started/start-your-journey/deploying-your-website-automatically
- getUserMedia 相機：https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
- OpenCV.js 幾何變換：https://docs.opencv.org/4.x/dd/d52/tutorial_js_geometric_transformations.html
- Gemma 4 Vision：https://ai.google.dev/gemma/docs/capabilities/vision
- Gemma / Gemini API：https://gemma.ai/deployment/gemini-api/
- ONNX Runtime Web：https://onnxruntime.ai/docs/get-started/with-javascript/web.html
- Tesseract.js：https://github.com/naptha/tesseract.js
- 曲面校正研究參考 DocTr：https://github.com/yaleh/doctr

註：參考專案和預訓練模型的授權、權重可得性、手機執行環境、部署體積及相容性，均須由 Codex 在整合時個別確認，不得直接假設所有模型可在 GitHub Pages 與 iPhone 上原生運行。
