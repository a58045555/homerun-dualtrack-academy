# 小小探索學院・AI 協作交接（2026-10-31）

給接手或協作的 AI（GPT／Codex／Claude）。先讀這份，再動程式。

## 1. 現況

| 項目 | 內容 |
| --- | --- |
| 正式站 | https://homerun-dualtrack-academy.vercel.app/ |
| Repository | https://github.com/a58045555/homerun-dualtrack-academy |
| main | 7b04ebf（之後若有新提交，以 GitHub 為準） |
| 正式版標記 | index.html 的 `academy-release` = `2026-10-27-free-level` |
| 部署 | 推到 main 後 Vercel 自動部署；用 GitHub commit status（context: Vercel）確認 success |
| 技術 | 純 HTML/CSS/JS，無 build、無 npm、無後端。主要程式在 `assets/app.js`（大型 IIFE，CRLF 換行） |

## 2. 2026-10-22 之後已上線的變更

| commit | 內容 |
| --- | --- |
| 92fc2f6 | 測試隔離（check-dictation.cjs、curriculum-runtime.cjs）與 run-checks.cjs 進 repo |
| 3549d03 | 注音「看圖找注音」大圖在上、語詞在下；數獨第 1 級保證 ？ 只看同排／列／田字格可解 |
| 6560f39 | 注音「聽音找符號」答完解析上方顯示例詞大圖（`answerPicture`） |
| 66744a5 | 注音選項 2×2 大卡片；大班卡片下方加例詞圖（`symbolChoices`/`syllableChoices`） |
| 74d4acd | 數獨 ？ 格黃底標示，題目寫「黃色的 ？」 |
| a4fb3f0 | 星星（每回合 1～3 顆）、每 5 星開一張主題卡（每風格 12 張）、吉祥物、答對噴發動畫與連擊音效、選項移到題目正下方、短答案 2×2 |
| ec193f1 | 首頁科目卡片短句化；作答中隱藏上方導覽列 |
| a662219 | 首頁「學習島」SVG 地圖：每科一座島、島上小房子＝練習模式、依時間變天色 |
| 5572064 | 學習島 v2：吉祥物沿虛線走、練完該島跳動噴星、星星越多島上裝飾越多、房子放大 |
| 7b04ebf | 家長區「允許超出年級的難度」開關（`settings.freeLevel`，預設關） |

## 3. 不可擅自改的行為

- 名稱「小小探索學院」；四風格：棒球、太空、公主、動物。
- 九九乘法 1～9 全 81 組、全混合、獨立於難度。
- 免費、無帳號、無付費、無贊助、無雲端登入。
- 忘記家長密碼＝本機數學驗證。
- 儲存鍵不可改名或清除：`homerun_profiles_v1`、`baseball_dualtrack_v1`、`baseball_dualtrack_v1__<id>`、`homerun_parent_pin_v1`、`__previous`。
- 續作格式 `DRAFT_FORMAT=1`、`DRAFT_CURRICULUM=20261020-audit`；只在題目語意／正解變動時才考慮升版。
- 國語二下是原創先修，不可標成已核對的康軒 115 正式內容。
- 星星、卡片、學習島裝飾都由既有 `data.sessions` 推算，**沒有新增儲存資料**；請維持這個原則。

## 4. 程式結構重點

- `assets/app.js` 很多函式在後段被重新指定（`home`、`render`、`navigate`、`start`、`switchPlayer`、`visibleModes`、`resultBallpark`…）。改之前找最後生效版本。
- 新功能大多放在檔尾 `try{if(!sessionStorage.getItem(PICKED_KEY))page='login'}` 之前：
  - 星星／卡片：`starsFor`、`starTotal`、`themeCards`、`starStats`、`starResult`、`kidStrip`
  - 吉祥物／動畫：`MASCOT`、`mascotMarkup`、`celebrate`、`fanfare`、`playNotes`
  - 學習島：`islandMap`、`islandBuildings`、`walkMascot`、`ISLAND_POS`、`ISLAND_WORD`
- 難度：`effectiveLevel(sub, requested)`；年級上限在這裡，`data.settings.freeLevel===true` 時解除。
- 作答題目物件可帶的布林旗標要加進續作序列化白名單（搜尋 `'bigChoices','gridMain'`），字串欄位加進另一個白名單（搜尋 `'zySym','zyAnswerSym'`），否則續作時會遺失。
- 檔案是 CRLF；用字串取代修改時注意 `\r\n`。
- 每次上線請同步更新 `index.html` 的 4 個 `?v=` 快取參數和 `academy-release`。

## 5. 驗證

```
node run-checks.cjs --quick   # 約 12 秒
node run-checks.cjs           # 13 項完整離線測試
node preview.cjs              # http://127.0.0.1:8765/
```

- 輸出中的「Learning history was not readable … SyntaxError」是測試刻意餵壞資料，不是錯誤。
- 測試是 Node VM 模擬，**不是真實 Safari／iPad**。畫面變更請另外用瀏覽器實際操作。
- 目前尚未在使用者的實體手機／平板上驗證任何 10/22 之後的畫面。

## 6. 協作規則

1. 開工前先 `git pull`，讀這份與最新 commit；不要覆蓋對方改動，不做 `reset --hard`、不 force-push main。
2. **同一時間只有一方改 `assets/app.js`／`assets/styles.css`**。開始前告訴使用者「我現在要改哪些檔案」，結束後交回：改檔清單、commit hash、測試結果、未確認事項。
3. 一個任務一個 commit；commit 訊息說明改了什麼、為什麼、怎麼驗證。
4. 改題庫時人工核對正解與解析；不能只重算 `artifacts/*.json` 的雜湊。
5. 部署只由一方負責；推 main 前跑完整測試，推完確認 Vercel status success。

## 7. 待辦（依使用者優先順序）

- 使用者實機回饋：注音大圖、數獨黃格、星星／卡片、學習島在手機／平板上的大小與順暢度；動畫或音效是否太多。
- 審題：使用者有一份審題表（注音、數學、英文、科學、邏輯；依年級與難度列出）；收到標記清單後逐題修正。
- 平板打不開：使用者先前截圖是 LINE 內預覽的舊 HTML 檔（標題「全壘打雙軌學院_v21」），不是正式網址；請引導用 Safari 開正式網址再回報。另外 app.js 需 iOS／iPadOS 13.4 以上（使用 `?.` 與數字分隔符）。
- 可能的下一步：學習島改用手繪／像素風美術（尚未評估）、三年級以上分年級、二下康軒正式清單（待可核實資料）。
