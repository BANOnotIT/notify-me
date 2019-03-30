/**
 * Created by BANO.notIT on 28.03.19.
 */
const bot = require('./bot')
const { get } = require('./token')

const Busboy = require('busboy')
const Promise = require('bluebird')
const createError = require('http-errors')
const inspect = require('util').inspect

module.exports = (req, res) => {
  console.log(inspect(req.headers))

  getChatId(req)
    .then(id => {
      req.chat_id = id
      return req
    })
    .then(req => new Promise(resolve => {
      let busboy = new Busboy({ headers: req.headers })

      consumeIntoFilesFields(busboy, req)
        .then(resolve)

      req.pipe(busboy)
    }))
    .then(data => {
      console.log(data)
      res.statusCode = 200
      res.end(data.join('\n'))
    })
    .catch(e => {
      res.statusCode = e.status || 500
      res.end(e.stack)
    })
}

function consumeIntoFilesFields (busboy, req) {
  return new Promise(resolve => {
    let result = []
    let bearer = 0

    const done = () => result.length === bearer && resolve(result)

    busboy.on('file', (_, stream, filename) => {
      ++bearer
      pushFile(req, stream, filename)
        .then(a => {
          result.push(a)
          done()
        })
        .catch(e => {
          console.log(filename)
          stream.resume()
          result.push(`Error while sending file "${filename}": ${e.message}`)
        })
    })

    busboy.on('field', (field, text) => {
      ++bearer
      pushMessage(req, text, field)
        .then(a => {
          result.push(a)
          done()
        })
        .catch(e =>
          result.push(`Error while sending field "${field}": ${e.message}`)
        )
    })

    busboy.on('finish', done)
  })
}

function pushFile (request, stream, filename) {
  console.log(`Start sending ${filename}`)
  return bot.sendDocument(request.chat_id, stream, {}, { filename })
    .then(() => `Document "${filename}" sent!`)
}

function pushMessage (request, message, field = '') {
  return Promise.resolve(
    `*You've received* ${field}(${(new Date()).toLocaleString()}):\n${message}`
  )
    .then(text =>
      bot.sendMessage(request.chat_id, text, { parse_mode: 'Markdown' })
    )
    .then(() => `Notification "${field}" sent!`)
}

function getChatId (req) {
  if (!req.headers.hasOwnProperty('authorization')) {
    return Promise.reject(createError(401))
  }

  const auth = req.headers['authorization']

  if (auth.indexOf('Basic ') !== 0) {
    return Promise.reject(createError(401, 'Only Basic auth supported'))
  }

  let decoded
  try {
    decoded = Buffer.from(auth.split(' ')[1], 'base64')
      .toString('ascii')
  } catch (e) {
    return Promise.reject(createError(401, 'Bad base64'))
  }

  return get(decoded)
    .catch(e => {
      throw createError(400, `Key decryption failed: ${e.message}`)
    })
}
