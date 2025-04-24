const express = require('express');
const cors = require('cors')
const cloudinary = require("cloudinary");
const mongoose = require('mongoose')
const app = express()

const jobsRouter = require('./src/controllers/jobs')
const userRouter = require('./src/controllers/users')
const { logger, errorHandler } = require('./src/lib/middleware')

// Middleware
app.use(cors())
app.use(express.json())
app.use(logger)

// MongoDB config
mongoose.set('strictQuery', false)
mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('connected to MongoDB')
})
.catch(error => {
  console.log('error connecting to MongoDB:', error.message)
})

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Routes
app.use('/api/jobs', jobsRouter)
app.use('/api/users', userRouter)

// Error handling middleware
app.use(errorHandler)

module.exports = app
