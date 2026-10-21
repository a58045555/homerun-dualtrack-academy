# 平板啟動相容性修正（2026-10-22）

已確認的程式問題：app.js含兩個正規表示式lookbehind常值。Safari在16.4才加入支援；舊版即使沒有執行到該功能，也可能在解析整份腳本時失敗，使首頁無法啟動。來源：https://webkit.org/blog/13966/webkit-features-in-safari-16-4/

修正：移除lookbehind，改以字元位置判斷；將Array.at及String.replaceAll換成較早已有的陣列／字串操作。更新入口版本與腳本快取參數，保留原裝置紀錄和可相容的續作。

check-tablet.cjs檢查無lookbehind常值，並在缺少Array.at、String.replaceAll及原生structuredClone的VM中檢查啟動、四風格、作答與續作；225組主題字詞邊界比對通過。check-resume.cjs的468個續作組合與check-curriculum.cjs亦通過。

限制：不是實體iPad／Safari測試；尚未收到使用者平板型號、作業系統、瀏覽器或錯誤畫面，不能認定這是該平板唯一問題。若是無法連線而非啟動錯誤，還需檢查平板的網址、網路和瀏覽器回報。
