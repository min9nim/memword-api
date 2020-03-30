const express = require('express')
const bodyParser = require('body-parser')
const apiRouter = require('./api-router')
const auth = require('./com/auth')
const { createContext } = require('./com/com')
const cors = require('cors')
const cookieParser = require('cookie-parser')

const server = express()

var corsOptions = {
  origin: function(origin, callback) {
    callback(null, true)
  },
}

server.use(cors(corsOptions))

// 쿠키파서
server.use(cookieParser())

// body 파서
server.use(bodyParser.json())

//
server.use(createContext)

// 인증체크
server.use('/api', auth)

// 라우터 등록
server.use('/api', apiRouter)

const PORT = process.env.PORT ? Number(process.env.PORT) : 3030
const HOST = '0.0.0.0'

server.listen(PORT, err => {
  if (err) throw err
  console.log(`> Server is running on http://${HOST}:${PORT}`)
})
