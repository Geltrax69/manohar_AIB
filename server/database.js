const mongoose = require('mongoose')

// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/linguadev'
    )
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
    return true
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`)
    console.log('⚠️  Using in-memory storage as fallback')
    
    // Disable mongoose buffering to prevent timeout errors
    mongoose.set('bufferCommands', false)
    mongoose.set('bufferTimeoutMS', 0)
    
    return false
  }
}

module.exports = connectDB
