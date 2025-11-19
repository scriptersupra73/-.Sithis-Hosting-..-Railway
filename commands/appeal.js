import { SlashCommandBuilder } from 'discord.js';
import Case from '../models/Case.js';

export const data = new SlashCommandBuilder()
  .setName('appeal')
  .setDescription('Submit an appeal for a mod action')
  .setDMPermission(true); // enable dm use

export async function execute(interaction) {
  const userId = interaction.user.id;
  const userCases = await Case.find({ userId }).sort({ timestamp: -1 });

  if (!userCases || userCases.length === 0) {
    return interaction.reply({ content: '❌ No mod actions found to appeal.', ephemeral: true });
  }

  const caseOptions = userCases.map((log, i) => ({
    label: `${log.type} - ${log.reason || 'No reason'} (${log.caseId})`,
    value: `${log.type}_${log.caseId}`
  }));

  await interaction.reply({
    content: '📜 Select a case to appeal:',
    components: [{
      type: 1,
      components: [{
        type: 3,
        custom_id: 'appeal_select',
        options: caseOptions.slice(0, 25)
      }]
    }],
    ephemeral: true
  });
}
