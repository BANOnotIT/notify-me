/**
 * Created by BANO.notIT on 28.03.19.
 */
const bot = require('./bot')
const { get: getChatId } = require('./token')

const { parse } = require('url')
const streamToStr = require('stream-to-string')
const Busboy = require('busboy')
const EventEmitter = require('events')

class Sender extends EventEmitter {
  constructor (request) {
    super()
    this.request = request
    this.in_progress = 0
    this.results = []

    this.on('done', () => {
      console.log(this.in_progress)
      if (this.in_progress === 0) {
        this.emit('finish', this.results)
      }
    })
  }

  pushFile (stream, filename) {
    ++this.in_progress
    bot.sendDocument(this.request.chat_id, this.request)
      .then(() => `Document ${filename} sent!`)
      .then(this.results.push.bind(this))
      .then(() => {
        --this.in_progress
        this.emit('done')
      })

      .catch(this.emit.bind(this, 'error'))
  }

  pushMessage (message, field = '') {
    ++this.in_progress
    streamToStr(this.request, 'utf-8')
      .then(text => text
        ? `**You've received** (${(new Date()).toLocaleString()}):\n${text}`
        : '**You\'ve asked to remind of something**'
      )
      .then(text => bot.sendMessage(this.request.chat_id, text))
      .then(() => `Notification ${field} sent!`)
      .then(this.results.push.bind(this))
      .then(() => {
        --this.in_progress
        this.emit('done')
      })

      .catch(this.emit.bind(this, 'error'))
  }
}

module.exports = (req, res) => {
  let { query: { token = null } } = parse(req.url, true)

  getChatId(token)
    .then(id => {
      req.chat_id = id
      return req
    })
    .then(req =>
      new Promise((resolve, reject) => {
        let processor = new Sender(req)
        try {
          let busboy = new Busboy({ headers: req.headers })
          processor.on('finish', resolve)
          processor.on('error', reject)

          busboy.on('file', (_, file, name) => processor.pushFile(file, name))
          busboy.on('field', (_, text) => processor.pushMessage(text))
          busboy.on('finish', () => processor.emit.bind('done'))
        } catch (e) {
          return reject(e)
        }
      })
    )

    .then(data => {
      res.statusCode = 200
      data.forEach(a => {
        console.log(a.constructor.toString())
      })
      res.end(data.join('\n'))
    })
    .catch(e => {
      res.statusCode = e.status || 500
      res.end(e.stack)
    })
}
