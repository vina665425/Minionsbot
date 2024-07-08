// Require the necessary discord.js classes
const { Client, Events, GatewayIntentBits} = require('discord.js');
const { token, originalVoiceChannelId, originalVoiceChannelId2 } = require('./config.json');
// eslint-disable-next-line no-unused-vars
const fs = require('fs');
require('console');

// Create a new client instance
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates, // Add intent for voice state
      ],
    });

// 儲存動態建立的語音頻道ID
const dynamicVoiceChannels = new Set();

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  if (message.content.startsWith('!')) {
    try {
      // eslint-disable-next-line no-undef
      const replyMessage = await handleCommand(message);
      if (replyMessage) {
        message.reply(replyMessage);
      }
    }
    catch (err) {
      console.error(err);
      message.reply('發生錯誤,指令處理失敗。');
    }
  }
});

client.on(Events.MessageDelete, (message) => {
  if (message.author.bot) return;
  console.log(`${message.author.username}刪除了${message.content}`);
});

client.on(Events.MessageUpdate, (message) => {
  if (message.author.bot) return;
  console.log(
    `${message.author.username}更新了${message.content}改為${message.reactions.message.content}`,
  );
});

// Listen for voice state update event
client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  // Check if the user joined the specified voice channel
  if (newState.channelId === originalVoiceChannelId && oldState.channelId !== originalVoiceChannelId) {
    const member = newState.member;
    const guild = newState.guild;
    const category = newState.channel.parent;

    // Get the permission settings of the category where the original voice channel is located
    const categoryPermissions = category.permissionOverwrites.cache;

    // Create new voice channel permission settings
    const newChannelPermissions = categoryPermissions.map((permission) => ({
      id: permission.id,
      allow: permission.allow,
      deny: permission.deny,
    }));

    // Create a new voice channel in the same category
    const newChannel = await guild.channels.create({
      name: `恐鬼症- ${member.user.displayName} `,
      type: 2, // 2 represents a voice channel
      parent: category,
      permissionOverwrites: newChannelPermissions,
    });

    // Move the user to the new voice channel
    await member.voice.setChannel(newChannel);

    // Add the ID of the newly created voice channel to the stored set
    dynamicVoiceChannels.add(newChannel.id);
  }

  // Check if the user switched from a dynamically created voice channel to another channel
  if (dynamicVoiceChannels.has(oldState.channelId) && newState.channelId !== oldState.channelId) {
    const channel = oldState.channel;
    if (channel.members.size === 0) {
      // If there are no other users in the channel, delete it
      try {
        await channel.delete();
        // Remove the channel ID from the stored set
        dynamicVoiceChannels.delete(channel.id);
      }
      catch (error) {
        console.error('刪除頻道時發生錯誤:', error);
      }
    }
  }
});

// Listen for voice state update event
client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  // Check if the user joined the specified voice channel
  if (newState.channelId === originalVoiceChannelId2 && oldState.channelId !== originalVoiceChannelId) {
    const member = newState.member;
    const guild = newState.guild;
    const category = newState.channel.parent;

    // Get the permission settings of the category where the original voice channel is located
    const categoryPermissions = category.permissionOverwrites.cache;

    // Create new voice channel permission settings
    const newChannelPermissions = categoryPermissions.map((permission) => ({
      id: permission.id,
      allow: permission.allow,
      deny: permission.deny,
    }));

    // Create a new voice channel in the same category
    const newChannel = await guild.channels.create({
      name: `PUBG- ${member.user.displayName}`,
      type: 2, // 2 represents a voice channel
      parent: category,
      permissionOverwrites: newChannelPermissions,
    });

    // Move the user to the new voice channel
    await member.voice.setChannel(newChannel);

    // Add the ID of the newly created voice channel to the stored set
    dynamicVoiceChannels.add(newChannel.id);
  }

  // Check if the user switched from a dynamically created voice channel to another channel
  if (dynamicVoiceChannels.has(oldState.channelId) && newState.channelId !== oldState.channelId) {
    const channel = oldState.channel;
    if (channel.members.size === 0) {
      // If there are no other users in the channel, delete it
      try {
        await channel.delete();
        // Remove the channel ID from the stored set
        dynamicVoiceChannels.delete(channel.id);
      }
      catch (error) {
        console.error('刪除頻道時發生錯誤:', error);
      }
    }
  }
});

// Log in to Discord with your client's token
client.login(token);