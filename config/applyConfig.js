// =====================================================
// 開版申請系統設定
// =====================================================

module.exports = {

  // 平台清單（顯示在下拉選單）
  PLATFORMS: [
    { label: 'Steam',            value: 'Steam',  emoji: '🖥️' },
    { label: 'Origin / EA',      value: 'EA',     emoji: '🎮' },
    { label: 'EPIC',             value: 'EPIC',   emoji: '🟣' },
    { label: '手遊 (Mobile)',    value: '手遊',   emoji: '📱' },
    { label: 'PS (PlayStation)', value: 'PS',     emoji: '🎮' },
    { label: 'XBOX',             value: 'XBOX',   emoji: '💚' },
    { label: 'SWITCH',           value: 'SWITCH', emoji: '🔴' },
  ],

  // 送出申請的冷卻時間（毫秒）
  COOLDOWN_MS: 10_000,

  // 觸發發布申請選單的指令
  SETUP_COMMAND: '!setup-apply',
};
