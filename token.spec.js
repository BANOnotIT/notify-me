/**
 * Created by BANO.notIT on 28.03.19.
 */

const a = require('./token')

a.gen(15)
  .then(data => {
    console.log(data)
    return data
  })
  .then(a.get)
  .then(enc => {
    console.assert(enc === 15, 'passwords don\'t match')
  })
