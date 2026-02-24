// =====================================================
// index.js - Bot 主程式入口
// =====================================================

require("dotenv").config();
const { Client, GatewayIntentBits, Events } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
  ],
});

// ─── 載入 voiceStateUpdate 事件 ──────────────────────────────
const voiceEvent = require("./events/voiceStateUpdate");
client.on(voiceEvent.name, (...args) => voiceEvent.execute(...args));

// ─── Bot Ready ────────────────────────────────────────────────
client.once(Events.ClientReady, (c) => {
  console.log(`\n✅ Bot 已上線！登入為：${c.user.tag}`);
  console.log(`📡 監聽中的伺服器：${c.guilds.cache.size} 個`);
  console.log(`🎮 AutoVoice Bot 準備就緒\n`);
  c.user.setActivity("語音房管理中", { type: 3 });
});

// ─── 錯誤處理 ─────────────────────────────────────────────────
process.on("unhandledRejection", (err) => {
  console.error("[UnhandledRejection]", err);
});
process.on("uncaughtException", (err) => {
  console.error("[UncaughtException]", err);
});

client.login(process.env.DISCORD_TOKEN);
