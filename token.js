/**
 * Created by BANO.notIT on 28.03.19.
 */

const crypto = require('crypto')
const bs58 = require('bs58')
const crc32 = require('crc-32')

const PASS = getPassBuf()

module.exports = {
  gen (data) {
    const salt = crypto.randomBytes(4)
    const pass = xor(salt, PASS)

    let buf = Buffer.alloc(4)
    buf.writeInt32LE(data, 0)

    const enc = xor(buf, pass)

    return Promise.resolve(bs58.encode(enc) + ':' + bs58.encode(salt))
  },
  get (data) {
    try {
      let [buf, salt] = data.split(':')
      buf = bs58.decode(buf)
      salt = bs58.decode(salt)

      const pass = xor(salt, PASS)

      const result = xor(buf, pass)

      return Promise.resolve(result.readInt32LE(0))
    } catch (e) {
      return Promise.reject(e)
    }
  }
}

function xor (a, b) {
  let result = Buffer.alloc(a.length)

  for (let i = 0; i < a.length; i++) {
    result[i] = a[i] ^ b[i]
  }

  return result
}

function getPassBuf () {
  let pass = Buffer.alloc(4)
  pass.writeUInt32LE(
    crc32.str(process.env.ENC_PASSWORD),
    0
  )

  return pass
}
