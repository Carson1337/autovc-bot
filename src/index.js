// =====================================================
// index.js - Bot 主程式入口
// 功能一：Auto Voice Channel（自動語音房）
// 功能二：開版申請系統（平台選單 → Modal → 管理員審核）
// =====================================================

require('dotenv').config();
const { Client, GatewayIntentBits, Events } = require('discord.js');
const fs   = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,      // 開版申請：偵測 !setup-apply
    GatewayIntentBits.GuildVoiceStates,   // AutoVoice：偵測語音狀態
    GatewayIntentBits.GuildMembers,       // AutoVoice：取得成員資訊
    GatewayIntentBits.MessageContent,     // 開版申請：讀取訊息內容
  ],
});

// ─── 自動載入 src/events/ 下所有事件 ─────────────────────────
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(path.join(eventsPath, file));
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
  console.log(`[Events] 載入：${event.name} (${file})`);
}

// ─── Bot Ready ────────────────────────────────────────────────
client.once(Events.ClientReady, c => {
  console.log(`\n✅ Bot 已上線！登入為：${c.user.tag}`);
  console.log(`📡 伺服器數量：${c.guilds.cache.size}`);
  console.log(`🎮 AutoVoice + 開版申請系統 準備就緒\n`);
  c.user.setActivity('語音房管理中', { type: 3 });
});

// ─── 全域錯誤處理 ─────────────────────────────────────────────
process.on('unhandledRejection', err => console.error('[UnhandledRejection]', err));
process.on('uncaughtException',  err => console.error('[UncaughtException]', err));

client.login(process.env.DISCORD_TOKEN);
