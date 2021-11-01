module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute(interaction) {

        var client = interaction.client;
        if (interaction.isCommand()) {

            const command = client.commands.get(interaction.commandName);

            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        } else if (interaction.isSelectMenu()) {
            const menu = client.selectMenus.get(interaction.customId);

            if (!menu) return;

            try {
                await menu.execute(interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        } else if (interaction.isButton()) {
            const button = client.buttons.get(interaction.customId);

            if (!button) return;

            try {
                await button.execute(interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
    },
};