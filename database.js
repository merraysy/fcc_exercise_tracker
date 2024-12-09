const mongoose = require('mongoose')
const { formatDate } = require('./utils')

mongoose.connect(process.env.MONGO_URI)

const userNameType = {
  type: String,
  validate: {
    validator: (value) => value.length <= 24,
    message: 'Username length is more than 12 characters.'
  },
};

const userSchema = new mongoose.Schema({
  username: userNameType,
})

const exerciseSchema = new mongoose.Schema({
  username: userNameType,
  description: {
    type: String,
    validate: {
      validator: (value) => value.length <= 120,
      message: 'Description length is more than 120 characters.'
    },
  },
  duration: {
    type: Number,
    validate: {
      validator: (value) => value <= 120,
      message: 'Duration is more than 120 minutes.'
    },
  },
  date: Date,
})

const logSchema = new mongoose.Schema({
  username: userNameType,
  count: Number,
  log: [exerciseSchema.omit(['username'])]
})

const User = mongoose.model('User', userSchema)
const Exercise = mongoose.model('Exercise', exerciseSchema)
const Log = mongoose.model('Log', logSchema)

async function getAllUsers(done) {
  try {
    const data = await User.find({})

    done(null, data)
  } catch (error) {
    done(error, null)
  }
}

async function createNewUser(username, done) {
  try {
    const [data] = await User.create([{ username }])

    done(null, data)
  } catch (error) {
    done(error, null)
  }
}

async function getAllExercises(done) {
  try {
    const [data] = await Exercise.find({})

    done(null, data)
  } catch (error) {
    done(error, null)
  }
}

async function createNewExercise(userId, body, done) {
  try {
    const user = await User.findById(userId)

    if (!user) return done(new Error('User not found.'), null)

    const [data] = await Exercise.create([
      {
        username: user.username,
        description: body?.description,
        duration: body?.duration,
        date: body?.date || new Date().toDateString(),
      },
    ])

    done(null, {
      username: user.username,
      _id: user._id,
      description: data.description,
      duration: data.duration,
      date: formatDate(data.date),
    })
  } catch (error) {
    done(error, null)
  }
}

async function getUserLogs(userId, options = {}, done) {
  try {
    const { from, to, limit = 0 } = options;
    const user = await User.findById(userId)

    if (!user) return done(new Error('User not found.'), null)

    const exercises = await Exercise
      .find({
        username: user.username,
        ...(from ? { date: { $gte: new Date(from), $lt: to ? new Date(to) : Date.now() } } : {})
      })
      .lean(true)
      .limit(limit)
      .select(['-_id', 'description', 'duration', 'date'])
      .exec()

    done(null, {
      username: user.username,
      count: exercises.length,
      log: exercises.map((exercise) => ({
        ...exercise,
        date: formatDate(exercise.date)
      })),
    })
  } catch (error) {
    done(error, null)
  }
}

module.exports.default = mongoose
module.exports.mongoose = mongoose
module.exports.User = User
module.exports.Exercise = Exercise
module.exports.Log = Log
module.exports.getAllUsers = getAllUsers
module.exports.createNewUser = createNewUser
module.exports.getAllExercises = getAllExercises
module.exports.createNewExercise = createNewExercise
module.exports.getUserLogs = getUserLogs