const path = require('path')
const express = require('express')

const static = express.Router()

static.use(express.static('public'))
static.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'views/index.html'))
})

module.exports = static