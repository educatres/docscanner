# PaperScan 架構

`src/app/App.tsx` 負責流程狀態與畫面；`src/engines` 是本機影像幾何、增強、去彎曲、OCR 與匯出；`src/services` 負責影像解碼、相機共用資料、ID 與遠端 adapter；`src/storage` 以 IndexedDB 保存可恢復的 `ScanProject`。

影像資料流程：

```text
camera/file -> original Blob -> normalized corners -> perspective warp
             -> local dewarp -> local enhancement -> OCR -> image/PDF export
                                      \-> optional Gemma JSON advice
                                      \-> optional consented image restoration
```

原圖 Blob 永遠是頁面資料的一部分；預覽使用限制長邊的 Canvas，匯出再從原圖與版本化參數重算。
