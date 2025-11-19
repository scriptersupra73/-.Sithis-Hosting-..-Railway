import { SlashCommandBuilder } from 'discord.js';
import Case from '../models/Case.js';

export const data = new SlashCommandBuilder()
  .setName('timeout')
  .setDescription('Timeout a member')
  .addUserOption(option =>
    option.setName('target').setDescription('User to timeout').setRequired(true))
  .addIntegerOption(option =>
    option.setName('duration').setDescription('Duration in minutes').setRequired(true))
  .addStringOption(option =>
    option.setName('reason').setDescription('Reason for timeout').setRequired(true));

export async function execute(interaction) {
  const target = interaction.options.getUser('target');
  const duration = interaction.options.getInteger('duration');
  const reason = interaction.options.getString('reason');
  const member = await interaction.guild.members.fetch(target.id);

  try {
    // DM the user
    await target.send(
      `⏳ You have been timed out in **${interaction.guild.name}** by **${interaction.user.tag}**\n\n` +
      `**Reason:** ${reason}\n` +
      `**Duration:** ${duration} minutes`
    );
  } catch (err) {
    console.warn(`⚠️ Could not DM ${target.tag}`);
  }

  // Apply timeout
  const ms = duration * 60 * 1000;
  await member.timeout(ms, reason);

  // Log to DB
  await Case.create({
    caseId: `CASE${Date.now()}`,
    userId: target.id,
    moderatorId: interaction.user.id,
    action: 'Timeout',
    reason
  });

  await interaction.reply({ content: `✅ ${target.tag} has been timed out for ${duration} minutes.`, ephemeral: true });
}
