/**
 * Created by BANO.notIT on 28.03.19.
 */
const bot = require('./bot')
const URL = require('url')
const { get } = require('token')
const streamToStr = require('stream-to-string')
const createError = require('http-errors')

function sendMessage (req) {
  return streamToStr(req, 'utf-8')
    .then(text =>
      text
        ? `**You've received** (${(new Date()).toLocaleString()}):\n${text}`
        : '**You\'ve asked to remind of something**'
    )
    .then(text => bot.sendMessage(req.chat_id, text))
    .then(() => 'Notification sent!')
}

function sendDocument (req) {
  return bot.sendDocument(req.chat_id, req)
    .then(() => 'Document sent!')
}

module.exports = (req, res) => {
  let result = Promise.reject(createError(500, 'Unsupported Content-Type'))

  let { query: { token = null } } = new URL(req.url, true)

  if (!token) {
    result = Promise.reject(createError(401))
  } else {
    req.chat_id = get(token)
  }

  switch (req.headers['content-type']) {
    case 'text/markdown; charset=UTF-8':
      result = sendMessage(req)
      break

    case 'application/octet-stream':
      result = sendDocument(req)
      break
  }

  result
    .catch(e => {
      res.status(e.status || 500)
      res.end(e.toString())
    })
    .then(data => {
      res.status(200)
      res.end(data)
    })
}
