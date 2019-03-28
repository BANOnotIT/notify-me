/**
 * Created by BANO.notIT on 28.03.19.
 */

const bot = require('./bot')
const streamToString = require('stream-to-string')

module.exports = (req, res) => {
  streamToString(req, 'utf-8')
    .then(JSON.parse)
    .then(obj => bot.processUpdate(obj))

  bot.once('message_sent', () => {
    res.statusCode = 200
    res.end()
  })

  bot.once('message_error', e => {
    res.statusCode = 500
    // res.statusMessage =
    res.end(e.response.body.description)
  })
}
