import { config } from 'dotenv'
import { configureSocket } from './config'
import { logServerPrompt } from './utils'
import express, { Request, Response } from 'express'
// Makes available process.env
config()
// Instantiates server
const server = express()
// Configures passport auth
require('./config/passport')
// Configures middleware
require('./middleware')(server)
// Configures services (routes)
require('./components')(server)

const port = Number(process.env.PORT) || 8000

// Wakes up server
const myServer = server.listen(port, () => logServerPrompt(port))

// Sanity check
server.get('/', (req: Request, res: Response) => {
  res.send('localhost listens and obeys')
})

// Instantiates Socket-IO instance
const io = require('socket.io')(myServer)
// Configure SocketIO
configureSocket(io)
