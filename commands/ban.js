import { SlashCommandBuilder } from 'discord.js';
import Case from '../models/Case.js';

export const data = new SlashCommandBuilder()
  .setName('ban')
  .setDescription('Ban a member')
  .addUserOption(option =>
    option.setName('target').setDescription('User to ban').setRequired(true))
  .addStringOption(option =>
    option.setName('reason').setDescription('Reason for ban').setRequired(true));

export async function execute(interaction) {
  const target = interaction.options.getUser('target');
  const reason = interaction.options.getString('reason');
  const member = await interaction.guild.members.fetch(target.id);

  try {
    // dm the user before bam
    await target.send(
      `⚠️ You have been banned.\n\n` +
      `You were banned from **${interaction.guild.name}** by **${interaction.user.tag}**\n\n` +
      `**Reason:** ${reason}\n\n` +
      `📨 Appeal:\nIf you believe this was in error, you may submit an appeal by sending \`/appeal\` to me in DMs. Include your case number and any relevant information.`
    );
  } catch (err) {
    console.warn(`⚠️ Could not DM ${target.tag}`);
  }

  await member.ban({ reason });

  // Log to DB
  await Case.create({
    caseId: `CASE${Date.now()}`,
    userId: target.id,
    moderatorId: interaction.user.id,
    action: 'Ban',
    reason
  });

  await interaction.reply({ content: `✅ ${target.tag} has been banned.`, ephemeral: true });
}
