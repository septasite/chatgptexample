import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import http from 'http'
import OpenAI from 'openai'
import { Server } from 'socket.io'

const app = express()
const server = http.createServer(app)
const port = 5599

app.use(cors())

server.listen(port, () => {
  console.log(`server listening on ${port}`)
})

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const io = new Server(server, {
  path: '/api/socket.io',
  cookie: false,
  cors: { credentials: true, origin: true },
})

const chatHistory = []
io.on('connection', (socket) => {
  socket.on('sendMessage', async (data) => {
    console.log('message from client: ', data.message)

    chatHistory.push({ role: 'user', content: data.message })
    const { choices } = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: chatHistory,
    })

    socket.emit('receiveMessage', {
      message: `${choices[0].message}`,
    })
    chatHistory.push(choices[0].message)
  })

  socket.on('disconnect', () => {
    console.log('socket disconnect')
  })
})
