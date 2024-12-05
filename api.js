const express = require('express')
const bodyParser = require('body-parser')

const {
  getAllUsers,
  createNewUser,
  getAllExercises,
  createNewExercise,
  getUserLogs,
} = require('./database')

const api = express.Router()

api.use(bodyParser.urlencoded({ extended: false }))

api.get('/users', function (req, res) {
  getAllUsers(function (error, data) {
    res.json({
      error,
      data,
    })
  })
})

api.post('/users', function (req, res) {
  if (req.body.username) {
    createNewUser(req.body.username, function (error, data) {
      res.json({
        error,
        data,
      })
    })
  }
})

api.get('/users/exercises', function (req, res) {
  getAllExercises(function (error, data) {
    res.json({
      error,
      data,
    })
  })
})

api.post('/users/:_id/exercises', function (req, res) {
  if (req.body.description && req.body.duration) {
    createNewExercise(req.params._id, req.body, function (error, data) {
      res.json({
        error,
        data,
      })
    })
  }
})

api.get('/users/:_id/logs', function (req, res) {
  getUserLogs(req.params._id, req.query, function (error, data) {
    res.json({
      error,
      data,
    })
  })
})

module.exports = api