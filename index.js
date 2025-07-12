const express = require("express")
const mongoose = require("mongoose")
const { username, password } = require("./config")
const authRouter = require("./routes/authRoutes")
const PORT = process.env.PORT || 5001

const app = express()

app.use(express.json())
app.use("/auth", authRouter)

const start = async () => {
  try {
    await mongoose.connect(`mongodb+srv://${username}:${password}@cluster0.esbqxoa.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`)
    app.listen(PORT, () => console.log(`Server started on port: ${PORT}`))
  } catch (e) {
    console.log(e)
  }
}

start()
