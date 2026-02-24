// =====================================================
// 大廳頻道設定檔
// =====================================================
//
// nameTemplate 支援兩個變數：
//   {number} → 自動遞增的房間編號（空位優先補位）
//   {user}   → 建立者的 Discord 顯示名稱
//
// 範例：
//   "LoL 語音房 {number}"      → LoL 語音房 1 / LoL 語音房 2 ...
//   "🎯 {user} 的房間"         → 🎯 小明 的房間
//   "Valorant #{number}"       → Valorant #1 / Valorant #2 ...
//
// =====================================================

module.exports = [

  // === MOBA ===
  {
    lobbyId: "LOBBY_CHANNEL_ID_1",
    nameTemplate: "LoL 語音房 {number}",
    defaultLimit: 5,
  },
  {
    lobbyId: "LOBBY_CHANNEL_ID_2",
    nameTemplate: "傳說對決 語音房 {number}",
    defaultLimit: 5,
  },

  // === 射擊遊戲 ===
  {
    lobbyId: "LOBBY_CHANNEL_ID_3",
    nameTemplate: "Valorant 語音房 {number}",
    defaultLimit: 5,
  },
  {
    lobbyId: "LOBBY_CHANNEL_ID_4",
    nameTemplate: "CS2 語音房 {number}",
    defaultLimit: 5,
  },
  {
    lobbyId: "LOBBY_CHANNEL_ID_5",
    nameTemplate: "Apex 語音房 {number}",
    defaultLimit: 3,
  },

  // === 大逃殺 ===
  {
    lobbyId: "LOBBY_CHANNEL_ID_6",
    nameTemplate: "PUBG 語音房 {number}",
    defaultLimit: 4,
  },

  // === 格鬥遊戲 ===
  {
    lobbyId: "LOBBY_CHANNEL_ID_7",
    nameTemplate: "格鬥遊戲 語音房 {number}",
    defaultLimit: 2,
  },

  // === 生存/開放世界 ===
  {
    lobbyId: "LOBBY_CHANNEL_ID_8",
    nameTemplate: "生存遊戲 語音房 {number}",
    defaultLimit: 0,
  },

  // === 策略遊戲 ===
  {
    lobbyId: "LOBBY_CHANNEL_ID_9",
    nameTemplate: "策略遊戲 語音房 {number}",
    defaultLimit: 0,
  },

  // === RPG ===
  {
    lobbyId: "LOBBY_CHANNEL_ID_10",
    nameTemplate: "RPG 語音房 {number}",
    defaultLimit: 0,
  },

  // === 恐怖遊戲 ===
  {
    lobbyId: "LOBBY_CHANNEL_ID_11",
    nameTemplate: "恐怖遊戲 語音房 {number}",
    defaultLimit: 0,
  },

  // === 派對遊戲 ===
  {
    lobbyId: "LOBBY_CHANNEL_ID_12",
    nameTemplate: "派對遊戲 語音房 {number}",
    defaultLimit: 0,
  },

  // === 沙盒/模擬 ===
  {
    lobbyId: "LOBBY_CHANNEL_ID_13",
    nameTemplate: "沙盒遊戲 語音房 {number}",
    defaultLimit: 0,
  },

  // === 桌遊/休閒 ===
  {
    lobbyId: "LOBBY_CHANNEL_ID_14",
    nameTemplate: "桌遊 語音房 {number}",
    defaultLimit: 0,
  },

  // === 音樂/節奏 ===
  {
    lobbyId: "LOBBY_CHANNEL_ID_15",
    nameTemplate: "音樂遊戲 語音房 {number}",
    defaultLimit: 0,
  },

  // === 其他/混合 ===
  {
    lobbyId: "LOBBY_CHANNEL_ID_16",
    nameTemplate: "遊戲語音房 {number}",
    defaultLimit: 0,
  },

  // 繼續往下加，沒有數量限制
];
