/**
 * Created by BANO.notIT on 28.03.19.
 */

const
  crypto = require('crypto')
const bs58 = require('bs58')

const
  algorithm = 'aes-192-cbc'
const key = crypto.scryptSync(process.env.ENC_PASSWORD || 'SimplePass', '$0meSaulte', 24)
const iv = Buffer.alloc(16, 0) // Initialization vector.

module.exports = {
  gen (data) {
    let buf = Buffer.alloc(8, 0)
    buf.writeInt32LE(data, 0)

    const cipher = crypto.createCipheriv(algorithm, key, iv)

    let result = Buffer.concat([
      cipher.update(buf),
      cipher.final()
    ])

    return bs58.encode(result)
  },
  get (data) {
    let buf = bs58.decode(data)

    const cipher = crypto.createDecipheriv(algorithm, key, iv)

    let result = Buffer.concat([
      cipher.update(buf),
      cipher.final()
    ])

    return result.readInt32LE(0)
  }
}
