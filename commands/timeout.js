import { SlashCommandBuilder } from 'discord.js';
import Case from '../models/Case.js';

export const data = new SlashCommandBuilder()
  .setName('timeout')
  .setDescription('Timeout a user and log the case')
  .addUserOption(opt => opt.setName('user').setDescription('User to timeout').setRequired(true))
  .addIntegerOption(opt => opt.setName('duration').setDescription('Duration in minutes').setRequired(true))
  .addStringOption(opt => opt.setName('reason').setDescription('Reason for timeout'));

export async function execute(interaction) {
  const target = interaction.options.getMember('user');
  const duration = interaction.options.getInteger('duration');
  const reason = interaction.options.getString('reason') || 'No reason provided';
  const caseId = `CASE${Date.now()}`;

  await Case.create({
    caseId,
    userId: target.id,
    username: target.user.tag,
    type: 'Timeout',
    reason,
    moderatorId: interaction.user.id,
    moderatorTag: interaction.user.tag
  });

  try {
    await target.timeout(duration * 60 * 1000, reason);
    await target.send(`⏱️ You were timed out in **${interaction.guild.name}** for ${duration} minutes.\nReason: ${reason}\nCase ID: ${caseId}`);
  } catch (err) {
    console.error(`❌ Could not DM ${target.user.tag}:`, err);
  }

  await interaction.reply(`✅ Timed out ${target.user.tag} for ${duration} minutes.\nCase ID: \`${caseId}\``);
}
