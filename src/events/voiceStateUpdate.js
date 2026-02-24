// =====================================================
// voiceStateUpdate 事件處理
// 偵測大廳加入 → 建立房間，房間空了 → 自動刪除
// 房主直接透過 Discord 原生介面管理頻道
// =====================================================

const lobbies = require("../../config/lobbies");
const { PermissionsBitField } = require("discord.js");

// 大廳快速查找 Map
const lobbyMap = new Map(lobbies.map((l) => [l.lobbyId, l]));

// 追蹤臨時房間：Map<channelId, { lobbyId, number }>
const tempChannels = new Map();

// 每個大廳各自的已使用號碼：Map<lobbyId, Set<number>>
const usedNumbers = new Map();

// 取得某個大廳下一個可用的最小號碼（填空缺優先）
function getNextNumber(lobbyId) {
  if (!usedNumbers.has(lobbyId)) usedNumbers.set(lobbyId, new Set());
  const used = usedNumbers.get(lobbyId);
  let n = 1;
  while (used.has(n)) n++;
  used.add(n);
  return n;
}

// 釋放號碼
function releaseNumber(lobbyId, number) {
  usedNumbers.get(lobbyId)?.delete(number);
}

module.exports = {
  name: "voiceStateUpdate",

  async execute(oldState, newState) {
    const member = newState.member ?? oldState.member;
    if (!member || member.user.bot) return;

    // ─── 1. 用戶加入大廳 → 建立臨時語音房 ─────────────────────
    if (newState.channel && lobbyMap.has(newState.channelId)) {
      const config = lobbyMap.get(newState.channelId);
      const guild = newState.guild;
      const category = newState.channel.parent;

      // 取得此大廳的下一個號碼，填入 {number} 或 {user}
      const roomNumber = getNextNumber(config.lobbyId);
      const roomName = config.nameTemplate
        .replace("{user}", member.displayName)
        .replace("{number}", roomNumber);

      try {
        const newChannel = await guild.channels.create({
          name: roomName,
          type: 2, // GuildVoice
          parent: category,
          userLimit: config.defaultLimit ?? 0,
          permissionOverwrites: [
            {
              id: member.id,
              allow: [
                PermissionsBitField.Flags.ManageChannels,
                PermissionsBitField.Flags.ManageRoles,
                PermissionsBitField.Flags.MoveMembers,
                PermissionsBitField.Flags.MuteMembers,
                PermissionsBitField.Flags.DeafenMembers,
                PermissionsBitField.Flags.PrioritySpeaker,
                PermissionsBitField.Flags.Connect,
                PermissionsBitField.Flags.Speak,
                PermissionsBitField.Flags.Stream,
                PermissionsBitField.Flags.UseEmbeddedActivities,
              ],
            },
          ],
        });

        await member.voice.setChannel(newChannel);

        // 記錄此頻道屬於哪個大廳、編號是幾號
        tempChannels.set(newChannel.id, {
          lobbyId: config.lobbyId,
          number: roomNumber,
        });

        console.log(
          `[AutoVoice] ✅ 建立房間：${roomName}（房主：${member.displayName}）`
        );
      } catch (err) {
        // 建立失敗，把號碼退回去
        releaseNumber(config.lobbyId, roomNumber);
        console.error(`[AutoVoice] ❌ 建立房間失敗：`, err);
      }

      return;
    }

    // ─── 2. 用戶離開臨時房間 → 空了就刪除 ──────────────────────
    if (
      oldState.channel &&
      tempChannels.has(oldState.channelId) &&
      oldState.channel.members.size === 0
    ) {
      const { lobbyId, number } = tempChannels.get(oldState.channelId);

      try {
        await oldState.channel.delete("AutoVoice：房間空了，自動刪除");
        console.log(`[AutoVoice] 🗑️  刪除空房間：${oldState.channel.name}`);
      } catch (_) {
        // 頻道可能已被手動刪除，忽略
      } finally {
        // 無論如何都要釋放號碼和記錄
        tempChannels.delete(oldState.channelId);
        releaseNumber(lobbyId, number);
      }
    }
  },
};
