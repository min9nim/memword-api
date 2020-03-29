const mongoose = require('mongoose')

// 디비설정
const db = mongoose.connection
db.on('error', console.error)
db.once('open', function() {
  console.log('Connected to mongod server')
})

const dbcon = process.env.dburl

console.log('@@ 디비접속 문자열 : ' + dbcon)

try {
  mongoose.set('useUnifiedTopology', true)
  mongoose.set('useFindAndModify', false)
  mongoose.set('useCreateIndex', true)

  mongoose.connect(dbcon, { useCreateIndex: true, useNewUrlParser: true })
} catch (e) {
  console.log('DB 접속 오류')
  console.log(e)
}

module.exports = mongoose
