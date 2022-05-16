// interactionCreate.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

export default {
  name: 'interactionCreate',
  once: false,
  async execute(config, interaction) {
    var client = interaction.client;
    if (interaction.isCommand()) {
      const command = client.commands.get(interaction.commandName);

      if (!command) return;

      try {
        await command.execute(config, interaction);
      } catch (error) {
        console.error(error);
        await interaction
          .reply({
            content: 'There was an error while executing this command!',
            ephemeral: true,
          })
          .catch(console.error);
      }
    } else if (interaction.isSelectMenu()) {
      const menu = client.selectMenus.get(interaction.customId);

      if (!menu) return;

      try {
        await menu.execute(config, interaction);
      } catch (error) {
        console.error(error);
        await interaction
          .reply({
            content: 'There was an error while executing this command!',
            ephemeral: true,
          })
          .catch(console.error);
      }
    } else if (interaction.isButton()) {
      let button = client.buttons.get(interaction.customId);

      if (!button) {
        button = client.buttons.find(
          (b) => b.data.matcher && interaction.customId.match(b.data.matcher)
        );
        if (!button) return;
      }

      try {
        await button.execute(config, interaction);
      } catch (error) {
        console.error(error);
        await interaction
          .reply({
            content: 'There was an error while executing this command!',
            ephemeral: true,
          })
          .catch(console.error);
      }
    }
  },
};
