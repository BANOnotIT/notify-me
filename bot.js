/**
 * Created by BANO.notIT on 28.03.19.
 */
const TelegramBot = require('node-telegram-bot-api')
const { gen } = require('./token')

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN)

module.exports = bot

bot.on('message', msg => {
  const chatId = msg.chat.id

  gen(chatId)
    .then(token => {
      const message = `Hi there!\nYour token is \`${token}\``
      return bot.sendMessage(chatId, message, { parse_mode: 'Markdown' })
    })
    .then(() => bot.emit('message_sent'))
    .catch(e => bot.emit('message_error', e))
})
