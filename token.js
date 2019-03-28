/**
 * Created by BANO.notIT on 28.03.19.
 */

const
  crypto = require('crypto')
const bs58 = require('bs58')

const algorithm = 'aes128'

module.exports = {
  gen (data) {
    let buf = Buffer.alloc(8, 0)
    buf.writeInt32LE(data, 0)

    const cipher = crypto.createCipher(algorithm, process.env.ENC_PASSWORD)

    let result = Buffer.concat([
      cipher.update(buf),
      cipher.final()
    ])

    return Promise.resolve(bs58.encode(result))
  },
  get (data) {
    try {
      let buf = bs58.decode(data)
      console.log(':1:', buf)
      const cipher = crypto.createDecipher(algorithm, process.env.ENC_PASSWORD)

      let result = Buffer.concat([
        cipher.update(buf),
        cipher.final()
      ])

      console.log(':2:', result)
      return Promise.resolve(result.readInt32LE(0))
    } catch (e) {
      return Promise.reject(e)
    }
  }
}
