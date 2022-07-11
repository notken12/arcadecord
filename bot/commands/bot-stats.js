import { SlashCommandBuilder } from '@discordjs/builders';
import botApi from '../../server/bot/api.js';

export default {
  private: true,
  data: new SlashCommandBuilder()
    .setName('botstats')
    .setDescription('Check stats about the Arcadecord bot'),
  /** @param {import('discord.js').CommandInteraction} interaction */
  async execute(_config, interaction) {
    await interaction.deferReply({ ephemeral: true });

    const stats = await botApi.getBotStats();
    if (stats == null) {
      await interaction.reply('Error while fetching bot stats');
      return;
    }

    await interaction.editReply({
      content: `Server count: ${stats.totalGuilds}\nMember count: ${stats.totalMembers}`,
      ephemeral: true,
    });
  },
};
