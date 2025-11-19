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

// load all safely
const commandsPath = path.join(process.cwd(), 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = await import(`./commands/${file}`);
  if (!command.data || !command.data.name) {
    console.warn(`⚠️ Skipping ${file} — missing data or name`);
    continue;
  }
  client.commands.set(command.data.name, command);
}

// bot ready
client.once('ready', () => {
  console.log(`🤖 Sithis is online as ${client.user.tag}`);
});

// handler
client.on('interactionCreate', async interaction => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
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

    // optional
  }
});

// welcome
client.on('guildMemberAdd', async member => {
  const channelId = '1440498648482975857';
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

// conect
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    client.login(process.env.TOKEN);
  })
  .catch(err => console.error('❌ MongoDB connection failed:', err));
