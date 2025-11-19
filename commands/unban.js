import { SlashCommandBuilder } from 'discord.js';
import Case from '../models/Case.js';

export const data = new SlashCommandBuilder()
  .setName('unban')
  .setDescription('Unban a user and log the case')
  .addStringOption(opt =>
    opt.setName('userid')
      .setDescription('The ID of the user to unban')
      .setRequired(true))
  .addStringOption(opt =>
    opt.setName('reason')
      .setDescription('Reason for unbanning'))
  .addStringOption(opt =>
    opt.setName('reference')
      .setDescription('Case ID of the original ban (optional)'));

export async function execute(interaction) {
  const userId = interaction.options.getString('userid');
  const reason = interaction.options.getString('reason') || 'No reason provided';
  const referenceCaseId = interaction.options.getString('reference') || null;
  const caseId = `CASE${Date.now()}`;

  try {
    await interaction.guild.members.unban(userId, reason);
  } catch (err) {
    return interaction.reply({ content: `❌ Failed to unban user: ${err.message}`, ephemeral: true });
  }

  await Case.create({
    caseId,
    userId,
    username: 'Unknown#0000', // You can fetch user tag via client.users.fetch(userId) if needed
    type: 'Unban',
    reason,
    moderatorId: interaction.user.id,
    moderatorTag: interaction.user.tag,
    referenceCaseId
  });

  try {
    const user = await interaction.client.users.fetch(userId);
    await user.send(`✅ You were unbanned from **${interaction.guild.name}**.\nReason: ${reason}\nCase ID: ${caseId}`);
  } catch (err) {
    console.warn(`⚠️ Could not DM unbanned user ${userId}`);
  }

  await interaction.reply(`✅ Unbanned <@${userId}>.\nCase ID: \`${caseId}\``);
}
