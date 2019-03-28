/**
 * Created by BANO.notIT on 28.03.19.
 */
const TelegramBot = require('node-telegram-bot-api')

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN)

module.exports = bot

bot.on('message', msg => {
  const chatId = msg.chat.id
  const message = `Hi there
${Date.now()}
`

  bot.sendMessage(chatId,
    message
  )
})
