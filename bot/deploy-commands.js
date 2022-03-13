import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import { config } from 'dotenv'

config()

import { readdirSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)

// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename)

const commands = []
const commandFiles = readdirSync(__dirname + '/commands').filter((file) =>
  file.endsWith('.js')
)

for (const file of commandFiles) {
  const { default: command } = await import(`./commands/${file}`)
  commands.push(command.data.toJSON())
}

const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN)

rest
  .put(Routes.applicationCommands(process.env.BOT_CLIENT_ID), {
    body: commands,
  })
  .then((res) => {
    console.log(res)
    console.log('Successfully registered application commands.')
  })
  .catch(console.error)
