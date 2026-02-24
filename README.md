# 🎮 AutoVoice Bot

Discord 自動語音房 Bot，支援無限大廳頻道，房主可完整控制語音房。

---

## 📁 專案結構

```
autovoice-bot/
├── config/
│   └── lobbies.js          ← 設定你的大廳頻道（填入頻道 ID）
├── src/
│   ├── index.js            ← Bot 主程式
│   ├── roomManager.js      ← 語音房狀態管理
│   ├── deploy-commands.js  ← 一次性：註冊 Slash Commands
│   ├── commands/
│   │   └── room.js         ← /room 指令群組
│   └── events/
│       └── voiceStateUpdate.js  ← 自動建立/刪除房間邏輯
├── .env                    ← 你的金鑰（不要上傳到 git）
├── .env.example            ← 設定範本
├── .gitignore
└── package.json
```

---

## 🚀 安裝步驟

### 1. 建立 Discord Bot

1. 前往 [Discord Developer Portal](https://discord.com/developers/applications)
2. 點「New Application」，輸入名稱
3. 左側選「Bot」→「Add Bot」
4. 複製 **Token**（之後填入 `.env`）
5. 開啟以下 **Privileged Gateway Intents**：
   - ✅ `SERVER MEMBERS INTENT`
   - ✅ `VOICE STATE` （預設已開，確認一下）
6. 左側選「OAuth2 → URL Generator」
   - Scopes：`bot`、`applications.commands`
   - Bot Permissions：
     - `Manage Channels`
     - `Move Members`
     - `Mute Members`
     - `Deafen Members`
     - `View Channels`
     - `Connect`
7. 複製生成的 URL，在瀏覽器開啟，把 Bot 加入你的伺服器

### 2. 設定環境變數

```bash
cp .env.example .env
```

編輯 `.env`：

```env
DISCORD_TOKEN=你的Bot Token
CLIENT_ID=你的Application ID
GUILD_ID=你的Discord伺服器ID
```

> 取得 ID 方法：Discord 右下角「進階設定」→ 開啟「開發者模式」，然後右鍵點選即可複製 ID

### 3. 安裝套件

```bash
npm install
```

### 4. 設定大廳頻道

編輯 `config/lobbies.js`，把每個遊戲分類的大廳頻道 ID 填進去：

```js
{
  lobbyId: "123456789012345678",  // ← 大廳頻道的 ID
  nameTemplate: "🎯 {user} 的房間",
  defaultLimit: 0,  // 0 = 無限制
}
```

> **如何取得頻道 ID**：開啟開發者模式後，右鍵點選頻道 → 複製 ID

### 5. 部署 Slash Commands（只需執行一次）

```bash
node src/deploy-commands.js
```

### 6. 啟動 Bot

```bash
npm start
```

---

## 🎮 使用方式

### 建立語音房
直接加入任何一個「大廳」頻道，Bot 會自動：
1. 幫你建立一個以你名字命名的語音房
2. 把你移進去
3. 給你房主權限

離開房間後若無其他人，房間會自動刪除。

### 房主控制指令

| 指令 | 說明 |
|------|------|
| `/room name <名稱>` | 修改房間名稱 |
| `/room limit <人數>` | 設定人數上限（0 = 無限制） |
| `/room lock` | 🔒 鎖房，禁止新人加入 |
| `/room unlock` | 🔓 解鎖，開放加入 |
| `/room kick <成員>` | 踢出成員 |
| `/room transfer <成員>` | 轉移房主身份 |
| `/room info` | 查看房間目前狀態 |

---

## 🖥️ VPS 部署建議

### 使用 PM2（推薦）

```bash
npm install -g pm2

# 啟動並常駐背景
pm2 start src/index.js --name autovoice-bot

# 開機自動啟動
pm2 startup
pm2 save
```

常用 PM2 指令：
```bash
pm2 status           # 查看狀態
pm2 logs autovoice-bot   # 查看 log
pm2 restart autovoice-bot
pm2 stop autovoice-bot
```

---

## ➕ 新增更多大廳頻道

只要在 `config/lobbies.js` 裡繼續加物件就好，**沒有數量限制**：

```js
{
  lobbyId: "新的頻道ID",
  nameTemplate: "🎲 {user} 的新遊戲",
  defaultLimit: 4,
}
```

改完後重新啟動 Bot：`pm2 restart autovoice-bot`

---

## 🔧 常見問題

**Q：Bot 建不了頻道？**  
A：確認 Bot 有「管理頻道」和「移動成員」權限，且 Bot 的身份組在該分類的權限中是允許的。

**Q：指令沒有出現？**  
A：執行 `node src/deploy-commands.js`，等約 1 分鐘讓 Discord 更新。

**Q：VPS 重開後 Bot 就掛了？**  
A：使用 PM2 並執行 `pm2 startup && pm2 save`。
