import { Client, GatewayIntentBits, Collection, Partials } from 'discord.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel]
});

client.commands = new Collection();

// 🔁 Load all command files dynamically
const commandsPath = path.join(process.cwd(), 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

(async () => {
  for (const file of commandFiles) {
    const command = await import(`./commands/${file}`);
    if (!command.data || !command.data.name) {
      console.warn(`⚠️ Skipping ${file} — missing data or name`);
      continue;
    }
    client.commands.set(command.data.name, command);
  }
})();

// ✅ Bot ready
client.once('ready', () => {
  console.log(`🤖 Sithis is online as ${client.user.tag}`);
});

// 🧠 Handle interactions
client.on('interactionCreate', async interaction => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`❌ Error executing ${interaction.commandName}:`, error);
      await interaction.reply({ content: '❌ Error executing command.', ephemeral: true });
    }
  }

  if (interaction.isStringSelectMenu() && interaction.customId === 'appeal_select') {
    const selected = interaction.values[0]; // e.g., "Ban_CASE123456"
    const [type, caseId] = selected.split('_');

    await interaction.reply({
      content: `✅ Appeal submitted for **${type}** case \`${caseId}\`. A moderator will review it.`,
      ephemeral: true
    });

    // Optional: log appeal to DB or mod channel
  }
});

// 👋 Welcome new members with cinematic embed
client.on('guildMemberAdd', async member => {
  const channelId = '1440498648482975857'; // Replace with your actual welcome channel ID
  const channel = member.guild.channels.cache.get(channelId);
  if (!channel) return;

  const memberCount = member.guild.memberCount;
  const welcomeText = `Welcome <@${member.id}> to **Sithis**.\nYou are the **${memberCount}ᵗʰ** soul to be judged.`;

  const embed = {
    color: 0x8b0000,
    image: {
      url: 'https://i.imgur.com/lhP0PcE.jpeg'
    }
  };

  await channel.send({ content: welcomeText, embeds: [embed] });
});

// 🔗 Connect to MongoDB and login
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    client.login(process.env.TOKEN);
  })
  .catch(err => console.error('❌ MongoDB connection failed:', err));
