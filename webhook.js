/**
 * Created by BANO.notIT on 28.03.19.
 */

const bot = require('./bot')
const streamToString = require('stream-to-string')

module.exports = (req, res) => {
  streamToString(req, 'utf-8')
    .then(JSON.parse)
    .then(obj => bot.processUpdate(obj))

    .then(() => {
      res.status(200)
      res.end()
    })
    .catch(e => {
      res.status(500)
      res.end(e.response.body.description)
    })
  // .finally(() => res.end())
}
