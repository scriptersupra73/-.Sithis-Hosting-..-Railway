
    await interaction.reply({
      content: `✅ Appeal submitted for **${type}** case \`${caseId}\`. A moderator will review it.`,
      ephemeral: true
    });

    // Optional: log appeal to DB or mod channel
  }
});

// 👋 Welcome new members with cinematic embed
client.on('guildMemberAdd', async member => {
  const channelId = '1360817411976335381'; 
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
