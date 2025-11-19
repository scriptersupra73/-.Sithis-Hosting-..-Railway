import { SlashCommandBuilder } from 'discord.js';
import Case from '../models/Case.js';

export const data = new SlashCommandBuilder()
  .setName('warn')
  .setDescription('Warn a member')
  .addUserOption(option =>
    option.setName('target').setDescription('User to warn').setRequired(true))
  .addStringOption(option =>
    option.setName('reason').setDescription('Reason for warning').setRequired(true));

export async function execute(interaction) {
  const target = interaction.options.getUser('target');
  const reason = interaction.options.getString('reason');

  try {
    // DM the user
    await target.send(
      `⚠️ You have been warned in **${interaction.guild.name}** by **${interaction.user.tag}**\n\n` +
      `**Reason:** ${reason}`
    );
  } catch (err) {
    console.warn(`⚠️ Could not DM ${target.tag}`);
  }

  // Log to DB
  await Case.create({
    caseId: `CASE${Date.now()}`,
    userId: target.id,
    moderatorId: interaction.user.id,
    action: 'Warn',
    reason
  });

  await interaction.reply({ content: `✅ ${target.tag} has been warned.`, ephemeral: true });
}
