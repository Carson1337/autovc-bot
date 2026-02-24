// =====================================================
// messageCreate 事件處理
// 負責：偵測 !setup-apply 指令 → 發送申請選單
// =====================================================

const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require('discord.js');
const { PLATFORMS, SETUP_COMMAND } = require('../../config/applyConfig');

function buildPlatformSelect() {
  return new StringSelectMenuBuilder()
    .setCustomId('platform_select')
    .setPlaceholder('🎮 請先選擇遊戲平台...')
    .addOptions(
      PLATFORMS.map(p => ({
        label: p.label,
        value: p.value,
        emoji: p.emoji,
      }))
    );
}

module.exports = {
  name: 'messageCreate',

  async execute(message) {
    if (message.author.bot) return;
    if (message.content !== SETUP_COMMAND) return;

    try {
      const row = new ActionRowBuilder().addComponents(buildPlatformSelect());
      await message.channel.send({
        content: [
          '### 📌 【遊戲專區｜開版申請】',
          '請在下方選單 **選擇您要申請的遊戲平台**，選擇後將跳出申請表單。',
          '*送出前請確認您已了解並同意遵守 Discord ToS 與本群規範。*',
        ].join('\n'),
        components: [row],
      });
      await message.delete().catch(() => {});
    } catch (err) {
      console.error('[ApplyBot] ❌ handleSetupCommand:', err);
    }
  },
};
