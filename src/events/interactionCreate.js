// =====================================================
// interactionCreate 事件處理
// 負責：平台下拉選單 → Modal → 管理員審核按鈕
// =====================================================

const {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { COOLDOWN_MS } = require('../../config/applyConfig');

// 防止短時間內重複送出（userId → timestamp）
const cooldowns = new Map();

// ─── 工具函式 ──────────────────────────────────────────────────

function checkCooldown(userId) {
  const last = cooldowns.get(userId) ?? 0;
  const remaining = COOLDOWN_MS - (Date.now() - last);
  if (remaining > 0) return Math.ceil(remaining / 1000);
  cooldowns.set(userId, Date.now());
  return 0;
}

function generateApplyId() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

// ─── UI 建構 ───────────────────────────────────────────────────

function buildApplyModal(platform) {
  const modal = new ModalBuilder()
    .setCustomId(`apply_modal_${platform}`)
    .setTitle(`開版申請單 ─ ${platform}`);

  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('gameName')
        .setLabel('申請遊戲名稱')
        .setStyle(TextInputStyle.Short)
        .setMinLength(1)
        .setMaxLength(100)
        .setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('reason')
        .setLabel('推薦理由與簡介')
        .setStyle(TextInputStyle.Paragraph)
        .setMinLength(10)
        .setMaxLength(1000)
        .setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('tos')
        .setLabel('同意遵守 Discord ToS 與群規（請填寫：是）')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('是')
        .setMaxLength(5)
        .setRequired(true)
    ),
  );

  return modal;
}

function buildAdminEmbed(applyId, user, platform, gameName, reason) {
  return new EmbedBuilder()
    .setTitle('🆕 新的遊戲專區開版申請')
    .setColor(0x2ecc71)
    .setThumbnail(user.displayAvatarURL({ dynamic: true }))
    .addFields(
      { name: '🔖 申請編號', value: `\`${applyId}\``,                         inline: true  },
      { name: '📅 申請時間', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true  },
      { name: '\u200B',      value: '\u200B',                                  inline: false },
      { name: '👤 申請人',   value: `<@${user.id}> (${user.tag})`,            inline: false },
      { name: '🎮 遊戲名稱', value: gameName,                                  inline: true  },
      { name: '🏷️ 平台',    value: platform,                                  inline: true  },
      { name: '📝 推薦理由', value: reason,                                    inline: false },
      { name: '✅ 規範同意', value: '申請人已確認同意遵守 Discord ToS 與群規', inline: false },
    )
    .setFooter({ text: `申請 ID: ${applyId}` })
    .setTimestamp();
}

function buildAdminButtons(applyId) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`approve_${applyId}`)
      .setLabel('✅ 核准')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`reject_${applyId}`)
      .setLabel('❌ 拒絕')
      .setStyle(ButtonStyle.Danger),
  );
}

// ─── 各互動處理 ────────────────────────────────────────────────

async function handlePlatformSelect(interaction) {
  const remainingSec = checkCooldown(interaction.user.id);
  if (remainingSec > 0) {
    return interaction.reply({
      content: `⏳ 請稍後再試，冷卻中（剩餘 ${remainingSec} 秒）。`,
      ephemeral: true,
    });
  }
  try {
    await interaction.showModal(buildApplyModal(interaction.values[0]));
  } catch (err) {
    console.error('[ApplyBot] ❌ handlePlatformSelect:', err);
    await interaction.reply({ content: '❌ 系統錯誤，請稍後再試。', ephemeral: true }).catch(() => {});
  }
}

async function handleModalSubmit(interaction) {
  const platform  = interaction.customId.replace('apply_modal_', '');
  const gameName  = interaction.fields.getTextInputValue('gameName').trim();
  const reason    = interaction.fields.getTextInputValue('reason').trim();
  const tosAnswer = interaction.fields.getTextInputValue('tos').trim();

  if (!['是', 'yes', 'YES', 'Yes'].includes(tosAnswer)) {
    return interaction.reply({
      content: '❌ 申請失敗：最後一欄請填寫「**是**」以確認同意遵守規範。',
      ephemeral: true,
    });
  }

  const adminChannel = interaction.client.channels.cache.get(process.env.ADMIN_CHANNEL_ID);
  if (!adminChannel) {
    console.error('[ApplyBot] ❌ 找不到 ADMIN_CHANNEL_ID');
    return interaction.reply({
      content: '❌ 系統錯誤：找不到管理員頻道，請聯繫管理團隊。',
      ephemeral: true,
    });
  }

  try {
    await interaction.deferReply({ ephemeral: true });
    const applyId = generateApplyId();
    await adminChannel.send({
      embeds: [buildAdminEmbed(applyId, interaction.user, platform, gameName, reason)],
      components: [buildAdminButtons(applyId)],
    });
    await interaction.editReply({
      content: `✅ 申請已成功送出！編號：\`${applyId}\`\n請靜候管理團隊審核，結果將透過 DM 或公告通知。`,
    });
  } catch (err) {
    console.error('[ApplyBot] ❌ handleModalSubmit:', err);
    await interaction.editReply({ content: '❌ 送出時發生錯誤，請稍後再試。' }).catch(() => {});
  }
}

async function handleAdminButton(interaction) {
  const isApprove = interaction.customId.startsWith('approve_');
  const action    = isApprove ? '✅ 核准' : '❌ 拒絕';
  const color     = isApprove ? 0x2ecc71 : 0xe74c3c;

  try {
    const updatedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
      .setColor(color)
      .addFields({
        name: action,
        value: `由 <@${interaction.user.id}> 於 <t:${Math.floor(Date.now() / 1000)}:R> 處理`,
        inline: false,
      });
    await interaction.update({ embeds: [updatedEmbed], components: [] });
  } catch (err) {
    console.error('[ApplyBot] ❌ handleAdminButton:', err);
    await interaction.reply({ content: '❌ 操作失敗。', ephemeral: true }).catch(() => {});
  }
}

// ─── 主 execute，統一分派 ──────────────────────────────────────

module.exports = {
  name: 'interactionCreate',

  async execute(interaction) {
    // 平台選單
    if (interaction.isStringSelectMenu() && interaction.customId === 'platform_select') {
      return handlePlatformSelect(interaction);
    }
    // 申請 Modal
    if (interaction.isModalSubmit() && interaction.customId.startsWith('apply_modal_')) {
      return handleModalSubmit(interaction);
    }
    // 管理員審核按鈕
    if (interaction.isButton() &&
       (interaction.customId.startsWith('approve_') || interaction.customId.startsWith('reject_'))) {
      return handleAdminButton(interaction);
    }
  },
};
