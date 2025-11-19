import { SlashCommandBuilder } from 'discord.js';
import Case from '../models/Case.js';

export const data = new SlashCommandBuilder()
  .setName('warn')
  .setDescription('Warn a user and log the case')
  .addUserOption(opt => opt.setName('user').setDescription('User to warn').setRequired(true))
  .addStringOption(opt => opt.setName('reason').setDescription('Reason for warning'));

export async function execute(interaction) {
  const target = interaction.options.getUser('user');
  const reason = interaction.options.getString('reason') || 'No reason provided';
  const caseId = `CASE${Date.now()}`;

  await Case.create({
    caseId,
    userId: target.id,
    username: target.tag,
    type: 'Warn',
    reason,
    moderatorId: interaction.user.id,
    moderatorTag: interaction.user.tag
  });

  try {
    await target.send(`⚠️ You were warned in **${interaction.guild.name}**.\nReason: ${reason}\nCase ID: ${caseId}`);
  } catch (err) {
    console.error(`❌ Could not DM ${target.tag}:`, err);
  }

  await interaction.reply(`✅ Warned ${target.tag}.\nCase ID: \`${caseId}\``);
}
