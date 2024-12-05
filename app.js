const express = require('express')
const cors = require('cors')

const static = require('./static')
const api = require('./api')

const app = express()

app.use(cors())
app.use('/', static)
app.use('/api', api)

module.exports = app