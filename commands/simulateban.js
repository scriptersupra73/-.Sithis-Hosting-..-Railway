import { SlashCommandBuilder } from 'discord.js';
import Case from '../models/Case.js';

export const data = new SlashCommandBuilder()
  .setName('simulateban')
  .setDescription('Simulate a ban and log the case');

export async function execute(interaction) {
  const caseId = `CASE${Date.now()}`;

  await Case.create({
    caseId,
    userId: interaction.user.id,
    username: interaction.user.tag,
    type: 'Ban',
    reason: 'Simulated ban',
    moderatorId: interaction.user.id,
    moderatorTag: interaction.user.tag
  });

  try {
    await interaction.user.send(`⚠️ You were (simulated) banned.\nCase ID: ${caseId}`);
  } catch (err) {
    console.error(`❌ Could not DM ${interaction.user.tag}:`, err);
  }

  await interaction.reply({
    content: `✅ Simulated ban logged.\nCase ID: \`${caseId}\``,
    ephemeral: true
  });
}
